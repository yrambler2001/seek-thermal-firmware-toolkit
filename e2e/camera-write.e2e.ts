/* ==================================================================== *
 * The camera write flow — `npm run e2e:write`.
 *
 * Preserve 02 -> 03 -> 04, every step held to the camera's own row of the
 * expectation table (`lib/preserve-expectations.ts`): the row the camera's
 * version, build and edit select, never one the operator picks.
 *
 *   1. Connect, and Dump & decrypt: the image this run holds the camera to,
 *      and the version it answered on the wire.
 *   2. Step 02 (read-only): the plan must be the row's EXACTLY — the build,
 *      the edit and its balance, the sites, the rebalance word, the chunks,
 *      the bank, the bytes that move, no reboot — and the backup must equal
 *      the dump in every block both read. Anything else stops the run here.
 *   3. The gate (`approveWrite`, lib/supervised-write.ts). On the emulator it
 *      waves through. On the camera it needs `SEEK_E2E_WRITE=i-understand` and
 *      no CI, and prints the plan before it lets the write go;
 *      `SEEK_E2E_WRITE=dry-run` stops here, nothing written. Without the env
 *      switch it refuses, so nothing is ever written to the camera by default.
 *   4. Steps 03 and 04 in a new window: the app reopened with the write
 *      guards (`PRESERVE_WRITE`, and on the camera the page guard of
 *      `writeGuardScript({ lifted: true })`, seeded with the version step 02
 *      matched, each phase opened with its row's exact budget: the chunks,
 *      one commit with the plan's checksum, the resets), connected, the
 *      step 02 run file loaded, then the commit, the
 *      drain, the restore and the verify, each checked against the row. The
 *      emulator runs the same sequence (`SEEK_E2E_WRITE_FULL=1`), so the path a
 *      person takes on the camera is the one proven there.
 *
 * Step 03's checks are soft: once the commit has landed, step 04 must still
 * run to put the original bank back, whatever the dump looked like.
 * ==================================================================== */

import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { Page } from 'puppeteer-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bankWordsOf } from '@seek-fw/core';

import { say } from './lib/browser.js';
import {
  NEVER_ON_THE_WIRE,
  checkCameraName,
  checkCameraVersion,
  checkDumpArchive,
  checkStep02RunFile,
  checkStep03Offered,
  writeGuardScript,
} from './lib/camera-flow.js';
import {
  describeWire,
  entry,
  runState,
  sha256,
  wireSince,
  type RunStateView,
} from './lib/checks.js';
import { readZip } from './lib/zip.js';
import { guardOf, setGuard } from './lib/electron-camera.js';
import {
  BENCH_PART_1300,
  describeKey,
  hexWord,
  knownPartByDump,
  preserveRowFor,
  type KnownPart,
  type PreserveRow,
} from './lib/preserve-expectations.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';
import {
  EMU_FLASH,
  emuFlashAsBooted,
  openTarget,
  targetUnavailable,
  wantedTarget,
  type TargetHandle,
} from './lib/target.js';
import {
  bridgeOf,
  expectedImageSha,
  guardInstalled,
  refusalsOf,
  runStep02,
  wireOf,
} from './lib/target-tools.js';
import {
  PHASE_FOLDER,
  PRESERVE_WRITE,
  Wizard,
  phaseSection,
  type DumpRun,
  type PhaseId,
  type PhaseRun,
} from './lib/wizard.js';

