/**
 * Preserve's words for people: the lines the page's step log and the CLI print while a run goes,
 * the plan's rows and each step's result. One place, so the page and the CLI say the same thing.
 *
 * The owner's rule (TESTING.md 42.101): plain words for people; the code names (the solve
 * method ids, the family ids, the staged-form ids, mode and wire numbers, instruction text,
 * firmware symbol names) stay in JSON — the run file and the zip keep every detail. Hex
 * addresses and sha256 values are data and may appear. Nothing here names a front end.
 */

import { bankWordsOf } from '../profiles/locked-boot.js';
import { hexUp } from '../bytes.js';
import { bankListWords } from './banks.js';
import type { DrainCapability, RestoreFormId, StagedFormId } from './patch.js';
import type { BankKey } from './windows.js';

/** The code names people's text must not carry: the tests hold every line against these. */
export const PRESERVE_CODE_NAMES: readonly RegExp[] = [
  /r16-state/,
  /keyblock-verify/,
  /\bidentity —/,
  /\bfamily\b/,
  /compact-2016|v1-2014|compact-pro-\d/,
  /xor-ks0/,
  /\bks[0D]\b/,
  /\bmode \d/,
  /\bmode-2\b/,
  /\bwire-\d/,
  /\bP[1-4] /,
  /\b(?:ldrh?|strh?|mov\.w|bne\.n|b\.n|bl|nop)\b/,
  /\bd[48c]\b/,
  /\bVMA\b/,
  /\bstaged form\b/,
  /\bapp_init\b/,
];

/** `text` with its first letter upper case: a log line starts a sentence. */
export function sentence(text: string): string {
  return text.length === 0 ? text : `${text[0]?.toUpperCase() ?? ''}${text.slice(1)}`;
}

/** The build, as people name it: "Compact Pro 1.0.3.0 (9 Hz)". */
export function preserveBuildWords(state: {
  readonly buildLabel?: string | undefined;
  readonly expectedVersion?: string | undefined;
}): string {
  if (state.buildLabel !== undefined) return state.buildLabel;
  return state.expectedVersion === undefined
    ? 'not known yet'
    : `firmware ${state.expectedVersion}`;
}

/**
 * How the run got a bank's firmware out of what the camera stores, from the solve method id
 * (`solve.ts`). The id stays in the run file.
 */
export function derivationWords(method: string): string {
  if (method.startsWith('identity')) {
    return 'the camera stores its firmware as is, so there was nothing to decrypt';
  }
  if (method.startsWith('r16-state-from-crib')) {
    return method.includes('two-stream')
      ? "the camera's two keys were worked out from the backup and checked against its key blocks"
      : "the camera's key was worked out from the backup and checked against its key block";
  }
  return 'the firmware was recovered from the backup and checked';
}

/** The step-02 line for a bank whose firmware the run recovered. */
export function bankDerivedWords(bank: BankKey, method: string, buildLabel: string): string {
  const decrypted = !method.startsWith('identity');
  return (
    `${sentence(bankWordsOf(bank))} ${decrypted ? 'decrypted' : 'read'}: ` +
    `${derivationWords(method)}. It holds ${buildLabel}.`
  );
}

/** How a written bank is sent to the camera and put back, from the staged-form id. */
export function stagedFormWords(form: StagedFormId): string {
  switch (form) {
    case 'plain':
      return 'as the camera stores it (this camera keeps its firmware unencrypted)';
    case 'xor-ks0':
      return "in the form the camera stores it (encrypted under the camera's key)";
    case 'xor-ks0-ksD':
      return "in the form the camera stores it (encrypted under the camera's two keys)";
  }
}

/** The plan's restore row: can the run put a written bank back exactly? */
export function restoreFormWords(form: RestoreFormId): string {
  switch (form) {
    case 'capture-verbatim':
      return 'each written bank gets back the exact bytes the backup read from it';
    case 'factory-staged':
      return (
        'each written bank gets back its original firmware, written in the form the camera ' +
        'stores it, so the bank ends byte for byte as the backup read it'
      );
    case 'none':
      return (
        'not possible on this build: no form of the original firmware passes the camera’s own ' +
        'check and also stores back as the original bytes, so the run ends with the complete ' +
        'image and the patch still in place'
      );
  }
}

