# Single-skip storms on the 32 fps Compact: the cause

The bench's patched Seek Compact (1.3.0.0, 32 Hz Normal) sometimes loses nearly every other frame for seconds at a time:
the per-second rate drops from about 32.2 to about 16.1 fps, and the single skips run anywhere from about 5 to about 800 a
minute on the same image at the same settings (TESTING.md 42.77, 42.78). This file states what causes those "storms", how
it was shown, and what a host can do about it. The full record, with every run, is `TESTING.md` 42.79.

## The short answer

The storms come from the host, not the camera, the USB path or the microphone receiver on the same hub.

- The camera starts a frame only if that frame's credit (ImageData, request 0x53) is already there in the first 10 row
  groups of the field, about 7.5 ms after the previous frame's last byte reached the host. A later credit loses the next
  field; the field after it is published, because the credit is then in place. So late credits lose exactly every other
  field: the 32/16 fps toggle.
- The frame-rate checker (`e2e/lib/bench/seek-fps/`) sends the next credit only after it has decoded and processed the
  frame. That takes 2 to 4 ms when the node thread runs fast, and more than the window when macOS runs the thread slowly
  (an efficiency core, a low clock). Then the camera storms.
- The tv-jc Swift tool and app read frames in the same order (`Camera.swift` `grabBytes` sends the credit at the start of
  the next read, after the processing and `onFrame`), so they are exposed to the same window.

## The firmware rule

`stream_push_chunk` (FW-V1 `targets/compact_8hz_1_3_0_0/src/app_init.c:467-500`) runs once per 4-row group. A frame that
has not started yet starts only when a credit is counted and the endpoint is idle, and only while the rows already copied
fit in one 16,224-byte transfer:

```
0x1A0 * rows_so_far - 0x680 <= transfer_bytes      (rows_so_far = _00, +4 per group, 0 at the field's publish)
```

With the checker's body credit (0x7EC0) that is groups 2 to 10 of the field; with the 0x8200 credit, groups 1 to 11. A
credit that misses the window stays counted, and the frame starts early in the next field. The other way a field is lost
is the endpoint-busy check at the field start (`app_init.c:952`, TESTING.md 42.74).

## The evidence (TESTING.md 42.79)

**The window, measured with a held credit.** A C loop (`scripts/fd-skip/fdtime.c`, `CREDIT_SCHED`) held each credit a
fixed time after the frame's last byte, in shuffled 20 s blocks on one boot:

| credit held | published frames followed by a lost field |
|---|---|
| 0 ms | 1.8% |
| 4 ms | 9.9% |
| 6 ms | 17.1% |
| 6.5 ms | 44.9% |
| 7 ms | 78.0% |
| 7.5 ms | 98.0% |
| 8 to 12 ms | 100% (2,956 of 2,956) |

From 8 ms on, the camera publishes exactly every other field, the storm's signature, with nothing else changed.

**The checker crosses that window.** In 13 one-minute runs of the checker's own stream loop on the camera, every frame
whose credit went out 6.6 ms or more after its last byte (as the checker's JavaScript clock sees it) was followed by a lost
field: 3,691 of 3,691. The largest credit delay without a loss was 6.41 to 6.60 ms in every run. The checker's turnaround
for its bulk INs inside a frame stays at 0.02 to 0.04 ms in storms and outside them; only the credit delay changes.

**The host thread's speed moves the storm.** Interleaved runs of the same checker:

| condition | lost fields per minute (3 runs) | published frames followed by a loss |
|---|---|---|
| plain | 206, 349, 421 | 14 to 32% |
| `taskpolicy -b` (background QoS) | 750, 735, 792 | 62 to 68% |
| `taskpolicy -b`, no extra per-frame analysis | 691, 806, 765 | 59 to 72% |

In 42.78's 20 runs, the time a fixed piece of per-frame JavaScript took (its picture statistics) tracks the single-skip
count with r = 0.97: 0.25 ms a frame in the clean run (11 skips a minute), 1.41 ms in the worst (790 a minute).

**What it is not.**

- *The microphone receiver* on the camera's hub (DJI Wireless Microphone RX, full speed, behind the same single-TT hub):
  CoreAudio and the coreaudiod log show its stream was never open during the logged storms. Holding it open (samples
  discarded) gave no storm in a 16-minute C-loop run (238 lost fields open against 172 closed over 16 ABBA pairs, p = 0.10);
  with the checker, 1,774 open against 2,153 closed over 16 pairs (p = 0.24), storming in both states.
- *The switch board:* it cuts only VBUS; D+ and D- pass straight through.
- *A beat between the camera's field clock and the USB 1 ms frame or 125 µs microframe:* the skip chance does not depend on
  either phase, and the field period is steady at 31.0637 ms.
- *The host load average* (r = -0.07 over 42.78's runs), *the image* (P and the copy-gate Pg alike), *the injected IN
  delays and the number of pending INs* (they act on the bulk INs; the credit still waits for the processing).
- *The camera's state:* the same camera streamed 16 minutes with no storm under the C loop, and stormed under the checker
  minutes later.

## What remains when the credit is prompt

A C loop that sends the credit 0.01 ms after the last byte still loses about 25 fields a minute with one bulk IN in
flight, never in storms. Those come from the host reporting a transfer's completion 6 ms or more late, so the next IN is
posted after the field-end transfer is due (TESTING.md 42.74's endpoint-busy skip). Keeping 2 to 3 INs pending removes most
of them (42.74: 3 to 12 a minute).

## What a host should do

Advice only. None of it is applied to the checker or to tv-jc (owner decision, 2026-10-20; see Status).

1. Send the next frame's credit at the frame's last byte, before decoding and processing it. Never send a second credit
   before a frame's last byte: the firmware cancels the queued IN transfers when one arrives (`rpc_cmds.c` `cmd_ImageData`).
2. Keep the bulk INs off the processing path: process frames on another thread or worker, or keep 2 to 3 INs pending
   (node-usb 2.x can, TESTING.md 42.77; node-usb 3.1.0 takes one).
3. Measured so far, with the credit at the last byte added to the checker as a wrapper (one bulk IN, a scratch driver):
   - on a plain thread it takes the checker from 234 to 470 lost fields a minute to 66 to 90 (27.3 to 27.6 fps), in
     three of three interleaved pairs, with no storm left;
   - on a thread clamped to background QoS it lowers the share of frames followed by a loss from 65 to 71% to 29 to 42%
     only, because the bulk INs still wait for the processing there (point 2 is not in that driver).

Until the checker does this, its lost-frame counts measure the host thread as much as the camera. Firmware A/B
comparisons (like 42.78's copy gate) need a host loop whose credit timing does not depend on the CPU.

## Status (owner decisions, 2026-10-20)

- The checker (`e2e/lib/bench/seek-fps/`) stays as it is. It still sends the next frame's credit after it has decoded and processed the frame. The finding is documented only.
- tv-jc: `Camera.swift` `grabBytes` has the same order. It is not changed now.
- The copy gate (candidate 6, FW-V1 branch `drop-path-study`, not in FW-V1 main) is not retested. 42.78's A/B measured the host thread, not the gate: its skip counts track the checker's per-frame JavaScript time (r 0.97). So its "no gain" verdict says nothing about the gate either way. A fair test would use a host loop with a prompt credit, judged against the residual of about 25 a minute (the endpoint-busy skip, TESTING.md 42.74). It was not run.
- The checker stays on node-usb 3.1.0.
