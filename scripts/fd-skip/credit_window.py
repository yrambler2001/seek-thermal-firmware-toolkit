# The credit window (agent 42.79). For each published steady frame k: D = completion time of the next ImageData
# credit minus the time of the frame's last byte (both host clock). The firmware starts a frame only within the first
# 10 groups (about 7.8 ms) of a field (app_init.c stream_push_chunk: 416*rows - 1664 <= one transfer), so a credit
# that lands later loses the next field. Prints P(single skip after k | D bin), D quantiles for skip and no-skip
# frames, the best threshold (fewest misclassified frames), and for node logs the per-frame JS work time.
# Works on fdtime2 logs (frame t = last byte) and fd-run-79 logs (frame tdone = last byte).
# D is measured to the credit's submit time: a late completion report is not a late credit.
# usage: credit_window.py <file.jsonl> [more ...]
import bisect
import json
import statistics as st
import sys


def q(xs, p):
    s = sorted(xs)
    return s[min(len(s) - 1, int(p * len(s)))] if s else float('nan')


allD = []
for path in sys.argv[1:]:
    ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
    fr = [e for e in ev if e['ev'] == 'frame']
    cr = sorted((c['sub'], c['t']) for c in ev if c['ev'] == 'credit')
    ct = [c[0] for c in cr]
    rows = []
    for k in range(len(fr) - 1):
        a, b = fr[k], fr[k + 1]
        if a['type'] != 3:
            continue
        g = (b['idx'] - a['idx']) & 0x3FFF
        if b['type'] != 3 and g > 1:
            continue  # gap into a calibration frame: not a single skip, not counted either way
        done = a.get('tdone', a['t'])
        j = bisect.bisect_left(ct, done)
        if j >= len(ct):
            continue
        D = ct[j] - done  # credit SUBMIT time minus the last byte (a completion can be reported late; a submit cannot be early)
        sub = cr[j][1] - done
        rows.append((D, 1 if g > 1 else 0, sub, a.get('work')))
    if not rows:
        print(f"{path}: no rows")
        continue
    sk = [r for r in rows if r[1]]
    ok = [r for r in rows if not r[1]]
    print(f"{path.split('/')[-1]}: frames {len(rows)}, followed by a single skip {len(sk)} ({100 * len(sk) / len(rows):.1f}%)")
    print(f"  D (last byte -> credit submitted), no skip: p10 {q([r[0] for r in ok], .1):.2f} p50 {q([r[0] for r in ok], .5):.2f} "
          f"p90 {q([r[0] for r in ok], .9):.2f} p99 {q([r[0] for r in ok], .99):.2f} max {max(r[0] for r in ok):.2f} ms")
    if sk:
        print(f"  D, skip after:                    p10 {q([r[0] for r in sk], .1):.2f} p50 {q([r[0] for r in sk], .5):.2f} "
              f"p90 {q([r[0] for r in sk], .9):.2f} min {min(r[0] for r in sk):.2f} ms")
    # threshold with the fewest errors
    best = None
    for thr in [x / 10 for x in range(0, 200)]:
        err = sum(1 for r in rows if (r[0] > thr) != bool(r[1]))
        if best is None or err < best[1]:
            best = (thr, err)
    print(f"  best single threshold on D: {best[0]:.1f} ms, misclassified {best[1]} of {len(rows)}")
    bins = [0, 2, 4, 5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 12, 15, 1e9]
    out = []
    for lo, hi in zip(bins, bins[1:]):
        b = [r for r in rows if lo <= r[0] < hi]
        if b:
            out.append(f"[{lo:g},{hi:g}) {sum(r[1] for r in b)}/{len(b)}")
    print("  skips / frames by D bin (ms): " + "  ".join(out))
    w = [r[3] for r in rows if r[3] is not None]
    if w:
        wk = [r[3] for r in sk if r[3] is not None]
        wo = [r[3] for r in ok if r[3] is not None]
        print(f"  per-frame JS work (ms): no skip p50 {q(wo, .5):.3f} p90 {q(wo, .9):.3f}; skip after p50 {q(wk, .5) if wk else float('nan'):.3f}")
