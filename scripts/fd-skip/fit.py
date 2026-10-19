# Field-phase fit for fdtime logs (agent 42.74).
# Each frame carries its capture index F (header halfword 1, 14-bit, unwrapped here). Fields end on a fixed 31.25 ms
# grid (32 Hz). Fit T = B0 + F*P (least squares on the steady frames), then d = T - (B0 + F*P) is the time from the
# field's end to the frame's last byte at the host. A skip after frame k shows as an index jump of 2 right after it.
# usage: fit.py <file.jsonl> [more ...]
import json, sys, statistics as st

def load(path):
    ev = [json.loads(l) for l in open(path)]
    meta = next(e for e in ev if e['ev'] == 'meta')
    frames = [e for e in ev if e['ev'] == 'frame']
    # unwrap the 14-bit capture index
    F = []
    base = 0
    prev = None
    for f in frames:
        i = f['idx']
        if prev is not None and i < prev and prev - i > 8000:
            base += 0x4000
        F.append(base + i)
        prev = i
    return meta, frames, F

def lsq(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    p = sxy / sxx
    return my - p * mx, p

for path in sys.argv[1:]:
    meta, frames, F = load(path)
    T = [f['t'] for f in frames]
    # steady frames only (type 3, and the step after a type 3, so the index is a plain field count)
    steady = [k for k in range(len(frames)) if frames[k]['type'] == 3 and k + 1 < len(frames)
              and (F[k + 1] - F[k]) == 1]
    b0, P = lsq([F[k] for k in steady], [T[k] for k in steady])
    d = [T[k] - (b0 + P * F[k]) for k in range(len(frames))]
    # a skip after frame k: the next frame's index is 2 or more ahead (any type)
    after_gap = [k for k in range(len(frames) - 1) if F[k + 1] - F[k] > 1]
    ds = sorted(d[k] for k in steady)
    def pct(p):
        return ds[min(len(ds) - 1, int(p * len(ds)))]
    print(f"{path.split('/')[-1]} mode {meta['mode']} K={meta['K']}: period fit {P:.4f} ms "
          f"(nominal 31.25), d over steady frames: p05 {pct(0.05):.3f}  p50 {pct(0.5):.3f}  "
          f"p95 {pct(0.95):.3f}  p99 {pct(0.99):.3f}  max {ds[-1]:.3f} ms")
    if after_gap:
        dg = [d[k] for k in after_gap]
        print(f"   d of the frame before each index gap: median {st.median(dg):.3f} ms "
              f"(n={len(dg)}); frames with d > 0.78 ms: {sum(1 for x in d if x > 0.78)} of {len(d)}; "
              f"of which followed by a gap: {sum(1 for k in after_gap if d[k] > 0.78)}")
        big = [k for k in range(len(frames)) if d[k] > 0.78]
        print(f"   frames with d > 0.78 ms followed by a gap: {sum(1 for k in big if k in set(after_gap))}"
              f" of {len(big)}")