/** The plan's drain row: what the whole-flash read can promise on this build. */
export function drainCapabilityWords(capability: DrainCapability): string {
  if (!capability.wholePart) {
    return (
      'not possible on this build: the patched firmware cannot read the whole flash, so the run ' +
      'has no complete image to give'
    );
  }
  const notes: string[] = [];
  if (capability.rotation !== undefined) {
    notes.push('the camera serves it rotated, and the run puts it back in order');
  }
  if (capability.modeTwoHazardSites !== undefined) {
    notes.push('the patch avoids a read on this build that crashes the camera');
  }
  return (
    `the whole 4 MiB flash in one read, ${String(capability.losslessReadUnit)} bytes at a time` +
    (notes.length === 0 ? '' : `; ${notes.join('; ')}`)
  );
}

/**
 * What one changed instruction does, for the person: the site's name (`PatchSite.what` up to
 * its first " (", as the run file keeps it) stays in JSON.
 */
export function patchSiteWords(name: string): string {
  if (name.includes('mov.w r3,#0x10000 -> #0x400000')) {
    return "lets the camera's read command reach the whole 4 MiB flash, not just the first 64 KiB";
  }
  if (name.startsWith('ldrh r1,')) {
    return 'lets the read position count past 64 KiB, so a read does not wrap back to the start';
  }
  if (name.startsWith('ldrh r2,')) {
    return 'keeps the whole read position when it moves on after each read';
  }
  if (name.startsWith('strh r3,')) return 'saves the moved-on read position in full';
  if (name.startsWith('strh r5,')) {
    return (
      'clears the whole read position each time a read starts, so the camera can still be ' +
      'read after the whole-flash read'
    );
  }
  if (name.startsWith('mode-2 guard')) {
    return 'lets the whole-flash read start like any other read (the stock firmware turns it away)';
  }
  if (name.startsWith('mode-2 indirection')) {
    return (
      'points the whole-flash read at the start of the flash (the stock firmware points it at a ' +
      'value that crashes the camera)'
    );
  }
  if (name.startsWith('arm-tail hook')) {
    return 'removes a call that freezes the camera when a read starts on this build';
  }
  return 'changes one instruction the whole-flash read needs';
}

/* ---- the block reads: one line for the sweep, one more per block that differs ---------- */

/** How one block's session came up, as the opener (`openProbedSession`) reports it. */
export interface PreserveBlockAdmission {
  /** The block's flash address. */
  readonly address: number;
  /** Boots this block took: 1 means no restart was needed. */
  readonly boots: number;
}

/** The restarts a block took, in words: "no restart needed", "one restart before each". */
function restartWords(restarts: number, each: boolean): string {
  if (restarts === 0) return each ? 'no restart needed' : 'no restart';
  const count = restarts === 1 ? 'one restart' : `${String(restarts)} restarts`;
  return each ? `${count} before each` : `${count} before it`;
}

/**
 * The lines for a sweep of block reads (the backup, the check after the restore): one line for
 * the blocks that came up the same way, and one more line per block that took a different
 * number of restarts. The run file keeps the opener's words for each block.
 */
export function blockSweepWords(
  what: 'Backup' | 'Check',
  admissions: readonly PreserveBlockAdmission[],
): string[] {
  const verb = what === 'Backup' ? 'read' : 'read again';
  const counts = new Map<number, number>();
  for (const entry of admissions) counts.set(entry.boots, (counts.get(entry.boots) ?? 0) + 1);
  /* The usual case: the most blocks; on a tie, the fewer restarts. */
  const usual = [...counts].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0]?.[0] ?? 1;
  const odd = admissions.filter((entry) => entry.boots !== usual);
  const head =
    `${what}: ${String(admissions.length)} blocks ${verb}, ${restartWords(usual - 1, true)}` +
    (odd.length === 0 ? '.' : ` but ${String(odd.length)}:`);
  return [
    head,
    ...odd.map(
      (entry) =>
        `${what}: block ${hexUp(entry.address, 8)} took ${restartWords(entry.boots - 1, false)}.`,
    ),
  ];
}

/* ---- each step's result, in words --------------------------------------------------- */

