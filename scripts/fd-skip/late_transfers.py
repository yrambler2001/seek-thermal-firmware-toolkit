# Late transfers in fdtime logs (agent 42.79). For each payload transfer Pi of each frame, its excess is the
# completion time minus the grid time it completes at in clean frames (lat79's lateness). A transfer is "late" when
# the excess exceeds 0.5 ms AND the transfer before it was not late (so the delay starts at it). Prints the excess
# histogram (0.5 ms bins), which transfer starts the delay, how much later the next transfer completes (back to
# back or not), whether a single skip follows the frame, and how the late starts are spread in time.
# usage: late_transfers.py <fdtime.jsonl> [more ...]
import json
import statistics as st
import sys
from collections import Counter


def load(path):
    ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
    frames, cur = [], {}
    for e in ev:
        if e['ev'] == 'bulk':
            key = {0: 'H', 1664: 'P1', 17888: 'P2', 34112: 'P3', 50336: 'P4'}.get(e['got_before'], 'x')
            cur[key] = e
        elif e['ev'] == 'frame':
            cur['frame'] = e
            frames.append(cur)
            cur = {}
    F, base, prev = [], 0, None
    for fm in frames:
        i = fm['frame']['idx']
        if prev is not None and i < prev and prev - i > 8000:
            base += 0x4000
        F.append(base + i)
        prev = i
    return frames, F


def lsq(xs, ys):
    m = len(xs)
    mx, my = sum(xs) / m, sum(ys) / m
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    p = sxy / sxx
    return my - p * mx, p


for path in sys.argv[1:]:
    frames, F = load(path)
    n = len(frames)
    skipafter = [0] * n
    for k in range(n - 1):
        if F[k + 1] - F[k] > 1 and frames[k + 1]['frame']['type'] == 3 and frames[k]['frame']['type'] != 1:
            skipafter[k] = 1
    ok = [k for k in range(n) if frames[k]['frame']['type'] == 3 and 'P4' in frames[k] and not skipafter[k]]
    b0, P = lsq([F[k] for k in ok], [frames[k]['P4']['t'] for k in ok])
    for _ in range(3):
        r = [frames[k]['P4']['t'] - (b0 + P * F[k]) for k in ok]
        thr = sorted(r)[int(0.7 * len(r))]
        keep = [k for k, x in zip(ok, r) if x <= thr]
        b0, P = lsq([F[k] for k in keep], [frames[k]['P4']['t'] for k in keep])
    keys = ['P1', 'P2', 'P3', 'P4']
    off = {}
    for key in keys:
        xs = sorted(frames[k][key]['t'] - (b0 + P * F[k]) for k in keep if key in frames[k])
        off[key] = xs[len(xs) // 4]  # lower quartile: the prompt completion
    starts = []
    for k in range(n):
        if frames[k]['frame']['type'] != 3:
            continue
        exc = {key: frames[k][key]['t'] - (b0 + P * F[k]) - off[key] for key in keys if key in frames[k]}
        prevlate = False
        for j, key in enumerate(keys):
            if key not in exc:
                continue
            late = exc[key] > 0.5
            if late and not prevlate:
                nxt = keys[j + 1] if j + 1 < 4 else None
                gap_next = (frames[k][nxt]['t'] - frames[k][key]['t']) if nxt and nxt in frames[k] else None
                starts.append((k, key, exc[key], gap_next, skipafter[k], frames[k][key]['t']))
            prevlate = late
    nsk = sum(skipafter)
    withlate = sum(1 for k in range(n) if skipafter[k] and any(s[0] == k for s in starts))
    print(f"{path.split('/')[-1]}: frames {n}, P {P:.5f}, frames followed by a single skip {nsk}, of which with a late payload transfer {withlate}")
    print(f"  late starts: {len(starts)}; by transfer: {dict(Counter(s[1] for s in starts))}")
    h = Counter(min(40, int(s[2] / 0.5)) for s in starts)
    print("  excess histogram (0.5 ms bins, start of bin: count): " + ", ".join(f"{b * 0.5:.1f}:{h[b]}" for b in sorted(h)))
    for key in keys:
        g = [s[3] for s in starts if s[1] == key and s[3] is not None]
        e = [s[2] for s in starts if s[1] == key]
        if e:
            print(f"  {key}: n {len(e)}, excess median {st.median(e):.2f} ms (p10 {sorted(e)[len(e) // 10]:.2f}, p90 {sorted(e)[9 * len(e) // 10]:.2f}); "
                  f"next transfer completes after median {st.median(g) if g else float('nan'):.2f} ms; followed by a skip {sum(s[4] for s in starts if s[1] == key)}")
    # late starts not followed by a skip, and skips with no late payload transfer
    print(f"  late starts with no skip after the frame: {sum(1 for s in starts if not s[4])}")
