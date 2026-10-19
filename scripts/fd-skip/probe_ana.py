# Analysis of skip_probe.py output (agent 42.74). usage: probe_ana.py <file.json> [more ...]
# Classes as the camera's classify.py: (A) gap into status 6 or 1; (A') status 3 right after status 1; (B) gap into
# any other status 3. Per minute uses the device time of the run's own frames (idx gaps are in captures).
import json
import sys

for path in sys.argv[1:]:
    d = json.load(open(path))
    idx, typ = d['idx'], d['types']
    n = len(idx)
    A = Ap = B = other = 0
    excess = 0
    for i in range(1, n):
        if typ[i] not in (1, 3, 6) or typ[i - 1] not in (1, 3, 6):
            continue                      # boot-programme frames: their index word is pixel data
        dl = (idx[i] - idx[i - 1]) & 0x3FFF
        if dl == 1 or dl > 40:
            continue
        excess += dl - 1
        if typ[i] in (6, 1):
            A += 1
        elif typ[i] == 3 and typ[i - 1] == 1:
            Ap += 1
        elif typ[i] == 3:
            B += 1
        else:
            other += 1
    fields = d.get('fields', [])
    busy = sum(b for _, b in fields)
    cons = d.get('consume', [])
    span_ms = (cons[-1][0] - cons[0][0]) if len(cons) > 1 else 0
    per_min = (lambda x: round(x * 60000.0 / span_ms, 1)) if span_ms else (lambda x: None)
    print(f"{path.split('/')[-1]}: variant {d['variant']} host {d['host']} delay {d['delay_ms']} ms check {d['check']} "
          f"frames {n} wall {d['wall_s']} s")
    print(f"   gaps: (A) {A} (A') {Ap} (B) {B} other {other}; excess captures {excess}; "
          f"(B) per emulated minute {per_min(B)}; fields checked {len(fields)}, busy at check {busy}")
    print(f"   stats {d['stats']}; torn {len(d['torn'])}")