/** The parts of the run state the step results read (structural: no import cycle with steps). */
export interface PreserveWordsState {
  readonly targets?: readonly BankKey[] | undefined;
  readonly drainEntered?: BankKey | null | undefined;
  readonly deliveredSha256?: string | undefined;
  readonly stagedForm?: StagedFormId | undefined;
  readonly boot?: { readonly nextStart: BankKey | null } | undefined;
  readonly banks?:
    | Record<
        BankKey,
        {
          readonly refused: string | null;
          readonly buildLabel?: string | undefined;
          readonly patch?: { readonly diffCount: number } | undefined;
        }
      >
    | undefined;
  readonly verify?:
    | {
        readonly windowsRead: number;
        readonly diffBytes: number;
        readonly badWindows: readonly number[];
      }
    | undefined;
  readonly steps: Partial<
    Record<
      'backup' | 'patch' | 'commit' | 'drain' | 'restore' | 'verify',
      { readonly status: 'done' | 'failed'; readonly error?: string | undefined } | undefined
    >
  >;
}

const ORDER: readonly BankKey[] = ['a', 'b', 'r'];

/** The banks the run could write, in A, B, R order. */
function writableOf(state: PreserveWordsState): BankKey[] {
  const banks = state.banks;
  return banks === undefined ? [] : ORDER.filter((key) => banks[key].refused === null);
}

/**
 * One step's result in plain words, for the CLI's last lines and the page's result rows. A
 * failed step says it failed and why; the run file keeps the step's full notes.
 */
export function preserveStepResultWords(
  state: PreserveWordsState,
  step: 'backup' | 'patch' | 'commit' | 'drain' | 'restore' | 'verify',
): string | null {
  const record = state.steps[step];
  if (record === undefined) return null;
  const label = STEP_LABEL[step];
  if (record.status === 'failed') {
    return `${label}: stopped — ${record.error ?? 'no reason was recorded'}`;
  }
  const targets = state.targets ?? [];
  switch (step) {
    case 'backup': {
      const writable = writableOf(state);
      const next = state.boot?.nextStart;
      return (
        `${label}: every block a normal read reaches was saved; ` +
        (writable.length === 0
          ? 'no bank holds firmware the run can patch'
          : `${bankListWords(writable)} hold${writable.length === 1 ? 's' : ''} firmware the ` +
            'run can patch') +
        (next === undefined
          ? '.'
          : `; the next start enters ${next === null ? 'a bank that is not known' : bankWordsOf(next)}.`)
      );
    }
    case 'patch': {
      const banks = state.banks;
      const counts = writableOf(state).map((key) => banks?.[key].patch?.diffCount ?? 0);
      const same = counts.every((count) => count === counts[0]);
      return (
        `${label}: built for ${bankListWords(writableOf(state))}` +
        (counts.length > 0 && same ? `; ${String(counts[0])} bytes change in each.` : '.')
      );
    }
    case 'commit':
      return (
        `${label}: ${bankListWords(targets)} written with the patch, and the camera accepted ` +
        (targets.length === 1 ? 'it.' : 'each.')
      );
    case 'drain':
      return state.deliveredSha256 === undefined
        ? `${label}: not read.`
        : `${label}: the whole 4 MiB flash was read` +
            (state.drainEntered === undefined || state.drainEntered === null
              ? ''
              : ` through ${bankWordsOf(state.drainEntered)}`) +
            `; the complete image has sha256 ${state.deliveredSha256}.`;
    case 'restore':
      return (
        `${label}: ${bankListWords(targets)} written back` +
        (state.stagedForm === undefined ? '' : ` ${stagedFormWords(state.stagedForm)}`) +
        '.'
      );
    case 'verify': {
      const verify = state.verify;
      if (verify === undefined) return `${label}: done.`;
      return verify.diffBytes === 0 && verify.badWindows.length === 0
        ? `${label}: ${String(verify.windowsRead)} blocks read again, 0 bytes differ — the ` +
            "camera's flash is byte-identical to the backup."
        : `${label}: ${String(verify.windowsRead)} blocks read again, ${String(verify.diffBytes)} ` +
            `bytes differ` +
            (verify.badWindows.length === 0
              ? ''
              : `, ${String(verify.badWindows.length)} block(s) could not be read`) +
            '.';
    }
  }
}

const STEP_LABEL = {
  backup: 'Backup',
  patch: 'Patch',
  commit: 'Write',
  drain: 'Whole-flash read',
  restore: 'Restore',
  verify: 'Check',
} as const;

/** The site's addresses, kept for callers that print one site per line. */
export function patchSiteLine(site: { readonly offset: number; readonly name: string }): string {
  return `${hexUp(site.offset)}  ${patchSiteWords(site.name)}`;
}