const FULL = process.env.SEEK_E2E_WRITE_FULL === '1';
const KEEP = process.env.SEEK_E2E_KEEP === '1';
const HEADED = process.env.SEEK_E2E_HEADED === '1';
const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-write-${String(process.pid)}`);

const FLASH_BYTES = 4 * 1024 * 1024;
const FLASH_BASE = 0x14000000;
/** The 31 windows step 02 backs up and step 04 verifies: 0x14010000..0x141FFFFF. */
const WINDOWS = { from: 0x10000, to: 0x200000 } as const;
/** Resets a write phase may send beyond its row's, before the page guard
 *  refuses: the app's own retries (a page-shifted drain, a probe reboot) go
 *  out and are reported by the exact count after the phase; a loop does not. */
const RESET_SLACK = 2;

const target = wantedTarget('emu');
const reason = targetUnavailable(target);
const title = `write flow [${target}]`;
if (reason !== null) process.stderr.write(`\n[skip] ${title}: ${reason}\n`);

/** The flash image inside a Dump & decrypt archive. */
function dumpImageOf(dump: DumpRun): Uint8Array {
  return (
    dump.entries.find((e) => /^[^/]+\/flash_dump_original\.bin$/.test(e.name))?.data ??
    new Uint8Array(0)
  );
}

/** The firmware version the app recorded in a dump's manifest. */
function manifestVersion(dump: DumpRun): string | null {
  const manifest = dump.entries.find((e) => /^[^/]+\/manifest\.json$/.test(e.name));
  if (manifest === undefined) return null;
  const parsed = JSON.parse(new TextDecoder().decode(manifest.data)) as {
    readonly selectorTable?: { readonly firmwareVersion?: string | null };
  };
  return parsed.selectorTable?.firmwareVersion ?? null;
}

/** Every offset where `a` and `b` differ. */
function diffOffsets(a: Uint8Array, b: Uint8Array): number[] {
  const out: number[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) out.push(i);
  return out;
}

/** Whether two images agree over the 31 windows. */
function sameWindows(a: Uint8Array, b: Uint8Array): boolean {
  return (
    diffOffsets(a.subarray(WINDOWS.from, WINDOWS.to), b.subarray(WINDOWS.from, WINDOWS.to))
      .length === 0
  );
}

const hexList = (offsets: readonly number[]): string =>
  offsets.map((o) => `0x${o.toString(16).toUpperCase()}`).join(', ');

/** A phase panel's log, line by line, as the page shows it. */
function phaseLog(page: Page, phase: PhaseId): Promise<string[]> {
  return page.evaluate(
    (id: string) =>
      [...(document.getElementById(`${id}-log`)?.children ?? [])].map((line) => line.textContent),
    `preserve-phase-${phase}`,
  );
}

/** One wire count in a wire delta, 0 when absent. */
const count = (wire: ReadonlyMap<string, number>, key: string): number => wire.get(key) ?? 0;

/**
 * Runs one write phase with its budget open. On the camera the page guard
 * lets out exactly the row's chunks, one commit with the plan's checksum, and
 * the row's resets (plus `RESET_SLACK`), and nothing once the phase is over.
 * The emulator's bridge needs nothing opened.
 */
async function inWritePhase<T>(
  t: TargetHandle,
  row: PreserveRow,
  phase: 'patch-dump' | 'restore-verify',
  body: () => Promise<T>,
): Promise<T> {
  if (t.name !== 'camera') return body();
  await setGuard(t.page, {
    allowReset: true,
    resetBudget: row.phases[phase].resets + RESET_SLACK,
    stageBudget: row.chunkCount,
    commitBudget: 1,
    commitSum16: phase === 'patch-dump' ? row.sum16.commit : row.sum16.restore,
  });
  try {
    return await body();
  } finally {
    await setGuard(t.page, {
      allowReset: false,
      resetBudget: null,
      stageBudget: 0,
      commitBudget: 0,
      commitSum16: null,
    }).catch(() => undefined);
  }
}

/** Every "Your turn" ask the phase raised was the reconnect pick, never a replug. */
function checkAsks(run: PhaseRun, row: PreserveRow, soft: boolean): void {
  const check = soft ? expect.soft : expect;
  check(run.asks, `${run.phase}: "Your turn" picks`).toBe(row.phases[run.phase].picks);
  for (const ask of run.askViews) {
    check(ask.text, 'the reconnect pick, not a replug').toContain(
      'press Connect device and pick the camera',
    );
    check(ask.tone, 'the calm blue box').toBe('info');
    check(ask.redAlerts, 'no red alert beside it').toEqual([]);
  }
}

/** A write phase's wire: the row's chunks, one commit, the row's resets. */
function checkWriteWire(
  wire: ReadonlyMap<string, number>,
  row: PreserveRow,
  phase: 'patch-dump' | 'restore-verify',
  soft: boolean,
): void {
  const check = soft ? expect.soft : expect;
  say(`${phase} wire: ${describeWire(wire)}`);
  check(count(wire, 'out 0x50'), 'SetFeaturedFirmwareData chunks').toBe(row.chunkCount);
  check(count(wire, 'out 0x51'), 'CompleteMemoryUpgrade').toBe(1);
  check(count(wire, 'out 0x59'), 'resets').toBe(row.phases[phase].resets);
  check(count(wire, 'out 0x55') + count(wire, 'out 0x5a'), 'the RAM selectors').toBe(0);
}

/**
 * What a step 03 that failed left on the camera, from its own run file and
 * the phase's wire: whether a commit can have landed, and the line to say.
 * Nothing was written when the run file still has the commit to do and no
 * flash write left the page (the counts include anything the guard refused).
 */
async function whatStep03Left(
  t: TargetHandle,
  wire: ReadonlyMap<string, number>,
): Promise<{ readonly written: boolean; readonly line: string }> {
  const file = await t.downloads
    .waitFor((name) => /^preserve-.*-failed\.zip$/.test(name), 30_000, 'the failed run file')
    .catch(() => null);
  const state = file === null ? null : runState(readZip(file.bytes));
  const commit = state?.steps.commit?.status ?? 'unknown';
  const next = state?.nextStep ?? 'unknown';
  const chunks = count(wire, 'out 0x50');
  const commits = count(wire, 'out 0x51');
  const facts =
    `the run file${file === null ? ' (none downloaded)' : ` ${file.name}`} says commit ` +
    `${commit}, next step ${next}; the wire shows ${String(chunks)} chunk(s) staged and ` +
    `${String(commits)} CompleteMemoryUpgrade`;
  if (commit !== 'done' && next === 'commit' && chunks === 0 && commits === 0) {
    return {
      written: false,
      line:
        `STEP 03 FAILED BEFORE ITS COMMIT — NOTHING WAS WRITTEN: ${facts}. The camera holds ` +
        'its original bank; there is nothing to finish or restore.',
    };
  }
  return {
    written: true,
    line:
      `STEP 03 DID NOT FINISH, AND A COMMIT MAY HAVE LANDED: ${facts}. Do not run this spec ` +
      'again from the start: the camera may hold the patched bank, and step 02 would read ' +
      "that. Load the last run file on the app's Preserve page and finish the run there (a " +
      'landed commit is never replayed).',
  };
}

/** The commit's lines in a phase log: its checksum, and its chunks with status 0. */
function checkCommitLog(
  lines: readonly string[],
  label: string,
  row: PreserveRow,
  sum16: number,
  soft: boolean,
): void {
  const check = soft ? expect.soft : expect;
  const text = lines.join('\n');
  check(text, `${label}: the checksum`).toContain(
    `${label}: committing, sum16 ${hexWord(sum16, 4)}`,
  );
  check(text, `${label}: the chunks and the status`).toMatch(
    new RegExp(`${label}: ${String(row.chunkCount)} chunks staged, \\d+ ms, commit status 0x0+\\b`),
  );
}

describe.skipIf(reason !== null)(title, () => {
  /** Steps 01-02 and the gate: the target's own read-only guards. */
  let read: TargetHandle | null = null;
  /** Steps 03-04: the target reopened with the write guards, after the gate. */
  let write: TargetHandle | null = null;

  let image: { readonly sha: string; readonly bytes: Uint8Array } | null = null;
  let version = '';
  let product = '';
  let step02: PhaseRun | null = null;
  let plan: {
    readonly row: PreserveRow;
    readonly part: KnownPart | null;
    readonly state: RunStateView;
    readonly backup: Uint8Array;
  } | null = null;
  let approval: WriteApproval | null = null;
  let step03: PhaseRun | null = null;
  /** What a failed step 03 left on the camera, when it failed. */
  let step03Left: { readonly written: boolean; readonly line: string } | null = null;
  let step04: PhaseRun | null = null;

  const need = <T>(value: T | null, what: string): T => {
    if (value === null) throw new Error(`${what} is not there (an earlier step failed)`);
    return value;
  };

  beforeAll(async () => {
    mkdirSync(SCRATCH, { recursive: true });
    say(`scratch: ${SCRATCH}`);
    read = await openTarget(target, { scratchDir: SCRATCH, headed: HEADED });
  });

  afterAll(async () => {
    await read?.close().catch(() => undefined);
    read = null;
    await write?.close().catch(() => undefined);
    write = null;
    /* A camera write's run files are the camera's flash: never deleted. */
    const keep = KEEP || (target === 'camera' && approval?.approved === true);
    if (keep) {
      say(`kept: ${SCRATCH}`);
      for (const run of [step02, step03, step04]) {
        if (run !== null) say(`  ${run.phase}: ${run.runFile.path}`);
      }
    } else {
      rmSync(SCRATCH, { recursive: true, force: true });
    }
  });

  it('connects, and Dump & decrypt reads the camera without a write or a reset', async () => {
    const t = need(read, 'the target');
    const name = await t.wizard.connect();
    product = t.name === 'camera' ? checkCameraName(name) : name;
    expect(await guardInstalled(t), 'the write guard is in place').toBe(true);

    const before = await wireOf(t);
    const dump = await t.wizard.dumpAndDecrypt(30 * 60_000);
    const wire = wireSince(before, await wireOf(t));
    say(`dump wire: ${describeWire(wire)}`);
    for (const op of [...NEVER_ON_THE_WIRE, 'out 0x59']) expect(wire.has(op), op).toBe(false);
    checkDumpArchive(dump, expectedImageSha(t));
    const bytes = dumpImageOf(dump);
    image = { sha: sha256(bytes), bytes };
    version =
      t.name === 'camera'
        ? checkCameraVersion((await guardOf(t.page)).version, dump)
        : (manifestVersion(dump) ?? '');
    expect(version, 'the version the camera reported').toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    const part = knownPartByDump(image.sha);
    say(
      `${product}: firmware ${version}, image ${image.sha} — ` +
        (part === null
          ? 'not a known part (its whole-part shas are reported, not pinned)'
          : part.name),
    );
  });

  it("step 02 builds the plan its firmware's row names, exactly, with no reboot", async () => {
    const t = need(read, 'the target');
    const theImage = need(image, "the Dump & decrypt's image");
    const before = await wireOf(t);
    const run = await runStep02(t);
    const wire = wireSince(before, await wireOf(t));
    say(`step 02 wire: ${describeWire(wire)}; ${String(run.asks)} pick(s)`);
    for (const op of NEVER_ON_THE_WIRE) expect(wire.has(op), op).toBe(false);
    step02 = run;

    const state = checkStep02RunFile(run);
    const row = preserveRowFor(state);
    if (row === null) {
      throw new Error(
        `no expectation row for ${describeKey(state)} — the write run is held to a measured ` +
          'row, so it stops here, before the gate. Measure one on the emulator and add it to ' +
          'PRESERVE_ROWS (e2e/lib/preserve-expectations.ts).',
      );
    }
    say(`the row: ${row.name}`);

    /* The camera's own values, as the run recorded them. */
    expect(state.expectedVersion, 'the version step 02 recorded is the one the dump read').toBe(
      version,
    );
    expect(state.expectedVersion).toBe(row.version);
    expect(state.buildId).toBe(row.buildId);
    expect(state.buildLabel).toBe(row.buildLabel);
    expect(state.buildStorage).toBe(row.buildStorage);
    /* The default choice writes one bank: the one the next start enters. */
    const key = need(
      state.targets?.length === 1 ? (state.targets[0] ?? null) : null,
      'one bank to write (the default choice: the bank the next start enters)',
    );
    const boot = need(state.boot ?? null, 'the boot facts');
    const bank = need(state.banks?.[key] ?? null, `the record of bank ${key}`);
    expect(state.choice, 'the default choice').toBe('next-start');
    expect(boot.nextStart, 'the run writes the bank the next start enters').toBe(key);
    expect(bank.imageDerivation ?? null, 'the edit on the factory image').toEqual(row.derivation);
    expect(bank.imageSha256, "the bank's decrypted image").toBe(row.imageSha256);
    expect(state.stagedForm).toBe(row.stagedForm);
    expect(state.restoreForm).toBe(row.restoreForm);
    expect(state.route).toBe('active-bank');
    expect(bank.slotReadShas?.[0], 'the two reads of the bank agree').toBe(bank.slotReadShas?.[1]);

    /* The plan. */
    const patch = need(bank.patch ?? null, 'the patch summary');
    expect(
      patch.sites.map(({ offset, before: b, after: a }) => ({ offset, before: b, after: a })),
      'the sites',
    ).toEqual(row.sites);
    expect(hexWord(patch.rebalanceWord), 'the rebalance word').toBe(hexWord(row.rebalanceWord));
    expect(patch.stagedLength).toBe(row.stagedLength);
    expect(patch.chunkCount).toBe(row.chunkCount);
    expect(patch.patchedSha256).toBe(row.patchedSha256);
    expect(patch.diffCount, 'the bytes that move').toBe(row.moved.length);
    expect(patch.armResetsCursor, 'the drain leaves the reader readable: no replug').toBe(
      row.armResetsCursor,
    );
    const plain = entry(
      run.entries,
      `${PHASE_FOLDER['read-build']}/preserve_bank_${key}_plain.bin`,
    );
    const patched = entry(
      run.entries,
      `${PHASE_FOLDER['read-build']}/preserve_bank_${key}_patched.bin`,
    );
    expect(sha256(plain)).toBe(row.imageSha256);
    expect(sha256(patched)).toBe(row.patchedSha256);
    expect(hexList(diffOffsets(plain, patched)), 'the patched image moves exactly these').toBe(
      hexList(row.moved),
    );

    /* The backup against the dump: two reads of the same 31 windows. */
    const backup = entry(run.entries, `${PHASE_FOLDER['read-build']}/preserve_backup_windows.bin`);
    expect(backup.length).toBe(FLASH_BYTES);
    expect(sha256(backup)).toBe(state.steps.backup?.artifactShas?.['preserve_backup_windows.bin']);
    expect(
      sameWindows(backup, theImage.bytes),
      'the backup equals the dump in all 31 windows',
    ).toBe(true);

    /* The bank, and on a known part its record and its backup. */
    const part = knownPartByDump(theImage.sha);
    say(
      `boot: cfg[0]=${hexWord(boot.word)}, next start ${String(boot.nextStart)} (${boot.why}); ` +
        `bank ${key} ${hexWord(bank.address)} (mode ${String(bank.mode)})`,
    );
    expect(bank.address).toBe({ a: 0x14050000, b: 0x14060000, r: 0x14070000 }[key]);
    if (part !== null) {
      expect(sha256(backup), `${part.name}: the backup`).toBe(part.backupImage);
      expect(hexWord(boot.word), 'the boot record').toBe(hexWord(part.cfg0));
      expect(
        { key, address: bank.address, mode: bank.mode },
        'the bank the record boots, the bank the run writes',
      ).toEqual(part.bank);
    }

    /* The wizard: no reboot, no pick, and the plan on the page. */
    checkAsks(run, row, false);
    expect(count(wire, 'out 0x59'), 'step 02 resets').toBe(row.phases['read-build'].resets);
    const shown = await t.page.evaluate(
      (sel: string) => document.querySelector(`${sel} details`)?.textContent ?? '',
      phaseSection('read-build'),
    );
    expect(shown).toContain(`The plan — ${row.buildLabel}, patches ${bankWordsOf(key)}`);
    expect(shown).toContain(`Bytes that move on the part${String(row.moved.length)}`);
    expect(shown).toContain(`${String(row.stagedLength)} B in ${String(row.chunkCount)} chunks`);
    expect(shown).toContain(
      row.derivation === null
        ? `Rebalance word${hexWord(row.rebalanceWord)}`
        : `${hexWord(row.rebalanceWord)} (was ${hexWord(row.derivation.balanceWord)}`,
    );
    for (const site of row.sites) expect(shown).toContain(hexWord(site.offset));
    await checkStep03Offered(t.wizard, t.page);
    expect(await refusalsOf(t)).toEqual([]);

    plan = { row, part, state, backup };
    say(
      `step 02 matches its row: ${row.buildLabel}` +
        (row.derivation === null ? '' : ` + ${row.derivation.label}`) +
        `; sites ${row.sites.map((s) => hexWord(s.offset)).join(' / ')}; rebalance ` +
        hexWord(row.rebalanceWord) +
        (row.derivation === null ? '' : ` (was ${hexWord(row.derivation.balanceWord)})`) +
        `; ${String(row.moved.length)} bytes move in bank ${key} ` +
        `${hexWord(bank.address)}: ${hexList(row.moved)}`,
    );
  });

  it('the write gate decides, after step 02 and before any write', async (test) => {
    test.skip(plan === null, 'step 02 did not match its row, so the gate is never reached');
    const t = need(read, 'the target');
    const p = need(plan, 'the plan');
    const theImage = need(image, 'the image');
    const written = p.state.targets?.[0];
    const bank =
      written === undefined
        ? 'no bank'
        : `bank ${written} (${hexWord(p.state.banks?.[written].address ?? 0)})`;
    const describe = [
      `camera ${product}: firmware ${version}, ${p.row.buildLabel}` +
        (p.row.derivation === null ? '' : ` carrying ${p.row.derivation.label}`) +
        `, run ${p.state.runId}`,
      `this run's image: sha256 ${theImage.sha}` +
        (p.part === null ? ' (not a known part)' : ` (${p.part.name})`),
      `step 03 COMMITS the patch into ${bank}: ${String(p.row.chunkCount)} chunks, checksum ` +
        `${hexWord(p.row.sum16.commit, 4)}; ${String(p.row.moved.length)} bytes move ` +
        `(${hexList(p.row.moved)}); rebalance word ${hexWord(p.row.rebalanceWord)}` +
        (p.row.derivation === null ? '' : ` (was ${hexWord(p.row.derivation.balanceWord)})`) +
        `; then ${String(p.row.phases['patch-dump'].resets)} reboot and the whole 4 MiB read`,
      `step 04 RESTORES the original bank: ${String(p.row.chunkCount)} chunks, checksum ` +
        `${hexWord(p.row.sum16.restore, 4)}; then ${String(p.row.phases['restore-verify'].resets)} ` +
        'reboot and the 31 windows verified against the backup',
      'each reboot is answered in the chooser by the run itself; nothing to unplug',
    ].join('\n  ');
    approval = await approveWrite(t.name, () => Promise.resolve({ describe: `  ${describe}` }));
    say(
      `write gate on ${t.name}: approved=${String(approval.approved)} ` +
        `dry=${String(approval.dry)} — ${approval.reason}`,
    );
    if (approval.approved) return;

    /* Camera default, or a camera dry run: nothing is written. We stopped at
     * the write boundary, step 02 done, next step commit. The page's guard is
     * the strict one, so its record is what went to the camera. */
    expect(t.name).toBe('camera');
    expect(t.writesSafe).toBe(false);
    const wire = await wireOf(t);
    say(`camera wire at the write boundary: ${describeWire(wire)}`);
    for (const op of NEVER_ON_THE_WIRE) expect(wire.has(op), op).toBe(false);
    expect(await refusalsOf(t), 'nothing was refused (no write was even tried)').toEqual([]);
    await checkStep03Offered(t.wizard, t.page);
    const text = await t.page.evaluate(() => document.body.innerText);
    expect(text).not.toContain('Write & whole-flash read — done');
  });

  it('step 03 commits the patch and drains the whole part, exactly as the row says', async (test) => {
    test.skip(
      approval?.approved !== true,
      approval === null ? 'the gate was not reached' : `no write: ${approval.reason}`,
    );
    test.skip(
      target === 'emu' && !FULL,
      'the emulator stops at the gate unless SEEK_E2E_WRITE_FULL=1 (emulator.e2e.ts writes 02-04 too)',
    );
    const p = need(plan, 'the plan');
    const run02 = need(step02, "step 02's run file");

    /* The app reopened with the write guards: a new window, as a person
     * would open the page again to continue from the step 02 run file. */
    await read?.close();
    read = null;
    /* The new window's page guard has seen no version, and the commit
     * session probes the reader before it reads one: seeded with the version
     * step 02 matched, the probe is judged as in the first window, and the
     * camera's own answer must agree with it. */
    const seededVersion = p.row.version;
    say(
      `the write: reopening the ${target} target with the write guards` +
        (target === 'camera' ? `, the page guard seeded with ${seededVersion} (step 02's)` : ''),
    );
    write = await openTarget(target, {
      scratchDir: path.join(SCRATCH, 'write'),
      headed: HEADED,
      uiGuard: PRESERVE_WRITE,
      ...(target === 'camera'
        ? { preloadSource: writeGuardScript({ lifted: true, seededVersion }) }
        : {}),
    });
    const t = write;
    const name = await t.wizard.connect();
    if (t.name === 'camera') {
      checkCameraName(name);
      expect((await guardOf(t.page)).seededVersion, 'the seed').toBe(seededVersion);
    }
    expect(await guardInstalled(t), 'the write guard is in place').toBe(true);
    expect(await t.wizard.loadRunFile(run02.runFile.path)).toMatch(/^Resumed at commit/);
    await checkStep03Offered(t.wizard, t.page);

    const before = await wireOf(t);
    let run: PhaseRun;
    try {
      run = await inWritePhase(t, p.row, 'patch-dump', () =>
        t.wizard.runPhase('patch-dump', { confirm: true, timeoutMs: 60 * 60_000 }),
      );
    } catch (error) {
      step03Left = await whatStep03Left(t, wireSince(before, await wireOf(t)));
      say(step03Left.line);
      const why = error instanceof Error ? error.message : String(error);
      throw new Error(`${step03Left.line}\n\n${why}`, { cause: error });
    }
    step03 = run;
    const wire = wireSince(before, await wireOf(t));

    /* Soft from here: the commit has landed, and step 04 must run whatever this shows. */
    checkAsks(run, p.row, true);
    checkWriteWire(wire, p.row, 'patch-dump', true);
    const state = runState(run.entries);
    expect.soft(state.steps.commit?.status).toBe('done');
    expect
      .soft(state.steps.commit?.notes)
      .toContain(
        `${String(p.row.chunkCount)} chunks staged (${String(p.row.stagedLength)} B, image length ` +
          `only), commit status 0, sum16 ${p.row.sum16.commit.toString(16)}`,
      );
    expect.soft(state.steps.drain?.status).toBe('done');
    expect.soft(state.nextStep).toBe('restore');
    checkCommitLog(
      await phaseLog(t.page, 'patch-dump'),
      'preserve commit',
      p.row,
      p.row.sum16.commit,
      true,
    );

    const folder = PHASE_FOLDER['patch-dump'];
    const raw = entry(run.entries, `${folder}/preserve_dump_patched.bin`);
    const delivered = entry(run.entries, `${folder}/preserve_dump_original.bin`);
    const rawSha = sha256(raw);
    const deliveredSha = sha256(delivered);
    say(`step 03: raw ${rawSha}, delivered ${deliveredSha}`);
    expect.soft(raw.length, 'the drain read the whole 4 MiB').toBe(FLASH_BYTES);
    expect.soft(delivered.length).toBe(FLASH_BYTES);
    expect.soft(state.rawDumpSha256).toBe(rawSha);
    expect.soft(state.deliveredSha256).toBe(deliveredSha);
    const written = p.state.targets?.[0];
    const bank = (written === undefined ? 0 : (p.state.banks?.[written].address ?? 0)) - FLASH_BASE;
    expect
      .soft(
        hexList(diffOffsets(raw, delivered)),
        'the commit moved exactly the row bytes, in the bank',
      )
      .toBe(hexList(p.row.moved.map((o) => bank + o)));
    expect
      .soft(
        sameWindows(delivered, p.backup),
        'the delivered image equals the backup in all 31 windows',
      )
      .toBe(true);
    if (p.part !== null) {
      expect.soft(rawSha, `${p.part.name}: the post-commit part`).toBe(p.part.postCommit);
      expect.soft(deliveredSha, `${p.part.name}: the part as it booted`).toBe(p.part.asBooted);
    }
    const text = await t.page.evaluate(() => document.body.innerText);
    expect.soft(text, 'no replug before step 04').not.toContain('Before step 04');
    expect
      .soft(
        await t.wizard.isEnabled(
          phaseSection('restore-verify'),
          Wizard.startLabel('restore-verify'),
        ),
        'step 04 is offered',
      )
      .toBe(true);
    expect.soft(await refusalsOf(t)).toEqual([]);
  });

  it('step 04 restores the original bank and verifies all 31 windows', async (test) => {
    if (approval?.approved === true && (target === 'camera' || FULL) && step03 === null) {
      say(
        step03Left?.line ??
          'STEP 03 DID NOT FINISH. Do not run this spec again from the start: the camera may ' +
            "hold the patched bank, and step 02 would read that. Load the last run file on the app's " +
            'Preserve page and finish the run there (a landed commit is never replayed).',
      );
    }
    test.skip(step03 === null, 'step 03 did not run or did not finish');
    const t = need(write, 'the write target');
    const p = need(plan, 'the plan');

    const before = await wireOf(t);
    const run = await inWritePhase(t, p.row, 'restore-verify', () =>
      t.wizard.runPhase('restore-verify', { confirm: true, timeoutMs: 60 * 60_000 }),
    );
    step04 = run;
    const wire = wireSince(before, await wireOf(t));
    checkAsks(run, p.row, false);
    checkWriteWire(wire, p.row, 'restore-verify', false);

    const state = runState(run.entries);
    expect(state.steps.restore?.status).toBe('done');
    expect(state.steps.restore?.notes).toBe(
      `original bank content staged back (${String(p.row.stagedLength)} B, ` +
        `${p.row.restoreStaged}) and committed; reset sent`,
    );
    expect(state.steps.restore?.rebootRefused).toBeUndefined();
    checkCommitLog(
      await phaseLog(t.page, 'restore-verify'),
      'preserve restore',
      p.row,
      p.row.sum16.restore,
      false,
    );
    expect(state.verify).toEqual({ diffBytes: 0, windowsRead: 31, badWindows: [] });
    expect(state.steps.verify?.notes).toMatch(
      /^a fresh boot re-read 31\/31 windows at 0 differing/,
    );
    expect(state.nextStep).toBe('done');
    const verified = entry(
      run.entries,
      `${PHASE_FOLDER['restore-verify']}/preserve_verify_windows.bin`,
    );
    expect(sha256(verified), 'the verify re-read equals the backup').toBe(sha256(p.backup));

    const text = await t.page.evaluate(() => document.body.innerText);
    expect(text).toContain('Done — your firmware is preserved');
    expect(text).toContain('matches the backup on all 31 blocks');
    expect(text).toContain('Verified — a perfect match.');
    expect(text).not.toContain('Before step 04');
    expect(await t.wizard.redAlerts()).toEqual([]);
  });

  it('nothing was refused, and the part is back as it booted', async (test) => {
    test.skip(step04 === null, 'step 04 did not run');
    const t = need(write, 'the write target');
    expect(await refusalsOf(t)).toEqual([]);
    const bridge = bridgeOf(t);
    if (t.emu !== null && bridge !== null) {
      await t.emu.settled();
      expect(t.emu.rebootFailure).toBeNull();
      expect(t.emu.deaths).toEqual([]);
      /* The drain's reset (step 03) and the restore's (step 04). */
      expect(t.emu.reboots.map((r) => r.boot)).toEqual([1, 2]);
      const last = t.emu.bootImages().at(-1);
      const now = sha256(new Uint8Array(readFileSync(last?.flashOut ?? '')));
      const asBooted = EMU_FLASH === '' ? BENCH_PART_1300.asBooted : emuFlashAsBooted();
      expect(now, "the emulator's flash after the restore is the part it booted").toBe(asBooted);
      say(`the emulator after the restore boots ${now}`);
      return;
    }
    const guard = await guardOf(t.page);
    expect(guard.refusals).toEqual([]);
    expect(t.app?.timeline.filter((line) => line.includes('REFUSED')) ?? []).toEqual([]);
    say(`resets on the wire: ${guard.resets.map((r) => r.outcome).join(', ')}`);
  });
});
