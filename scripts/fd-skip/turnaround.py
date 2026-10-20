# Host turnaround inside and between frames (agent 42.79, fd-run-79 and fdtime2 logs). Inside a frame: the repost
# gap from one bulk IN's completion to the next IN's submit (P1->P2, P2->P3, P3->P4). Between frames: D, from the
# frame's last byte to the next credit's submit. Each split by the frame's fate (followed by a single skip or not),
# and for frames in a storm stretch (>= 25 % of the published frames within 32 frames either side followed by a skip).
# usage: turnaround.py <file.jsonl> [more ...]
import bisect
import json
import sys


def q(xs, p):
    s = sorted(xs)
    return s[min(len(s) - 1, int(p * len(s)))] if s else float('nan')


for path in sys.argv[1:]:
    ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
    frames, cur = [], []
    for e in ev:
        if e['ev'] == 'bulk':
            cur.append(e)
        elif e['ev'] == 'frame':
            frames.append((e, [b for b in cur if b['len'] == 16224]))
            cur = []
    cr = sorted(c['sub'] for c in ev if c['ev'] == 'credit')
    n = len(frames)
    skip = [0] * n
    for k in range(n - 1):
        a, b = frames[k][0], frames[k + 1][0]
        g = (b['idx'] - a['idx']) & 0x3FFF
        if g > 1 and b['type'] == 3 and a['type'] != 1:
            skip[k] = 1
    dens = []
    for k in range(n):
        lo, hi = max(0, k - 32), min(n, k + 33)
        dens.append(sum(skip[lo:hi]) / (hi - lo))
    groups = {'clean stretch': [], 'storm stretch': [], 'followed by a skip': [], 'not followed': []}
    Dg = {k: [] for k in groups}
    for k in range(n - 1):
        f, bl = frames[k]
        if f['type'] != 3 or len(bl) < 4:
            continue
        rep = [bl[i + 1]['sub'] - bl[i]['t'] for i in range(len(bl) - 1)]
        last = f.get('tdone', bl[-1]['t'])
        j = bisect.bisect_left(cr, last)
        D = cr[j] - last if j < len(cr) else None
        keys = ['storm stretch' if dens[k] >= 0.25 else 'clean stretch', 'followed by a skip' if skip[k] else 'not followed']
        for key in keys:
            groups[key] += rep
            if D is not None:
                Dg[key].append(D)
    print(path.split('/')[-1])
    for key in groups:
        r, d = groups[key], Dg[key]
        if not d:
            continue
        print(f"  {key:20s} frames {len(d):5d}  IN repost gap p50/p90/p99 {q(r, .5):.3f}/{q(r, .9):.3f}/{q(r, .99):.3f} ms   "
              f"credit delay D p50/p90 {q(d, .5):.2f}/{q(d, .9):.2f} ms")
