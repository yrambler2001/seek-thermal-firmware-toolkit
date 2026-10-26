import sys, collections
ts = set()
for line in open(sys.argv[1]):
    p = line.split()
    if len(p) == 3:
        a = int(p[1])
        if 0 < a < 2**62:
            ts.add(a)
t = sorted(ts)
if len(t) < 2:
    sys.exit("no frames")
gaps = [(b - a) / 1e6 for a, b in zip(t, t[1:])]
dur = (t[-1] - t[0]) / 1e9
print(f"{len(t)} frames shown in {dur:.1f} s = {(len(t)-1)/dur:.2f} fps")
h = collections.Counter(round(g / 16.67) for g in gaps)
for k in sorted(h):
    print(f"  ~{k*16.7:5.0f} ms gap: {h[k]}")
big = [(i, g) for i, g in enumerate(gaps) if g > 40]
print("gaps > 40 ms at s:", [f"{(t[i]-t[0])/1e9:.1f}:{g:.0f}" for i, g in big])
# per-second counts
c = collections.Counter(int((x - t[0]) / 1e9) for x in t)
print("frames per second:", [c[k] for k in sorted(c)][:-1])
