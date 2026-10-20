# Interval-based field loss (agent 42.79), for streams whose frames carry no capture index (IP mode 4: the firmware
# writes no header words there, app_init.c `frame_mode_gate_view_r32k != 4u`). Each interval between consecutive
# frames' last bytes is rounded to whole field periods (31.063 ms); an interval of n periods lost n-1 fields.
# Prints frames, lost fields per minute, the share of frames followed by a loss, and the credit lateness split.
# usage: interval_gaps.py <period_ms> <file.jsonl> [more ...]
import bisect
import json
import sys

P = float(sys.argv[1])
for path in sys.argv[2:]:
    ev = [json.loads(l) for l in open(path) if l.endswith('}\n')]
    meta = ev[0]
    fr = [e for e in ev if e['ev'] == 'frame']
    cr = sorted(c['sub'] for c in ev if c['ev'] == 'credit')
    T = [f.get('tdone', f['t']) for f in fr]
    lost = 0
    after = 0
    hist = {}
    Dk = []
    for k in range(len(fr) - 1):
        n = round((T[k + 1] - T[k]) / P)
        hist[n] = hist.get(n, 0) + 1
        if n > 1:
            lost += n - 1
            after += 1
        j = bisect.bisect_left(cr, T[k])
        if j < len(cr):
            Dk.append((cr[j] - T[k], n > 1))
    secs = meta['seconds']
    late = [d for d, s in Dk if s]
    ok = [d for d, s in Dk if not s]

    def q(xs, p):
        s = sorted(xs)
        return s[min(len(s) - 1, int(p * len(s)))] if s else float('nan')

    print(f"{path.split('/')[-1]}: frames {len(fr)}, lost fields {lost} ({lost * 60 / secs:.0f}/min), frames followed by a loss "
          f"{after} ({100 * after / max(1, len(fr) - 1):.1f}%); intervals in periods {dict(sorted(hist.items())[:8])}; "
          f"D p50 no loss {q(ok, .5):.2f}, before a loss {q(late, .5):.2f} ms")
