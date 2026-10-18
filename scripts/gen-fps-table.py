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

It also regenerates the differential fixture packages/core/test/preservation/fps-patch-python.json from the same
Python tool, so the two cannot drift: the images (each table stock image, and each corpus build that already runs at a
target rate) and the plain-stored stock banks of every 4 MiB dump under the corpus roots, with the Python's output for
each. The roots are --corpus (colon-separated), else SEEK_FPS_CORPUS, else the list the differential test uses.
"""
import argparse
import hashlib
import json
import os
import re
import sys
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLE = os.path.join(ROOT, 'packages', 'core', 'src', 'preservation', 'fps-patch-table.ts')
FIXTURE = os.path.join(ROOT, 'packages', 'core', 'test', 'preservation', 'fps-patch-python.json')
DEFAULT_FW_V1 = '/Users/yrambler2001/things/a.noindex/seek/FW-V1'
DEFAULT_CORPUS = (
    '/Users/yrambler2001/things/a.noindex/seek/SEEK_FULL_DUMPS_BY_CAMERA',
    '/Users/yrambler2001/things/a.noindex/seek/SEEK_FULL_DUMPS',
    '/Users/yrambler2001/things/a.noindex/seek/SEEK_DUMPS',
    '/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu/data',
    '/Users/yrambler2001/things/a.noindex/seek/FW-V1/targets',
)
DUMP_SIZE = 4 * 1024 * 1024
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


def corpus_roots(arg):
    """The directories the differential test searches: --corpus, else SEEK_FPS_CORPUS, else DEFAULT_CORPUS."""
    if arg:
        roots = arg.split(':')
    else:
        roots = [r for r in os.environ.get('SEEK_FPS_CORPUS', '').split(':') if r] or list(DEFAULT_CORPUS)
    return [r for r in roots if os.path.isdir(r)]


def _walk_files(roots):
    """Every regular file under the roots, walked as the differential test walks them (no .git, no node_modules)."""
    for root in roots:
        for dp, dn, fn in os.walk(root):
            dn[:] = [d for d in dn if d not in ('.git', 'node_modules')]
            for name in fn:
                yield os.path.join(dp, name)


def image_cases(F, C, roots):
    """One case per distinct decrypted image: each table stock image (it must be in the corpus manifest), and each
    corpus build that already runs at a target rate (KNOWN_RATE; skipped when the manifest has no image of it)."""
    by_sha = {e['sha256']: e for e in C.load()['entries']}
    stock = []
    for p in F.PATCHES:
        if p.stock_sha256 not in stock:
            stock.append(p.stock_sha256)
    cases = []
    for sha in sorted(set(stock) | set(F.KNOWN_RATE)):
        entry = by_sha.get(sha)
        if entry is None:
            if sha in stock:
                raise SystemExit(f'stock image {sha[:12]} of a table entry is not in the corpus manifest')
            continue
        data = C.resolve(entry).read_bytes()
        n = F.image_length(data)
        if n is None or hashlib.sha256(data[:n]).hexdigest() != sha:
            if sha in stock:
                raise SystemExit(f'corpus file for stock image {sha[:12]} is not that image')
            continue
        outputs = []
        for p in F.PATCHES:
            if p.stock_sha256 != sha:
                continue
            new = F.apply_patch(data[:n], p)
            outputs.append({
                'patch': p.key,
                'target': p.target,
                'version': p.version,
                'outputSha256': hashlib.sha256(new[:n]).hexdigest(),
                'changed': [i for i in range(n) if data[i] != new[i]],
            })
        state = F.identify(data[:n]).state
        cases.append({
            'inputSha256': sha,
            'length': n,
            'pythonState': state,
            'outputs': outputs,
            # the build's name only where the Python says it already runs at a rate (a stock image that is also a
            # KNOWN_RATE build, the 16 Hz FF images, is 'stock' to the Python: identify checks stock first)
            'known': F.KNOWN_RATE[sha][0] if state is not None and state.startswith('known-') else None,
        })
    return cases


def bank_cases(F, C, roots):
    """One case per plain-stored stock bank: every 4 MiB dump under the roots (once per sha256), each slot whose STORED
    bytes are a stock image of a table entry. Banks that are cipher-stored, patched, known or unknown are not cases."""
    cases = []
    seen = set()
    for path in _walk_files(roots):
        try:
            if os.path.getsize(path) != DUMP_SIZE:
                continue
            with open(path, 'rb') as fh:
                data = fh.read()
        except OSError:
            continue
        dump_sha = hashlib.sha256(data).hexdigest()
        if dump_sha in seen:
            continue
        seen.add(dump_sha)
        for s in C.scan_slots(data):
            off = int(s['addr'], 16) - C.FLASH_BASE
            length = s['length']
            stored = bytes(data[off:off + length])
            ident = F.identify(stored)
            if ident.state != 'stock' or ident.patch is None:
                continue
            new = F.apply_patch(stored, ident.patch)
            cases.append({
                'dumpSha256': dump_sha,
                'bankAddress': int(s['addr'], 16),
                'length': length,
                'target': ident.patch.target,
                'pythonState': 'stock',
                'storedPlain': True,
                'pythonAction': 'patch applies',
                'patch': ident.patch.key,
                'outputSha256': hashlib.sha256(new).hexdigest(),
                'changed': [i for i in range(length) if stored[i] != new[i]],
            })
    return sorted(cases, key=lambda c: (c['dumpSha256'], c['bankAddress']))


def write_fixture(F, C, roots):
    fixture = {
        'generator': 'FW-V1 emu/fps_patch.py (identify, apply_patch, verify) over the decrypted corpus images and the '
                     '4 MiB corpus dumps, written by scripts/gen-fps-table.py',
        'note': 'images: one case per distinct decrypted image (each table stock image, and each corpus build that already '
                'runs at a target rate); outputs = every table entry whose stock image it is. banks: one case per '
                'plain-stored stock bank of a corpus dump; storedPlain banks carry the Python output for the TS check.',
        'images': sorted(image_cases(F, C, roots), key=lambda c: c['inputSha256']),
        'banks': bank_cases(F, C, roots),
    }
    with open(FIXTURE, 'w') as fh:
        fh.write(json.dumps(fixture, indent=1) + '\n')
    outputs = sum(len(c['outputs']) for c in fixture['images'])
    print(f'wrote {FIXTURE}: {len(fixture["images"])} images, {outputs} entry outputs, {len(fixture["banks"])} banks')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fw-v1', default=DEFAULT_FW_V1)
    ap.add_argument('--corpus', default=None,
                    help='colon-separated corpus roots for the differential fixture (default SEEK_FPS_CORPUS, else the test list)')
    ap.add_argument('--no-fixture', action='store_true', help='regenerate the TypeScript table only')
    args = ap.parse_args()
    emu = os.path.join(args.fw_v1, 'emu')
    sys.path.insert(0, emu)
    sys.dont_write_bytecode = True
    import fps_patch as F  # noqa: E402
    from seekemu import corpus as C  # noqa: E402
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
    if not args.no_fixture:
        write_fixture(F, C, corpus_roots(args.corpus))


if __name__ == '__main__':
    main()
