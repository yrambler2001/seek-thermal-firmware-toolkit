# Field timeline from skip_probe.py output (agent 42.74): for each 16224-byte payload dTD, the prime time, the time
# the emulator completes it (the consume time of the matching transfer), and for each field-start check the margin
# to the most recent prime. usage: margin.py <file.json>
import bisect
import json
import statistics as st
import sys

for path in sys.argv[1:]:
    d = json.load(open(path))
    primes = [p for p in d['primes'] if p[1] == 16224]
    consume = [c for c in d['consume'] if c[1] == 16224]
    fields = d['fields']
    pt = [p[0] for p in primes]
    ct = [c[0] for c in consume]
    # transfers complete in the order they were primed: pair FIFO
    # the first consume was primed before logging began: pair consume i+1 with prime i
    lat = [c - p for p, c in zip(pt, ct[1:])]
    lat_last = [lat[i] for i in range(3, len(lat), 4)]     # every 4th payload dTD: the frame's last (P4)
    lat_first = [lat[i] for i in range(0, len(lat), 4)]
    over = sum(1 for x in lat if x > 0.691)
    # busy fields and the time since the latest prime at each field check
    since = []
    busy_since = []
    for t, b in fields:
        k = bisect.bisect_right(pt, t) - 1
        if k >= 0:
            since.append(t - pt[k])
            if b:
                busy_since.append(t - pt[k])
    print(f"{path.split('/')[-1]}: primes {len(primes)} payload dTDs; consumes {len(consume)}")
    if lat:
        s = sorted(lat)
        sl = sorted(lat_last)
        print(f"   prime -> completion (16224 B): median {st.median(s):.3f} ms, p90 {s[int(.9 * len(s))]:.3f}, max {s[-1]:.3f}; "
              f"over 0.691 ms: {over} of {len(lat)}; last-of-frame (P4) median {st.median(sl):.3f} ms, "
              f"over 0.691 ms: {sum(1 for x in sl if x > 0.691)} of {len(sl)}; first-of-frame (P1) median "
              f"{st.median(lat_first):.3f} ms, max {max(lat_first):.3f}")
    s = sorted(since)
    print(f"   latest prime -> field check: median {st.median(s):.3f} ms, p10 {s[int(.1 * len(s))]:.3f}; "
          f"busy checks {len(busy_since)} at median {st.median(busy_since) if busy_since else float('nan'):.3f} ms after a prime")
