/* Host timing for the camera's 32 Hz Normal stream (agent 42.74; agent 42.79 added the "anchor" line with
 * CLOCK_MONOTONIC and CLOCK_REALTIME at t0, and the optional credit hold: CREDIT_SCHED=<file> of "<from_s> <hold_ms>"
 * lines holds each credit until <hold_ms> after the frame's last byte, logged as "hold" in the credit line).
 *
 * The camera is already initialised and streaming (fdinit.mjs ran the checker's connect and exited without a stop).
 * Two host modes, same credit (control OUT 0x53, wValue 0, wIndex 0, data 00 82 00 00 = 0x8200, 66560 bytes):
 *
 *   S  serial: one bulk IN in flight. Each completed bulk transfer is resubmitted at once (within a frame). At the
 *      frame's last byte the next credit goes out, and the next bulk IN is submitted only when that credit completes.
 *      This is the checker's and the tight C loop's shape (42.65), with the library call split into async parts.
 *   P<K> pipelined: K bulk INs always in flight, resubmitted at each completion, including across the frame boundary.
 *      The credit goes out at the frame's last byte, as in S. Nothing else differs.
 *
 * Every bulk completion (time, length, bytes already in the frame), every credit (submit and complete time), and every
 * frame (header capture index, status, completion time) is one JSON line. Times are ms from the start of streaming.
 *
 * build: clang -O2 -Wall -I/opt/homebrew/include -L/opt/homebrew/lib -lusb-1.0 -o fdtime fdtime.c
 * run:   ./fdtime <S|P> <K> <seconds> <out.jsonl>          (CREDIT_SCHED=<file> ./fdtime ... for the hold)
 */
#include <libusb-1.0/libusb.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define FRAME_HW 0x8200
#define FRAME_BYTES (FRAME_HW * 2)
#define MAXK 8
#define REQ_IMAGE_DATA 0x53
#define REQ_SET_OPERATION_MODE 0x3c
#define EP_FRAME_IN 0x81

typedef struct {
    struct libusb_transfer *xfer;
    unsigned char *buf;
    double t_submit;
    int slot;
} slot_t;

static libusb_context *ctx;
static libusb_device_handle *h;
static FILE *out;
static double t0;
static int serial_mode = 1, K = 1;
static slot_t slots[MAXK];
static unsigned char frame[FRAME_BYTES];
static int frame_got = 0;
static int frames = 0, errors = 0, credits = 0;
static int stopping = 0, credit_pending = 0, credit_inflight = 0, bulk_inflight = 0;
static unsigned char credit_buf[LIBUSB_CONTROL_SETUP_SIZE + 4];
static struct libusb_transfer *credit_xfer;
static double t_credit_submit;

static double now_ms(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (double)ts.tv_sec * 1000.0 + (double)ts.tv_nsec / 1e6 - t0;
}

/* agent 79: optional credit-delay schedule (env CREDIT_SCHED=<file> with lines "<from_s> <delay_ms>"): the credit
 * for the next frame is held until <delay_ms> after the frame's last byte. Logged in each credit line as "hold". */
#define MAXSCHED 256
static double sched_from[MAXSCHED], sched_delay[MAXSCHED];
static int nsched = 0;
static double t_frame_done = 0;
static double cur_hold(void) {
    double s = now_ms() / 1000.0, d = 0;
    int i;
    for (i = 0; i < nsched; i++)
        if (s >= sched_from[i]) d = sched_delay[i];
    return d;
}
static void load_sched(void) {
    const char *p = getenv("CREDIT_SCHED");
    FILE *f;
    if (!p) return;
    f = fopen(p, "r");
    if (!f) { fprintf(stderr, "cannot read %s\n", p); exit(7); }
    while (nsched < MAXSCHED && fscanf(f, "%lf %lf", &sched_from[nsched], &sched_delay[nsched]) == 2) nsched++;
    fclose(f);
}

static unsigned hw(const unsigned char *b, int i) {
    return (unsigned)b[2 * i] | ((unsigned)b[2 * i + 1] << 8);
}

static void bulk_cb(struct libusb_transfer *x);

