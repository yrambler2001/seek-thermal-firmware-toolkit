"""probe.py <logcat dump>: analyse SeekProbe lines (seq reqStart reqDur cDelay lDelay chunk...; microseconds)."""
import re
import sys
from collections import Counter, defaultdict

recs = []
for line in open(sys.argv[1], errors="replace"):
    m = re.search(r"SeekProbe: (\d+(?: -?\d+)+)\s*$", line)
    if m:
        v = [int(x) for x in m.group(1).split()]
        recs.append(v)
    elif "SeekProbe: config" in line:
        print(line.strip().split("SeekProbe: ")[1])
recs.sort(key=lambda r: r[0])
four = {r[0]: r for r in recs if len(r) == 9}
print(f"{len(recs)} frames logged, {len(four)} with 4 chunks")
rows = []
for s, r in four.items():
    n = four.get(s + 1)
    if not n:
        continue
    F = r[1] + r[5]
    last = r[1] + r[8]
    gap = (n[1] + n[5] - F) / 1000
    rows.append(dict(gap=gap, credit=(n[1] - F) / 1000, after_last=(n[1] - last) / 1000, cdelay=n[3] / 1000,
                     ldelay=r[4] / 1000, c4=(r[8] - r[7]) / 1000, c3=(r[7] - r[6]) / 1000))
ok = [x for x in rows if x["gap"] < 40]
sk = [x for x in rows if 55 < x["gap"] < 70]
print(f"pairs: {len(rows)}  on time {len(ok)}  one skipped {len(sk)}  other {len(rows) - len(ok) - len(sk)}"
      f"  -> skip rate {len(sk) / max(1, len(ok) + len(sk)):.1%}")
s = "".join("." if x["gap"] < 40 else "x" if x["gap"] < 70 else "|" for x in rows)
for i in range(0, len(s), 100):
    print("   ", s[i:i + 100])


def table(key, width, label):
    b = defaultdict(lambda: [0, 0])
    for x in ok + sk:
        b[int(x[key] // width)][0 if x["gap"] < 40 else 1] += 1
    print(f"{label}: on time / skipped (skip %)")
    for k in sorted(b):
        o, m = b[k]
        print(f"   {k * width:6.1f}-{(k + 1) * width:<5.1f} ms  {o:5d} {m:5d}  ({m / (o + m):5.1%})")


if any(x["cdelay"] > 0 for x in rows):
    table("credit", 1.0, "request time after the frame's first chunk")
if any(x["ldelay"] > 0 for x in rows):
    table("ldelay", 0.5, "delay before queueing the last chunk's read")
    table("c4", 0.5, "last chunk arrived after chunk 3")
    table("credit", 1.0, "request time after the frame's first chunk")
if not any(x["cdelay"] > 0 or x["ldelay"] > 0 for x in rows):
    for lab, v in (("on time", ok), ("skipped", sk)):
        if v:
            med = lambda k: sorted(x[k] for x in v)[len(v) // 2]
            print(f"   {lab}: request after 1st chunk {med('credit'):.2f} ms, after last {med('after_last'):.2f}, chunk3->4 {med('c4'):.2f}")
