# Classify index gaps in fdtime logs (agent 42.74), as 42.62's classify_fd.py does:
#   (A)  gap into a type-6 or type-1 frame (the calibration excursion, every 96 captures)
#   (A') a type-3 frame right after a type-1 frame
#   (B)  gap into any other type-3 frame (the random single skip the endpoint-busy check causes)
# usage: classify.py <file.jsonl> [more.jsonl ...]
import json, sys
from collections import Counter

for path in sys.argv[1:]:
    ev = [json.loads(l) for l in open(path)]
    meta = next(e for e in ev if e['ev'] == 'meta')
    frames = [e for e in ev if e['ev'] == 'frame']
    secs = meta['seconds']
    A = Ap = B = other = 0
    Bev = []
    excess = 0
    for prev, cur in zip(frames, frames[1:]):
        dlt = (cur['idx'] - prev['idx']) & 0x3FFF
        if dlt == 1:
            continue
        excess += dlt - 1
        if cur['type'] in (6, 1):
            A += 1
        elif cur['type'] == 3 and prev['type'] == 1:
            Ap += 1
        elif cur['type'] == 3:
            B += 1
            Bev.append(cur['t'])
        else:
            other += 1
    frames_n = len(frames)
    print(f"{path.split('/')[-1]}: mode {meta['mode']} K={meta['K']} frames {frames_n} "
          f"fps {frames_n / secs:.2f}  excess captures/min {excess * 60 / secs:.0f}  "
          f"(A) {A * 60 / secs:.0f}/min  (A') {Ap * 60 / secs:.0f}/min  "
          f"(B) {B * 60 / secs:.0f}/min ({B} events)  other {other}")
