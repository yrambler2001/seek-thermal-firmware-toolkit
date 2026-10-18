#!/usr/bin/env python3
"""Regenerates packages/core/src/preservation/fps-patch-table.ts from FW-V1 emu/fps_patch.py.

    /Users/yrambler2001/things/a.noindex/seek/FW-V1/emu/.venv/bin/python scripts/gen-fps-table.py [--fw-v1 DIR]

The Python table is the source of truth (PATCHES, KNOWN_RATE, NOT_PATCHED). This script rewrites the three
data regions of the TypeScript file (the table, the known builds, the notes) and keeps the hand-written header
and interface. Every entry gets its evidence as a plain-text comment, and every byte edit gets the explanation
written above it in fps_patch.py (the comment lines directly above its Edit(...)), so the two files cannot
drift and the TypeScript is as readable as the Python.

After running it: npx prettier --write packages/core/src/preservation/fps-patch-table.ts, then the differential
test (packages/core/test/preservation/fps-patch.differential.test.ts) checks the result byte for byte.
"""
import argparse
import os
import re
import sys
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLE = os.path.join(ROOT, 'packages', 'core', 'src', 'preservation', 'fps-patch-table.ts')
DEFAULT_FW_V1 = '/Users/yrambler2001/things/a.noindex/seek/FW-V1'
WIDTH = 108


def q(text):
    return "'" + text.replace('\\', '\\\\').replace("'", "\\'") + "'"


def wrap_comment(text, indent):
    """A plain-text comment: paragraphs kept, words never split, no letter spacing."""
    out = []
    for para in text.split('\n'):
        para = ' '.join(para.split())
        if not para:
            continue
        for line in textwrap.wrap(para, WIDTH - len(indent) - 3, break_long_words=False, break_on_hyphens=False):
            out.append(f'{indent}// {line}')
    return out


def edit_comments(source):
    """key -> [comment text of each Edit, in order], read from the comment lines above each Edit( in fps_patch.py."""
    result = {}
    key = None
    pending = []
    for line in source.split('\n'):
        m = re.search(r"key='([^']+)'", line)
        if m and line.strip().startswith(('key=', 'Patch(')) or (m and 'family=' in line):
            key = m.group(1)
            result[key] = []
            pending = []
            continue
        s = line.strip()
        if key is None:
            continue
        if s.startswith('#'):
            pending.append(s.lstrip('#').strip())
        elif s.startswith('Edit('):
            result[key].append(' '.join(pending))
            pending = []
        elif s and not s.startswith(('bytes.fromhex', "'", ')')):
            pending = []
    return result


def fallback(edit):
    n = sum(1 for a, b in zip(edit.before, edit.after) if a != b)
    return (f'changes {n} byte(s) at image +0x{edit.offset:X}: {edit.before.hex()} becomes {edit.after.hex()} '
            '(no explanation was written in fps_patch.py for this edit)')


def render_patch(p, comments):
    ind = '    '
    lines = ['  {']
    lines += wrap_comment(f'{p.key}. {p.evidence}', ind)
    lines.append(f'{ind}id: {q(p.key)},')
    lines.append(f'{ind}family: {q(p.family)},')
    lines.append(f'{ind}version: {q(p.version)},')
    lines.append(f'{ind}fromHz: {p.from_hz},')
    lines.append(f'{ind}targetHz: {p.target},')
    lines.append(f'{ind}stockSha256: {q(p.stock_sha256)},')
    lines.append(f'{ind}patchedSha256: {q(p.patched_sha256)},')
    lines.append(f'{ind}length: {p.length},')
    lines.append(f'{ind}edits: [')
    for k, e in enumerate(p.edits):
        why = comments[k] if k < len(comments) and comments[k] else fallback(e)
        lines += wrap_comment(why, ind + '  ')
        lines.append(f"{ind}  {{ offset: 0x{e.offset:x}, before: '{e.before.hex()}', after: '{e.after.hex()}' }},")
    lines.append(f'{ind}],')
    label, off, length = p.row
    lines.append(f'{ind}row: {{ label: {q(label)}, offset: 0x{off:x}, length: {length} }},')
    if p.sibling is None:
        lines.append(f'{ind}sibling: null,')
    else:
        sha, soff, slen = p.sibling
        lines.append(f'{ind}sibling: {{ sha256: {q(sha)}, offset: 0x{soff:x}, length: {slen} }},')
    lines.append('  },')
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fw-v1', default=DEFAULT_FW_V1)
    args = ap.parse_args()
    emu = os.path.join(args.fw_v1, 'emu')
    sys.path.insert(0, emu)
    import fps_patch as F  # noqa: E402
    source = open(os.path.join(emu, 'fps_patch.py')).read()
    comments = edit_comments(source)

    ts = open(TABLE).read()
    # header
    ts = re.sub(
        r"/\* =+ \*\n \* GENERATED from FW-V1 emu/fps_patch\.py.*?\n \* =+ \*/",
        "/* ==================================================================== *\n"
        " * GENERATED from FW-V1 emu/fps_patch.py (PATCHES, KNOWN_RATE, NOT_PATCHED) by\n"
        " * scripts/gen-fps-table.py. Do not edit the entries by hand: change fps_patch.py and run the\n"
        " * script again. test/preservation/fps-patch.differential.test.ts checks the result byte for byte\n"
        " * against the Python output. Bytes are hex strings here; fps-patch.ts turns them into byte arrays\n"
        " * and gates them. Each entry carries its evidence, and each byte edit says what it changes.\n"
        " * ==================================================================== */",
        ts, count=1, flags=re.S)
    # the table
    a = ts.index('export const FPS_PATCH_TABLE: readonly FpsPatchSource[] = [')
    b = ts.index('\n];\n', a) + len('\n];\n')
    table = 'export const FPS_PATCH_TABLE: readonly FpsPatchSource[] = [\n'
    table += '\n'.join(render_patch(p, comments.get(p.key, [])) for p in F.PATCHES) + '\n];\n'
    ts = ts[:a] + table + ts[b:]
    # known builds
    a = ts.index('export const FPS_KNOWN_RATE')
    b = ts.index('\n};\n', a) + len('\n};\n')
    known = ('export const FPS_KNOWN_RATE: Readonly<\n  Record<string, { readonly name: string; readonly hz: number }>\n> = {\n'
             + ''.join(f"  {q(sha)}: {{ name: {q(name)}, hz: {hz} }},\n" for sha, (name, hz) in F.KNOWN_RATE.items())
             + '};\n')
    ts = ts[:a] + known + ts[b:]
    # notes
    a = ts.index('export const FPS_NOT_PATCHED_NOTES')
    b = ts.index('\n];', a) + len('\n];')
    notes = ('export const FPS_NOT_PATCHED_NOTES: readonly string[] = [\n'
             + ''.join(f'  {q(n)},\n' for n in F.NOT_PATCHED) + '];')
    ts = ts[:a] + notes + ts[b:]
    open(TABLE, 'w').write(ts)
    missing = [(p.key, k) for p in F.PATCHES for k, c in enumerate(comments.get(p.key, [])) if not c]
    short = [p.key for p in F.PATCHES if len(comments.get(p.key, [])) != len(p.edits)]
    print(f'wrote {TABLE}: {len(F.PATCHES)} entries, {len(F.KNOWN_RATE)} known builds, {len(F.NOT_PATCHED)} notes')
    print('edits without a Python comment:', missing or 'none')
    print('entries whose Edit count differs from the comments found:', short or 'none')


if __name__ == '__main__':
    main()
