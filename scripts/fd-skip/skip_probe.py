#!/usr/bin/env python3
"""Emulator probe for TESTING.md 42.74 (agent 42.74): the Compact 1.3.0.0 patched 32 Hz stream in the FW-V1 emulator.
Run from any directory with the FW-V1 emulator venv:  <FW-V1>/emu/.venv/bin/python skip_probe.py ...
Writes a JSON record (frames, field-start checks, transfer completions, primes, torn transfers) and a one-line summary.
  - a host knob: serial (the emulator's default host: the next bulk IN waits for the 1 ms completion threshold),
    fast (no threshold: the next IN goes at once), and a fixed extra delay before each bulk IN (ms);
  - a torn-transfer check: each dTD's bytes are snapshotted when the firmware primes it (ENDPTPRIME) and compared
    with the bytes the emulator gathers when the transfer completes; a changed dTD is a torn frame. A dTD whose
    length changed in place is counted as not comparable (snap_length_mismatch);
  - a candidate switch, as an emulator-level model (Unicorn code hooks on the stock logic; NOT a firmware patch):
      stock    the firmware as built: the field-start check (usb_ep_has_flag) skips the whole field when busy
      overlap  the candidate of 42.74: the field-start check keeps only the header-buffer rule (a header dTD still in
               flight skips the field); at each line group the copy is skipped, with the stock skip actions
               (_10 = 1, FRAME_FLAG_D = 0), only if an in-flight dTD covers the 4 pool rows that group writes
      none     the field-start check off and no overlap check (unsafe: shows what the check protects)

Addresses are the 1.3.0.0 runtime addresses from targets/compact_8hz_1_3_0_0/image_layout.ld (see TESTING.md 42.74):
  CBZ after BL usb_ep_has_flag in frame_capture_step        0x100864F8   (BL at 0x100864F4)
  frame_line_dispatch entry                                  0x10085DF4
  stream session block (_00 line, _10 skip flag)             0x100043F0  (_10 at +0x10)
  frame mode gate (u16), per-mode program table              0x10004710, 0x10001F6C (8-byte records)
  FRAME_FLAG_C/D/E                                            0x100046F0 / 0x100046F1 / 0x100046F2
  stream IN queue pointer cell                                0x10002CA4 (queue: slot[8] of 40 B, count at +0x148)
  frame pool                                                  0x20000000, 416 bytes per row

usage: skip_probe.py <stock|patched> <frames> <host:serial|fast> <delay_ms> <check:stock|overlap|none> <out.json>
  env SKIP_PROBE_POOLLOG=1 logs every CPU write into the frame pool (with its PC); SKIP_PROBE_HDRLOG=1 logs a hash of
  the header buffer (0x10005962, 0x680 bytes) at every field start.
"""
import json
import os
import struct
import sys
import tempfile
import time
from collections import Counter

EMU = "/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu"
sys.path.insert(0, EMU)
os.chdir(EMU)
os.environ.setdefault("SEEK_EMU_DIR", EMU)

from pathlib import Path  # noqa: E402

import fps_patch as F  # noqa: E402
import framerate  # noqa: E402
import framerate_tests as FT  # noqa: E402
from seekemu import corpus as C  # noqa: E402
from seekemu import Machine, UsbHost  # noqa: E402
from seekemu.usb_device import Usb0  # noqa: E402
from unicorn import UC_HOOK_CODE, UC_HOOK_MEM_WRITE  # noqa: E402
from unicorn.arm_const import UC_ARM_REG_PC, UC_ARM_REG_R0  # noqa: E402

variant, frames, host_mode, delay_ms, check, out = sys.argv[1], int(sys.argv[2]), sys.argv[3], float(sys.argv[4]), sys.argv[5], os.path.abspath(sys.argv[6])
assert variant in ('stock', 'patched') and host_mode in ('serial', 'fast') and check in ('stock', 'overlap', 'none')

