import sys, re, collections
ts = [float(m.group(1)) for l in open(sys.argv[1]) for m in [re.match(r'\s*(\d+\.\d+)\s+\d+\s+\d+ D UsbRequestJNI: init', l)] if m]
req = []
for t in ts:
    if not req or t - req[-1] > 0.005:
        req.append(t)
g = [(b - a) * 1000 for a, b in zip(req, req[1:])]
dur = req[-1] - req[0]
print(f"{len(req)} frame requests in {dur:.1f} s = {(len(req)-1)/dur:.1f} camera fps")
h = collections.Counter(round(x / 31.07) for x in g)
print("gaps in frame periods:", dict(sorted(h.items())))
s = ''.join('.' if x < 40 else 'x' if x < 70 else 'X' if x < 100 else '|' for x in g)
for i in range(0, len(s), 100):
    print(f"{req[i]-req[0]:5.1f}s {s[i:i+100]}")
