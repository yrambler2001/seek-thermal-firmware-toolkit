package seekpatch;

import android.hardware.usb.UsbRequest;
import android.util.Log;
import java.util.Random;

/**
 * seek-patch usb_probe (experiment, not a release patch): times the camera library's frame
 * reads and can delay two things on purpose, to find out why a camera skips frames.
 *
 * <p>The delays come from the system property debug.seekprobe, re-read every second, for example
 * {@code adb shell setprop debug.seekprobe "c=0-8000 l=0-0"}:
 * <ul>
 * <li>c=min-max: wait a random time (microseconds) before each frame request;
 * <li>l=min-max: wait a random time before queueing the read of each frame's last chunk.
 * </ul>
 * Every frame is logged (tag SeekProbe, 16 frames per entry):
 * {@code seq requestStart requestDuration cDelay lDelay chunk1 chunk2 ...}, all in microseconds,
 * the chunks relative to the request's start.
 */
public final class UsbProbe {
    private static final String TAG = "SeekProbe";
    private static final String PROPERTY = "debug.seekprobe";

    private static long cMin, cMax, lMin, lMax;
    private static String config = "";
    private static long configRead;
    private static final Random RANDOM = new Random();

    private static long seq;
    private static long requestStart, requestEnd, cDelay, lDelay;
    private static final long[] ARRIVED = new long[32];
    private static int arrived;
    private static final StringBuilder OUT = new StringBuilder();
    private static int lines;

    private UsbProbe() {
    }

    private static void readConfig(long now) {
        configRead = now;
        String value = "";
        try {
            value = (String) Class.forName("android.os.SystemProperties")
                    .getMethod("get", String.class, String.class).invoke(null, PROPERTY, "");
        } catch (Exception e) {
            // no property: no delays
        }
        if (value.equals(config)) {
            return;
        }
        config = value;
        cMin = cMax = lMin = lMax = 0;
        for (String part : value.trim().split("\\s+")) {
            int eq = part.indexOf('='), dash = part.indexOf('-', eq + 1);
            if (eq < 1 || dash < 0) {
                continue;
            }
            try {
                long lo = Long.parseLong(part.substring(eq + 1, dash)), hi = Long.parseLong(part.substring(dash + 1));
                if (part.startsWith("c")) {
                    cMin = lo;
                    cMax = hi;
                } else if (part.startsWith("l")) {
                    lMin = lo;
                    lMax = hi;
                }
            } catch (NumberFormatException e) {
                // ignore the part
            }
        }
        flush();
        Log.i(TAG, "config c=" + cMin + "-" + cMax + " l=" + lMin + "-" + lMax);
    }

    private static long pick(long lo, long hi) {
        return hi <= lo ? lo : lo + (long) (RANDOM.nextDouble() * (hi - lo));
    }

    private static void spin(long us) {
        long until = System.nanoTime() + us * 1000L;
        while (System.nanoTime() < until) {
            // busy wait: sleeping wakes up too late
        }
    }

    private static void flush() {
        if (lines > 0) {
            Log.i(TAG, OUT.toString());
            OUT.setLength(0);
            lines = 0;
        }
    }

    /** Before the library's frame request (USB thread). */
    public static void beforeRequest() {
        long now = System.nanoTime();
        if (now - configRead > 1000000000L) {
            readConfig(now);
        }
        if (requestStart != 0) {
            OUT.append(seq++).append(' ').append(requestStart / 1000).append(' ').append((requestEnd - requestStart) / 1000)
                    .append(' ').append(cDelay).append(' ').append(lDelay);
            for (int i = 0; i < arrived; i++) {
                OUT.append(' ').append((ARRIVED[i] - requestStart) / 1000);
            }
            OUT.append('\n');
            if (++lines >= 16) {
                flush();
            }
        }
        cDelay = pick(cMin, cMax);
        if (cDelay > 0) {
            spin(cDelay);
        }
        arrived = 0;
        lDelay = 0;
        requestStart = System.nanoTime();
    }

    /** After the frame request returned. */
    public static void afterRequest() {
        requestEnd = System.nanoTime();
    }

    /** Before the library queues the read of chunk i. */
    public static void beforeQueue(UsbRequest[] requests, int i) {
        if (requests != null && i > 0 && i == requests.length - 1) {
            lDelay = pick(lMin, lMax);
            if (lDelay > 0) {
                spin(lDelay);
            }
        }
    }

    /** A chunk's read finished (after requestWait). */
    public static void arrived(UsbRequest request) {
        if (arrived < ARRIVED.length) {
            ARRIVED[arrived++] = System.nanoTime();
        }
    }
}
