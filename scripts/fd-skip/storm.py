# Agent 42.79. Storm structure in frame logs (fdtime / checker format: ev=frame with t ms, idx, type).
# Per run: unwrap the 14-bit capture index; mark each field index as published, a single skip (B: missing captures
# before a type-3 frame that does not follow a type-1 frame), or excursion; fit the field period on steady frames;
# smooth the B series over 32 fields and call a field "storm" when the local B fraction is >= 0.25.
# Prints: period fit, storm fraction, episode counts and lengths (s), onset times, the residual d (frame arrival minus
# the fitted field grid) in storm and clean stretches, and the spectrum peak of the B series.
# Also imported by phase.py.
# usage: storm.py <file.jsonl> [...]
import json
import sys
import statistics as st

MASK = 0x3FFF


def load(path):
    ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
    meta = next(e for e in ev if e['ev'] == 'meta')
    fr = [e for e in ev if e['ev'] == 'frame']
    F = []
    base = 0
    prev = None
    for f in fr:
        i = f['idx']
        if prev is not None and ((i - prev) & MASK) < 8000 and i < prev:
            base += 0x4000
        F.append(base + i)
        prev = i
    return meta, fr, F


def lsq(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    p = sxy / sxx
    return my - p * mx, p


def analyse(path, verbose=True):
    meta, fr, F = load(path)
    T = [f['t'] for f in fr]
    n = len(fr)
    # field series
    f0, f1 = F[0], F[-1]
    nf = f1 - f0 + 1
    B = [0] * nf
    pub = [0] * nf
    for k in range(n):
        pub[F[k] - f0] = 1
    for k in range(1, n):
        g = F[k] - F[k - 1]
        if g > 1 and fr[k]['type'] == 3 and fr[k - 1]['type'] != 1:
            for j in range(F[k - 1] + 1, F[k]):
                B[j - f0] = 1
    steady = [k for k in range(n - 1) if fr[k]['type'] == 3 and F[k + 1] - F[k] == 1]
    b0, P = lsq([F[k] for k in steady], [T[k] for k in steady])
    d = [T[k] - (b0 + P * F[k]) for k in range(n)]
    # robust re-fit: drop the top 10 % of d (late frames), refit on the rest
    thr = sorted(d[k] for k in steady)[int(0.9 * len(steady))]
    st2 = [k for k in steady if d[k] <= thr]
    b0, P = lsq([F[k] for k in st2], [T[k] for k in st2])
    d = [T[k] - (b0 + P * F[k]) for k in range(n)]
    dmin = min(d[k] for k in steady)
    d = [x - dmin for x in d]
    W = 32
    half = W // 2
    pre = [0]
    for x in B:
        pre.append(pre[-1] + x)
    loc = [(pre[min(nf, i + half)] - pre[max(0, i - half)]) / (min(nf, i + half) - max(0, i - half)) for i in range(nf)]
    storm = [1 if x >= 0.25 else 0 for x in loc]
    # episodes
    eps = []
    cur = storm[0]
    start = 0
    for i in range(1, nf):
        if storm[i] != cur:
            eps.append((cur, start, i))
            cur = storm[i]
            start = i
    eps.append((cur, start, nf))
    secs = lambda a, b: (b - a) * P / 1000
    stormeps = [secs(a, b) for s, a, b in eps if s == 1]
    cleaneps = [secs(a, b) for s, a, b in eps if s == 0]
    onsets = [round(a * P / 1000, 1) for s, a, b in eps if s == 1]
    dstorm = [d[k] for k in range(n) if storm[F[k] - f0] == 1 and fr[k]['type'] == 3]
    dclean = [d[k] for k in range(n) if storm[F[k] - f0] == 0 and fr[k]['type'] == 3]
    # frames followed by a B skip vs not (any state)
    nextB = [k for k in range(n - 1) if F[k + 1] - F[k] > 1 and fr[k + 1]['type'] == 3 and fr[k]['type'] != 1]
    nextOK = [k for k in range(n - 1) if F[k + 1] - F[k] == 1 and fr[k]['type'] == 3]

    def q(xs, p):
        if not xs:
            return float('nan')
        s = sorted(xs)
        return s[min(len(s) - 1, int(p * len(s)))]

    res = {
        'path': path.split('/')[-1], 'n': n, 'fields': nf, 'P': P, 'Bn': sum(B), 'stormFrac': sum(storm) / nf,
        'stormEps': stormeps, 'cleanEps': cleaneps, 'onsets': onsets,
        'dStorm': (q(dstorm, 0.1), q(dstorm, 0.5), q(dstorm, 0.9)), 'dClean': (q(dclean, 0.1), q(dclean, 0.5), q(dclean, 0.9)),
        'dNextB': (q([d[k] for k in nextB], 0.5)), 'dNextOK': q([d[k] for k in nextOK], 0.5),
        'B': B, 'storm': storm, 'd': d, 'F': F, 'f0': f0, 'fr': fr,
    }
    if verbose:
        print(f"{res['path']}: frames {n} fields {nf} P {P:.5f} ms  B {sum(B)}  storm {100 * res['stormFrac']:.0f}%  "
              f"storm eps {len(stormeps)} (s: {', '.join(f'{x:.1f}' for x in stormeps[:12])})  "
              f"clean eps {len(cleaneps)} (s: {', '.join(f'{x:.1f}' for x in cleaneps[:12])})")
        print(f"   d storm p10/50/90 {res['dStorm'][0]:.2f}/{res['dStorm'][1]:.2f}/{res['dStorm'][2]:.2f}  "
              f"clean {res['dClean'][0]:.2f}/{res['dClean'][1]:.2f}/{res['dClean'][2]:.2f}  "
              f"d before a B skip (median) {res['dNextB']:.2f}, before no skip {res['dNextOK']:.2f}")
    return res


if __name__ == '__main__':
    for p in sys.argv[1:]:
        analyse(p)
