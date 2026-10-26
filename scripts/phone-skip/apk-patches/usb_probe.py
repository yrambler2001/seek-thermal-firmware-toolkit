"""usb_probe (experiment): times the camera library's frame reads; optional delays from debug.seekprobe.

Four calls are added to the library's frame read (helpers/java/seekpatch/UsbProbe.java), none
changed: before and after the frame request, before each chunk's UsbRequest.queue() and after each
requestWait().
"""
from __future__ import annotations

import re

from ..helpers import add_helpers
from ..smali import REG, PatchError, SmaliTree, methods, register_number
from .base import Options, ensure_unpatched, mark
from .usb_queue_finders import CONNECTION, FRAME_REQUEST_CALL, QUEUE_CALL, REQUEST, REQUEST_WAIT, WAIT_CALL

NAME = "usb_probe"
SUMMARY = "experiment: frame read timing log + delays from debug.seekprobe"
VERSIONS = "1.9.1 - 2.3.4"
RECOMMENDED = False

MARK = mark(NAME)
PROBE = "Lseekpatch/UsbProbe;"


def _one(found: list, what: str):
    if len(found) != 1:
        raise PatchError(f"{NAME}: expected one {what}, found {len(found)}")
    return found[0]


def apply(tree: SmaliTree, opts: Options) -> list[str]:
    ensure_unpatched(tree, NAME)
    queue_sig = REQUEST + "->queue(Ljava/nio/ByteBuffer;I)Z"
    rpath = _one([p for p in tree.containing(queue_sig) if any(m.descriptor == "run()V" and queue_sig in m.body for m in methods(tree.get(p)))],
                 "frame read (run() with UsbRequest.queue)")
    text = tree.get(rpath)
    run = next(m for m in methods(text) if m.descriptor == "run()V")
    body_at = text.index("\n", run.start) + 1

    call = _one(list(FRAME_REQUEST_CALL.finditer(run.body)), "frame request")
    after = run.body[call.end():]
    res = re.match(r"\n(?:[ \t]*(?:\.line \d+)?\n)*[ \t]*move-result " + REG + r"\n", after)
    end = call.end() + (res.end() - 1 if res else 0)

    q = _one(list(QUEUE_CALL.finditer(run.body)), "chunk queue")
    load = list(re.finditer(r"^[ \t]*aget-object " + re.escape(q.group(2)) + r", (" + REG + "), (" + REG + r")$", run.body[:q.start()], re.M))
    if not load:
        raise PatchError(f"{NAME}: the chunk request does not come from an array")
    requests, index = load[-1].group(1), load[-1].group(2)
    if max(register_number(r, run.body) for r in (requests, index)) > 15:
        raise PatchError(f"{NAME}: registers above v15")

    ind = call.group(1)
    edits = [(end, end, f"\n{ind}{MARK}\n{ind}invoke-static {{}}, {PROBE}->afterRequest()V\n"),
             (call.start(), call.start(), f"{ind}{MARK}\n{ind}invoke-static {{}}, {PROBE}->beforeRequest()V\n\n"),
             (q.start(), q.start(), f"{q.group(1)}{MARK}\n{q.group(1)}invoke-static {{{requests}, {index}}}, {PROBE}->beforeQueue([{REQUEST}I)V\n\n")]
    for a, b, new in sorted(edits, key=lambda e: -e[0]):
        text = text[:body_at + a] + new + text[body_at + b:]
    tree.set(rpath, text)

    wpath = _one(tree.containing(REQUEST_WAIT), "class with requestWait()")
    wtext = tree.get(wpath)
    wait = _one(list(WAIT_CALL.finditer(wtext)), "requestWait() with its result")
    tree.set(wpath, wtext[:wait.end()] + f"\n{wait.group(1)}{MARK}\n"
             f"{wait.group(1)}invoke-static {{{wait.group(2)}}}, {PROBE}->arrived({REQUEST})V\n" + wtext[wait.end():])
    add_helpers(tree, "UsbProbe")
    return [f"{tree.rel(rpath)} run(): UsbProbe before/after the frame request, before each queue",
            f"{tree.rel(wpath)}: UsbProbe.arrived() after requestWait()"]