static void submit_bulk(slot_t *s) {
    int r;
    s->t_submit = now_ms();
    libusb_fill_bulk_transfer(s->xfer, h, EP_FRAME_IN, s->buf, FRAME_BYTES, bulk_cb, s, 0);
    r = libusb_submit_transfer(s->xfer);
    if (r != 0) {
        fprintf(out, "{\"ev\":\"submit_error\",\"t\":%.3f,\"msg\":\"%s\"}\n", now_ms(), libusb_error_name(r));
        errors++;
    } else {
        bulk_inflight++;
    }
}

static void bulk_cb(struct libusb_transfer *x) {
    slot_t *s = x->user_data;
    double t = now_ms();
    int resubmit = 1;

    bulk_inflight--;
    if (x->status == LIBUSB_TRANSFER_COMPLETED) {
        int a = x->actual_length;
        int room = FRAME_BYTES - frame_got;
        fprintf(out, "{\"ev\":\"bulk\",\"t\":%.3f,\"slot\":%d,\"sub\":%.3f,\"len\":%d,\"got_before\":%d}\n",
                t, s->slot, s->t_submit, a, frame_got);
        if (a > 0) {
            if (a > room) a = room; /* never expected; the surplus is logged below */
            memcpy(frame + frame_got, x->buffer, a);
            frame_got += a;
        }
        if (x->actual_length > room) {
            fprintf(out, "{\"ev\":\"overrun\",\"t\":%.3f,\"len\":%d}\n", t, x->actual_length);
            errors++;
        }
        if (frame_got >= FRAME_BYTES) {
            fprintf(out, "{\"ev\":\"frame\",\"t\":%.3f,\"n\":%d,\"idx\":%u,\"type\":%u}\n", t, frames,
                    hw(frame, 1), hw(frame, 842));
            frames++;
            frame_got = 0;
            credit_pending = 1;
            t_frame_done = t;
            if (serial_mode) resubmit = 0; /* the next bulk IN waits for the credit */
        }
    } else if (x->status == LIBUSB_TRANSFER_CANCELLED) {
        resubmit = 0;
    } else {
        fprintf(out, "{\"ev\":\"bulk_error\",\"t\":%.3f,\"status\":%d}\n", t, (int)x->status);
        errors++;
        resubmit = 0;
    }
    if (resubmit && !stopping) submit_bulk(s);
}

static void credit_cb(struct libusb_transfer *x) {
    double t = now_ms();
    credit_inflight = 0;
    fprintf(out, "{\"ev\":\"credit\",\"sub\":%.3f,\"t\":%.3f,\"status\":%d,\"hold\":%.3f}\n", t_credit_submit, t,
            (int)x->status, nsched ? cur_hold() : 0.0);
    if (x->status != LIBUSB_TRANSFER_COMPLETED) errors++;
    credits++;
    if (serial_mode && !stopping) submit_bulk(&slots[0]);
}

static void submit_credit(void) {
    int r;
    unsigned char data[4] = {0x00, 0x82, 0x00, 0x00};
    libusb_fill_control_setup(credit_buf, 0x41, REQ_IMAGE_DATA, 0, 0, 4);
    memcpy(credit_buf + LIBUSB_CONTROL_SETUP_SIZE, data, 4);
    libusb_fill_control_transfer(credit_xfer, h, credit_buf, credit_cb, NULL, 1000);
    t_credit_submit = now_ms();
    r = libusb_submit_transfer(credit_xfer);
    if (r != 0) {
        fprintf(out, "{\"ev\":\"credit_submit_error\",\"t\":%.3f,\"msg\":\"%s\"}\n", now_ms(), libusb_error_name(r));
        errors++;
    } else {
        credit_inflight = 1;
    }
    credit_pending = 0;
}