CBZ_ADDR = 0x100864F8
DISPATCH_ADDR = 0x10085DF4
SESSION = 0x100043F0
MODE_GATE = 0x10004710
MODE_TABLE = 0x10001F6C
FLAG_D = 0x100046F1
FLAG_E = 0x100046F2
QCELL = 0x10002CA4
POOL = 0x20000000
ROW = 416
GROUP = 4 * ROW

STATS = Counter()
TORN = []
SNAP = {}
SNAP_T = {}
MACH = {}
DELAY_PS = int(delay_ms * 1e9)


def rd(m, a, n):
    return bytes(m.uc.mem_read(a, n))


def r8(m, a):
    return rd(m, a, 1)[0]


def r16(m, a):
    return struct.unpack('<H', rd(m, a, 2))[0]


def r32(m, a):
    return struct.unpack('<I', rd(m, a, 4))[0]


def overlaps(a0, a1, b0, b1):
    return a0 < b1 and b0 < a1


PRIMES = []      # (ms, bytes) at each IN dTD the firmware primes (first sight of a dTD in the chain)
FIELDS = []      # (ms, busy) at every field-start check: busy=1 is a field the stock firmware skips
CONSUME = []     # (ms, bytes) at every IN transfer the emulator completes


def cbz_hook(uc, address, size, user):
    # the field-start check (usb_ep_has_flag's result in R0). Logged always; for check overlap/none the result is
    # overridden to "not busy", so the copy is not skipped at the field start.
    m = MACH['m']
    busy = uc.reg_read(UC_ARM_REG_R0)
    if check == 'overlap':
        # candidate: the header buffer is rewritten by the sensor at every field start, so a header dTD still in flight
        # keeps the stock skip; the pool rows are handled per copy group in dispatch_hook
        q = r32(m, QCELL)
        hdr_busy = 0
        for i in range(8):
            slot = q + 40 * i
            if r8(m, slot + 0x20) & 0xF:
                buf = r32(m, slot + 0x10)
                if overlaps(buf, buf + r32(m, slot + 0x14), 0x10005962, 0x10005962 + 0x680):
                    hdr_busy = 1
        busy = 1 if hdr_busy else 0
        uc.reg_write(UC_ARM_REG_R0, busy)
        STATS['hdr_busy_fields'] += hdr_busy
    FIELDS.append((round(m.now_ps() / 1e9, 3), int(busy != 0)))
    if os.environ.get('SKIP_PROBE_HDRLOG'):
        import hashlib
        HDR_HASH.append(hashlib.md5(bytes(uc.mem_read(0x10005962, 0x680))).hexdigest()[:8])
    STATS['cbz_hits'] += 1
    if check == 'none':
        uc.reg_write(UC_ARM_REG_R0, 0)


def dispatch_hook(uc, address, size, user):
    m = MACH['m']
    STATS['dispatch_hits'] += 1
    if r8(m, SESSION + 0x10):          # _10 already set: no copy this group
        return
    line = r32(m, SESSION + 0x00)
    if line == 0:
        return
    mode = r16(m, MODE_GATE)
    if mode == 7:
        return
    prog = r32(m, MODE_TABLE + 8 * mode)
    e = r8(m, FLAG_E)
    d = r8(m, FLAG_D)
    active = (r8(m, prog + 34 * e + 2 + 2 * d) >> 3) & 1
    if not active:
        return
    k = (line - 4) & 0xFFFF
    dst = POOL + ROW * k
    q = r32(m, QCELL)
    for i in range(8):
        slot = q + 40 * i
        if r8(m, slot + 0x20) & 0xF:
            buf = r32(m, slot + 0x10)
            ln = r32(m, slot + 0x14)
            if overlaps(buf, buf + ln, dst, dst + GROUP):
                STATS['overlap_skips'] += 1
                uc.mem_write(SESSION + 0x10, b'\x01')      # the stock skip: _10 = 1 ...
                uc.mem_write(FLAG_D, b'\x00')              # ... and the step back to 0
                return
    STATS['overlap_clear'] += 1


