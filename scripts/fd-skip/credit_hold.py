# E1 (agent 42.79): fdtime with a credit-hold schedule (CREDIT_SCHED). For each schedule block: the hold (ms from
# the frame's last byte to the credit submit), published steady frames, single skips, and the fraction of published
# frames followed by a single skip. A credit that lands after the firmware's frame-start window loses the next field.
# usage: credit_hold.py <fdtime.jsonl> <credit-sched.txt> [settle_s]
import json
import sys
from collections import defaultdict

path, sp = sys.argv[1], sys.argv[2]
settle = float(sys.argv[3]) if len(sys.argv) > 3 else 20
ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
fr = [e for e in ev if e['ev'] == 'frame']
cr = [e for e in ev if e['ev'] == 'credit']
sched = [tuple(map(float, l.split())) for l in open(sp) if l.strip()]
blocks = [(a, sched[i + 1][0] if i + 1 < len(sched) else 1e9, d) for i, (a, d) in enumerate(sched)]
agg = defaultdict(lambda: [0, 0, []])
print(f"{path.split('/')[-1]}")
for a, b, d in blocks:
    if a < settle:
        continue
    pub = sk = 0
    subs = []
    for k in range(len(fr) - 1):
        t = fr[k]['t'] / 1000
        if not (a + 0.5 <= t < b - 0.1) or fr[k]['type'] != 3:
            continue
        g = (fr[k + 1]['idx'] - fr[k]['idx']) & 0x3FFF
        if g > 1 and fr[k + 1]['type'] != 3:
            continue
        pub += 1
        sk += 1 if g > 1 else 0
    for c in cr:
        if a + 0.5 <= c['t'] / 1000 < b - 0.1:
            subs.append(c)
    print(f"  {a:5.0f}-{b:5.0f} s  hold {d:5.1f} ms  frames {pub:4d}  followed by a skip {sk:4d}  ({100 * sk / max(1, pub):5.1f}%)")
    agg[d][0] += pub
    agg[d][1] += sk
print("  by hold (both passes):")
for d in sorted(agg):
    pub, sk, _ = agg[d]
    print(f"    hold {d:5.1f} ms: {sk:4d} of {pub:4d} frames followed by a single skip ({100 * sk / max(1, pub):5.1f}%)")
