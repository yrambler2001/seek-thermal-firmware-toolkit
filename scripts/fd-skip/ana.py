# Scratch analysis of fdtime JSON-lines (agent 42.74). usage: ana.py <file.jsonl>
import json, sys, statistics as st
from collections import Counter

path = sys.argv[1]
ev = [json.loads(l) for l in open(path)]
meta = next(e for e in ev if e['ev'] == 'meta')
frames = [e for e in ev if e['ev'] == 'frame']
bulks = [e for e in ev if e['ev'] == 'bulk']
credits = [e for e in ev if e['ev'] == 'credit']
end = next(e for e in ev if e['ev'] == 'end')
print(f"mode {meta['mode']} K={meta['K']} speed={meta['speed']} seconds={meta['seconds']}")
print(f"frames {len(frames)} credits {len(credits)} bulk {len(bulks)} errors {end['errors']}")
print("end:", end)

idx = [f['idx'] for f in frames]
d = [(b - a) & 0x3FFF for a, b in zip(idx, idx[1:])]
print("index delta histogram (1 = no skip, 2 = one capture dropped):", sorted(Counter(d).items())[:12])
print("frame types:", dict(Counter(f['type'] for f in frames)))
print("bulk lengths:", dict(Counter(b['len'] for b in bulks)))

# credit complete -> header (first bulk submitted after the credit) completion
lat_hdr = []
for c_ in credits:
    after = [b for b in bulks if c_['t'] - 0.001 <= b['sub'] <= c_['t'] + 2]
    if after:
        first = min(after, key=lambda b: b['t'])
        lat_hdr.append(first['t'] - c_['t'])
if lat_hdr:
    s = sorted(lat_hdr)
    print(f"credit complete -> header complete: median {st.median(s):.3f} ms, p90 {s[int(0.9*len(s))]:.3f}")

fp = [b['t'] - a['t'] for a, b in zip(frames, frames[1:])]
s = sorted(fp)
print(f"frame-to-frame completion gap: median {st.median(s):.2f} ms, p10 {s[int(0.1*len(s))]:.2f}, p90 {s[int(0.9*len(s))]:.2f}, gaps > 40 ms: {sum(1 for x in fp if x > 40)}")

# frame complete (last TD) -> next credit submit
gap_credit = []
for f in frames:
    nxt = [c_ for c_ in credits if c_['sub'] >= f['t'] - 0.001]
    if nxt:
        gap_credit.append(nxt[0]['sub'] - f['t'])
s = sorted(gap_credit)
print(f"frame complete -> next credit submit: median {st.median(s):.3f} ms, p90 {s[int(0.9*len(s))]:.3f} ms, max {s[-1]:.3f}")

# frames followed by a skip: how long was the credit wait
skip_ix = [i for i, x in enumerate(d) if x == 2]
print("frames followed by a 2-step index jump:", len(skip_ix), "of", len(d))
if skip_ix:
    cw = []
    for i in skip_ix:
        f = frames[i]
        nxt = [c_ for c_ in credits if c_['sub'] >= f['t'] - 0.001]
        if nxt:
            cw.append(nxt[0]['sub'] - f['t'])
    if cw:
        print(f"  frame -> credit median {st.median(cw):.3f} ms (all frames: {st.median(gap_credit):.3f} ms)")