POOL_WRITES = []


def pool_write_hook(uc, access, address, size, value, user):
    m = MACH['m']
    if len(POOL_WRITES) < 200000:
        pc = uc.reg_read(UC_ARM_REG_PC)
        POOL_WRITES.append((round(m.now_ps() / 1e9, 3), address, size, hex(pc)))


HDR_WRITES = []
HDR_HASH = []


def hdr_write_hook(uc, access, address, size, value, user):
    m = MACH['m']
    if len(HDR_WRITES) < 200000:
        HDR_WRITES.append((round(m.now_ps() / 1e9, 3), address, size, hex(uc.reg_read(UC_ARM_REG_PC))))


def install(m):
    MACH['m'] = m
    if os.environ.get('SKIP_PROBE_POOLLOG'):
        m.uc.hook_add(UC_HOOK_MEM_WRITE, pool_write_hook, None, POOL, POOL + 0xFFFF)
    if os.environ.get('SKIP_PROBE_HDRLOG'):
        m.uc.hook_add(UC_HOOK_MEM_WRITE, hdr_write_hook, None, 0x10005962, 0x10005962 + 0x67F)
    m.uc.hook_add(UC_HOOK_CODE, cbz_hook, None, CBZ_ADDR, CBZ_ADDR)
    if check == 'overlap':
        m.uc.hook_add(UC_HOOK_CODE, dispatch_hook, None, DISPATCH_ADDR, DISPATCH_ADDR)


_orig_init = Machine.__init__


def _init(self, *a, **k):
    _orig_init(self, *a, **k)
    install(self)


Machine.__init__ = _init

# ---- host knobs
if host_mode == 'fast':
    def _no_threshold(self):
        # the host's own bookkeeping as in usb_host.UsbHost._completed, without the wait for the next threshold
        now = self.m.now_ps()
        self.last_done_ps = now
        self.threshold_waits += 1
        self.pause_log.append(('done', now, now))
        if False:
            yield None
    UsbHost._completed = _no_threshold

_orig_bulk_in = UsbHost.bulk_in


def _bulk_in(self, ep, limit=None, budget=None, soft=False):
    if DELAY_PS:
        yield from self._host_wait(self.m.now_ps() + DELAY_PS)
    data = yield from _orig_bulk_in(self, ep, limit=limit, budget=budget, soft=soft)
    return data


UsbHost.bulk_in = _bulk_in

# ---- torn-transfer check on the IN endpoint 1 (the frame stream, 0x81)


def _snap_chain(self, ep):
    """At each priming of the IN endpoint: snapshot every dTD now in the chain that has no snapshot, and drop the
    snapshots of dTDs that left the chain (flushed or retired by a path other than in_transfer), so a recycled dTD
    address never compares against a stale copy."""
    qh = self.dqh(ep, True)
    td = self._r32(qh + self.QH_NEXT)
    current = []
    n = 0
    while not (td & self.TD_TERMINATE) and n < 16:
        t = td & ~0x1F
        current.append(t)
        td = self._r32(t + self.TD_NEXT)
        n += 1
    for t in current:
        if t not in SNAP:
            token = self._r32(t + self.TD_TOKEN)
            total = (token >> 16) & 0x7FFF
            SNAP[t] = bytes(self._gather(self._td_pages(t), total))
            SNAP_T[t] = (self.m.now_ps() / 1e9, token, total)
            PRIMES.append((round(self.m.now_ps() / 1e9, 3), total))
            STATS['snap'] += 1
    for t in list(SNAP):
        if t not in current:
            SNAP.pop(t, None)
            SNAP_T.pop(t, None)
            STATS['snap_dropped'] += 1


_orig_write = Usb0.write


def _write(self, off, size, value):
    if off == self.ENDPTPRIME and (value & self.ep_bit(1, True)):
        _snap_chain(self, 1)
    return _orig_write(self, off, size, value)


Usb0.write = _write