int main(int argc, char **argv) {
    double seconds;
    const char *outpath;
    int i, r;
    struct timespec ts0;
    struct libusb_device *dev;

    if (argc < 5) {
        fprintf(stderr, "usage: fdtime <S|P> <K> <seconds> <out.jsonl>\n");
        return 1;
    }
    serial_mode = argv[1][0] == 'S';
    K = atoi(argv[2]);
    if (serial_mode) K = 1;
    if (K < 1 || K > MAXK) { fprintf(stderr, "K 1..%d\n", MAXK); return 1; }
    seconds = atof(argv[3]);
    outpath = argv[4];

    out = fopen(outpath, "w");
    if (!out) { fprintf(stderr, "cannot write %s\n", outpath); return 6; }
    if (libusb_init(&ctx) != 0) { fprintf(stderr, "libusb_init failed\n"); return 2; }
    h = libusb_open_device_with_vid_pid(ctx, 0x289d, 0x0010);
    if (!h) { fprintf(stderr, "no Compact camera (0x289d:0x0010) open\n"); return 3; }
    r = libusb_claim_interface(h, 0);
    if (r != 0) { fprintf(stderr, "claim_interface: %s\n", libusb_error_name(r)); return 4; }
    dev = libusb_get_device(h);
    fprintf(out, "{\"ev\":\"meta\",\"mode\":\"%s\",\"K\":%d,\"seconds\":%.1f,\"speed\":%d}\n",
            serial_mode ? "S" : "P", K, seconds, libusb_get_device_speed(dev));

    clock_gettime(CLOCK_MONOTONIC, &ts0);
    t0 = (double)ts0.tv_sec * 1000.0 + (double)ts0.tv_nsec / 1e6;
    {
        struct timespec rt;
        clock_gettime(CLOCK_REALTIME, &rt);
        /* agent 79: absolute anchors, so other processes' CLOCK_MONOTONIC marks can be aligned */
        fprintf(out, "{\"ev\":\"anchor\",\"mono0_ms\":%.3f,\"real0_s\":%.6f}\n", t0,
                (double)rt.tv_sec + (double)rt.tv_nsec / 1e9);
        fflush(out);
    }

    for (i = 0; i < K; i++) {
        slots[i].buf = malloc(FRAME_BYTES);
        slots[i].xfer = libusb_alloc_transfer(0);
        slots[i].slot = i;
        slots[i].xfer->user_data = &slots[i];
    }
    credit_xfer = libusb_alloc_transfer(0);

    load_sched();
    {
        struct timeval tv = {0, nsched ? 50 : 500};
        /* first credit at once; in P mode the K bulk INs go out with it */
        credit_pending = 1;
        submit_credit();
        if (!serial_mode) {
            for (i = 0; i < K; i++) submit_bulk(&slots[i]);
        }
        while (1) {
            int completed = 0;
            if (!stopping && now_ms() > seconds * 1000.0) {
                stopping = 1;
                fprintf(out, "{\"ev\":\"stop\",\"t\":%.3f}\n", now_ms());
                for (i = 0; i < K; i++) libusb_cancel_transfer(slots[i].xfer);
                if (credit_inflight) libusb_cancel_transfer(credit_xfer);
            }
            if (!stopping && credit_pending && !credit_inflight &&
                (nsched == 0 || frames == 0 || now_ms() >= t_frame_done + cur_hold()))
                submit_credit();
            libusb_handle_events_timeout_completed(ctx, &tv, &completed);
            if (stopping && bulk_inflight == 0 && !credit_inflight) break;
        }
    }
    {
        unsigned char zero[2] = {0, 0};
        r = libusb_control_transfer(h, 0x41, REQ_SET_OPERATION_MODE, 0, 0, zero, 2, 1000);
        fprintf(out, "{\"ev\":\"end\",\"t\":%.3f,\"frames\":%d,\"credits\":%d,\"errors\":%d,\"stop_mode\":\"%s\"}\n",
                now_ms(), frames, credits, errors, r < 0 ? libusb_error_name(r) : "ok");
    }
    fclose(out);
    printf("%s K=%d: %d frames, %d credits, %d errors, speed %d; wrote %s\n", serial_mode ? "S" : "P", K,
           frames, credits, errors, libusb_get_device_speed(dev), outpath);
    for (i = 0; i < K; i++) {
        libusb_free_transfer(slots[i].xfer);
        free(slots[i].buf);
    }
    libusb_free_transfer(credit_xfer);
    libusb_release_interface(h, 0);
    libusb_close(h);
    libusb_exit(ctx);
    return 0;
}
