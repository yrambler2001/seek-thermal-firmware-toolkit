# Agent 42.79. Does the chance that a published steady frame is followed by a single skip depend on where its field boundary
# falls in a host periodic grid (1 ms USB frame, 125 us microframe, or other periods)?  The host clock and the
# xHCI's frame clock are assumed coherent (same reference crystal); the per-run offset is unknown, so each run is
# tested on its own: skip rate per phase bin, and the max-min spread against a shuffled null.
# usage: phase.py <period_ms> <bins> <file.jsonl> [...]
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from storm import analyse  # noqa: E402

per = float(sys.argv[1])
nb = int(sys.argv[2])
random.seed(1)
for path in sys.argv[3:]:
    r = analyse(path, verbose=False)
    fr, F, d, P = r['fr'], r['F'], r['d'], r['P']
    # grid time of each frame's field end, re-derived from the fit (t = b0 + P*F + d), so grid = t - d
    xs = []
    for k in range(len(fr) - 1):
        if fr[k]['type'] != 3:
            continue
        g = fr[k]['t'] - d[k]
        skip = 1 if (F[k + 1] - F[k] > 1 and fr[k + 1]['type'] == 3) else 0
        xs.append(((g % per) / per, skip))

    def spread(pairs):
        cnt = [0] * nb
        sk = [0] * nb
        for ph, s in pairs:
            b = min(nb - 1, int(ph * nb))
            cnt[b] += 1
            sk[b] += s
        rates = [sk[i] / cnt[i] if cnt[i] else 0 for i in range(nb)]
        return max(rates) - min(rates), rates, cnt

    sp, rates, cnt = spread(xs)
    null = []
    ph = [p for p, _ in xs]
    s = [x for _, x in xs]
    for _ in range(200):
        random.shuffle(s)
        null.append(spread(list(zip(ph, s)))[0])
    null.sort()
    pval = sum(1 for x in null if x >= sp) / len(null)
    print(f"{r['path']:22s} per {per} ms: skip rate by phase bin "
          f"[{' '.join(f'{x:.2f}' for x in rates)}] spread {sp:.2f} (null p95 {null[int(0.95 * len(null))]:.2f}, p={pval:.2f})")