_orig_in = Usb0.in_transfer


def _in_transfer(self, ep, limit=None):
    td = None
    if ep == 1:
        got = self._active_td(ep, True)
        td = None if got is None else got[1]
    data = _orig_in(self, ep, limit)
    if data is not None and ep == 1:
        CONSUME.append((round(self.m.now_ps() / 1e9, 3), len(data)))
    if data is not None and td is not None:
        snap = SNAP.pop(td, None)
        pt_saved = SNAP_T.pop(td, None)
        if snap is None:
            STATS['no_snapshot'] += 1
        elif len(snap) != len(data):
            STATS['snap_length_mismatch'] += 1      # the dTD was rewritten in place: not comparable
        else:
            n = len(data)
            if snap[:n] != data[:n]:
                diff = [i for i in range(n) if snap[i] != data[i]]
                STATS['torn_td'] += 1
                pt = pt_saved or (None, None, None)
                TORN.append({'t_ms': round(self.m.now_ps() / 1e9, 3), 'len': len(data),
                             'first_diff': diff[0], 'ndiff': len(diff), 'td': hex(td),
                             'primed_ms': None if pt[0] is None else round(pt[0], 3),
                             'token': None if pt[1] is None else hex(pt[1]), 'total': pt[2],
                             'diff_offsets': diff[:12]})
            else:
                STATS['td_clean'] += 1
    return data


Usb0.in_transfer = _in_transfer

# ---- the image (stock or the 32 Hz patch), as corpus.resolve sees it
_test = next(t for t in FT.load_tests(C.load()) if t.id == 'compact-1.3.0.0')
entry_id = _test.entry_id
entry = _test.entry
src = str(C.resolve(entry))
orig_resolve = C.resolve
if variant == 'patched':
    patch = next(p for p in F.PATCHES if p.key == 'compact_32k-1.3.0.0-to32')
    with open(src, 'rb') as fh:
        stock = fh.read()
    booted, rows, changed = F.patch_bytes(stock, where=src, target=patch.target)
    tmp = tempfile.NamedTemporaryFile(prefix='emu-130-patched-', suffix='.bin', delete=False)
    tmp.write(booted)
    tmp.close()
    patched_path = Path(tmp.name)

    def resolve(e):
        return patched_path if e['id'] == entry_id else orig_resolve(e)

    C.resolve = resolve

got = []
t_wall = time.time()
rec = framerate.run_entry(entry_id, frames, frames_out=got,
                          ip={'mode': 8, 'pro_path': False, 'op_zero': True})
wall = round(time.time() - t_wall, 1)

idx = []
types = []
sizes = Counter()
for f in got:
    sizes[len(f)] += 1
    hw = struct.unpack_from('<%dH' % (len(f) // 2), f, 0)
    if len(f) == 64896:
        idx.append((hw[40] - 1) & 0x3FFF)
        types.append(hw[10])
    else:
        idx.append(hw[1] & 0x3FFF)
        types.append(hw[842] if len(hw) > 842 else None)
with open(out, 'w') as fh:
    json.dump({'variant': variant, 'frames_req': frames, 'host': host_mode, 'delay_ms': delay_ms,
               'check': check, 'wall_s': wall, 'frames': len(got), 'sizes': dict(sizes),
               'idx': idx, 'types': types, 'stats': dict(STATS), 'torn': TORN[:200],
               'rec_stop': rec.get('stop_reason'), 'rec_fault': rec.get('fault'),
               'pool_writes': POOL_WRITES[:50000], 'hdr_writes': HDR_WRITES[:50000], 'hdr_hash': HDR_HASH, 'fields': FIELDS, 'consume': CONSUME, 'primes': PRIMES}, fh)
print(f"{variant} host={host_mode} delay={delay_ms}ms check={check}: frames {len(got)} "
      f"sizes {dict(sizes)} wall {wall}s stats {dict(STATS)} torn {len(TORN)}", file=sys.stderr)
