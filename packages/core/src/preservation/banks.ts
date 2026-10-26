/* ==================================================================== *
 * Which banks a preservation run patches, and which bank the next start enters. Pure.
 *
 * WHY THIS EXISTS (TESTING.md 42.92). The run writes a temporary patch into a bank, resets the camera so
 * the patched image runs, reads the whole flash through it, and puts the bank back. The patch only runs if
 * the start after the reset ENTERS a patched bank. Which bank it enters is the bootloader's choice
 * (profiles/locked-boot.ts, the same rule on the 2014 and 2016 bootloaders): the boot-config word sets the
 * order (0 or 0xFFFFFFFF: A, B, R; 1: B, A, R; any other word: R, A, B), the first two are checked, the
 * last is entered unchecked. Before 42.92 the run patched the bank the word names first and nothing else,
 * whether or not that bank passes the check, and a start that entered another bank was not noticed until
 * the drain stalled.
 *
 * THE WARM BOOT [source]. Both bootloaders take a reboot request the application leaves in the boot record
 * (0xAA55FF01, written by its watchdog-warning handler, with the time since the start): when it is there
 * and the time is under 299,999 ms (2014, FW-V1 compact_8hz_1_3_0_0_bootloader/src/startup.c:76-82) or
 * 29,999 ms (2016, compact_pro_9hz_1_0_3_0_bootloader/src/startup.c:92-96), `boot_select_image` erases and
 * rewrites the entered bank's header word at +0x200 with the mark, writes 2 into the boot-config word and
 * enters recovery R (image.c:1081-1089 on both). The wire reset the run sends (ResetDevice 0x59, value 0:
 * `system_reset`, helpers.c) leaves no such request. A camera that took that path reads here as boot word
 * 2 with a bank whose header carries the mark, and the next start then enters R.
 *
 * WHAT THE RUN CAN WRITE. A bank is offered when both reads of it agree, its image derives and gates as
 * the build the camera runs, and the run can put its bytes back: on the 2014 chain every such bank (the
 * restore stages the capture verbatim); on the 2016 line too, because the solver decrypts only a bank
 * stored under its image's own key block 1 (solve.ts layer 6), and the camera's commit stores under the
 * key its bootloader checks, which is the running bank's (TESTING.md 42.84 §1). The 1.3.0.8 FF build runs
 * only from recovery R (the 2014 bootloader refuses its 0xFFFF word sum at A and B), so R is its only bank.
 * ==================================================================== */

import { viewOf } from '../bytes.js';
import { stateFromKey } from '../crypto/keys.js';
import { recoverKeyInfo } from '../crypto/recover.js';
import { sameState } from '../crypto/xorshift128.js';
import { HEADER_OFFSET, IMAGE_MAGIC, LENGTH_OFFSET } from '../image/header.js';
import {
  bankOfActiveSlotWord,
  bankWordsOf,
  lockedBootOrder,
  lockedBootRule,
  selectLockedBoot,
  type BootVerdict,
} from '../profiles/locked-boot.js';
import { getProfile } from '../profiles/registry.js';
import { CHECK_KEY_UNNAMED_VERDICT } from '../slots/boot-choice.js';
import { plainBankVerdict } from '../slots/running.js';
import { checkKeyOf, type CheckKeyBank } from '../workflows/device-info.js';
import type { PreservePatchSummary, PreserveRunState } from './steps.js';
import { BANKS, type BankKey } from './windows.js';

/** The three banks, in the bootloader's A, B, R order. */
export const BANK_KEYS: readonly BankKey[] = BANKS.map((bank) => bank.key);

/**
 * What the person chooses: the bank the next start enters (the default), one bank by name, or every bank
 * that holds an image, so whichever the start enters runs the patch.
 */
export type PreserveBankChoice = 'next-start' | 'all' | BankKey;

export const PRESERVE_BANK_CHOICES: readonly PreserveBankChoice[] = [
  'next-start',
  'a',
  'b',
  'r',
  'all',
];

export function isPreserveBankChoice(value: string): value is PreserveBankChoice {
  return (PRESERVE_BANK_CHOICES as readonly string[]).includes(value);
}

/** The words a choice is named by, on the page and in the CLI. */
export function bankChoiceWords(choice: PreserveBankChoice): string {
  if (choice === 'next-start') return 'the bank the next start enters';
  if (choice === 'all') return 'every bank';
  return bankWordsOf(choice);
}

/** The reboot request the application leaves for the bootloader, which then marks the entered bank. */
export const WARM_BOOT_MARKS: readonly number[] = [0xaa55ff01, 0xaa55ff02];

/**
 * What a bank held, by both of the backup's reads: an image (the header window carries the image magic),
 * erased (every byte 0xFF), other bytes with no image header (a bank the bootloader's warm-boot path
 * marked reads this way), or unsettled (the two reads disagree).
 */
export type BankHolds = 'image' | 'erased' | 'other' | 'unsettled';

/** One bank as the backup read it. */
export interface PreserveBankRead {
  readonly key: BankKey;
  /** The 64 KiB as the backup keeps it: the agreed capture, or the sweep's row when the reads disagree. */
  readonly bytes: Uint8Array;
  readonly holds: BankHolds;
}

/** What a bank holds, from one read. */
export function bankHoldsOf(bytes: Uint8Array): Exclude<BankHolds, 'unsettled'> {
  if (bytes.every((byte) => byte === 0xff)) return 'erased';
  if (bytes.length < HEADER_OFFSET + 8) return 'other';
  return viewOf(bytes).getUint32(HEADER_OFFSET, true) === IMAGE_MAGIC ? 'image' : 'other';
}

/** The warm-boot mark in a bank's header word, or null. */
export function warmBootMarkOf(bytes: Uint8Array): number | null {
  if (bytes.length < HEADER_OFFSET + 4) return null;
  const word = viewOf(bytes).getUint32(HEADER_OFFSET, true);
  return WARM_BOOT_MARKS.includes(word) ? word : null;
}

/** The bootloader generation the run's banks are checked by. */
export type PreserveLine = '2014' | '2016';

/** The boot facts the backup step records: the word, the bank the camera entered, each bank's check, and
 *  the bank the next start enters. */
export interface PreserveBootFacts {
  /** The 28-byte boot-config record as served, hex. */
  readonly cfgHex: string;
  /** cfg[0], the boot-config word. */
  readonly word: number;
  /** The order the word sets, in words ("slot A first, then B, then recovery R"). */
  readonly rule: string;
  /** The active-slot word (GetFirmwareInfo selector 10, +8), or null when it could not be read. */
  readonly activeSlotWord: number | null;
  /** The bank the camera reports it entered at this start, or null. */
  readonly entered: BankKey | null;
  /** Each bank's check as the bootloader makes it: true passes, false refuses, null not known. */
  readonly verdicts: Readonly<Record<BankKey, BootVerdict>>;
  /** The bank the next start enters, or null when a bank the rule needs has no verdict. */
  readonly nextStart: BankKey | null;
  /** One sentence: the word's rule and the bank it gives, or what could not be checked. */
  readonly why: string;
  /** 2016 only: why the key the bootloader checks banks under could not be named; null when it was. */
  readonly checkKeyUnnamed: string | null;
}

const UNSETTLED_VERDICT = 'could not be read the same way twice';

/** The 2014 bootloader's check (image_sum_ok on the stored bytes). */
function verdict2014(read: PreserveBankRead): BootVerdict {
  if (read.holds === 'erased' || read.holds === 'other') return false;
  if (read.holds === 'unsettled') return null;
  const verdict = plainBankVerdict(read.bytes);
  return verdict === null ? null : verdict === 1;
}

/**
 * The boot facts, from the backup's reads. The 2014 chain checks a bank's stored bytes; the 2016 line
 * checks a bank decrypted under the key its bootloader holds, which no channel reads, so it is named as
 * the Info read names it (`checkKeyOf`): from the bank the camera reports it entered, when the word's rule
 * checked that bank before entering it.
 */
export function preserveBootFactsOf(input: {
  readonly cfgHead: Uint8Array;
  readonly activeSlotWord: number | null;
  readonly line: PreserveLine;
  readonly banks: Readonly<Record<BankKey, PreserveBankRead>>;
}): PreserveBootFacts {
  const head = input.cfgHead;
  const word = viewOf(head).getUint32(0, true) >>> 0;
  const entered = bankOfActiveSlotWord(input.activeSlotWord);
  const verdicts: Record<BankKey, BootVerdict> = { a: null, b: null, r: null };
  let unknown = UNSETTLED_VERDICT;
  let checkKeyUnnamed: string | null = null;
  /* 2016: the bank the key was inferred from, when the camera entered it without its check. */
  let inferredFrom: BankKey | null = null;
  if (input.line === '2014') {
    for (const key of BANK_KEYS) verdicts[key] = verdict2014(input.banks[key]);
  } else {
    const cipher = getProfile('compact-2016').cipher;
    const analysed = new Map<BankKey, CheckKeyBank>();
    for (const key of BANK_KEYS) {
      const read = input.banks[key];
      if (read.holds !== 'image') {
        analysed.set(key, { present: false, accepts: false, recovered: null });
        continue;
      }
      const view = viewOf(read.bytes);
      const length = view.getUint32(LENGTH_OFFSET, true);
      if (length >= 0x10000 || length > read.bytes.length) {
        analysed.set(key, { present: true, accepts: false, recovered: null });
        continue;
      }
      const recovered = recoverKeyInfo(view, 0, length, cipher);
      analysed.set(key, {
        present: true,
        accepts: recovered.checksum === cipher.acceptanceSum,
        recovered,
      });
    }
    const checkKey = checkKeyOf({
      cfg0: word,
      activeSlotWord: input.activeSlotWord,
      bootloaderVersion: null,
      whiteningK: cipher.whiteningK,
      slotOf: (key) => analysed.get(key),
    });
    if (checkKey.key === null) {
      unknown = CHECK_KEY_UNNAMED_VERDICT;
      checkKeyUnnamed = checkKey.unnamedWhy;
    } else if (checkKey.inferred) {
      inferredFrom = checkKey.from;
    }
    const want = checkKey.key === null ? null : stateFromKey(checkKey.key, cipher.whiteningK);
    for (const key of BANK_KEYS) {
      const read = input.banks[key];
      const bank = analysed.get(key);
      if (read.holds === 'erased' || read.holds === 'other') verdicts[key] = false;
      else if (read.holds === 'unsettled') verdicts[key] = null;
      else if (want === null) verdicts[key] = null;
      else {
        verdicts[key] =
          bank !== undefined &&
          bank.accepts &&
          bank.recovered !== null &&
          sameState(bank.recovered.state, want);
      }
    }
  }
  const selection = selectLockedBoot(word, verdicts, unknown);
  return {
    cfgHex: Array.from(head.subarray(0, 28), (b) => b.toString(16).padStart(2, '0')).join(''),
    word,
    rule: lockedBootRule(word),
    activeSlotWord: input.activeSlotWord,
    entered,
    verdicts,
    nextStart: selection.runs,
    why:
      inferredFrom === null
        ? selection.why
        : `${selection.why} (the key the bootloader checks a bank under is inferred from ` +
          `${bankWordsOf(inferredFrom)}, which it entered without its check) [inferred]`,
    checkKeyUnnamed,
  };
}

/* ==================================================================== *
 * the banks a run writes
 * ==================================================================== */

/** One bank of the run, as the backup recorded it. */
export interface PreserveBankRecord {
  readonly key: BankKey;
  /** The bank's flash address. */
  readonly address: number;
  /** The BeginFirmwareUpgrade mode that arms it. */
  readonly mode: number;
  readonly holds: BankHolds;
  /** Null when the run can patch this bank and put it back; otherwise why it cannot, in words. */
  readonly refused: string | null;
  /** The two reads' sha256s, when the bank was captured. */
  readonly slotReadShas?: readonly [string, string];
  /** The derived image's sha256, when the image derived. */
  readonly imageSha256?: string;
  readonly buildId?: string;
  readonly buildLabel?: string;
  /** The known edit the bank's image carries on its factory build, and the adjust word's share it holds. */
  readonly imageDerivation?: {
    readonly id: string;
    readonly label: string;
    readonly balanceWord: number;
  };
  /** The patch built for this bank, after the patch step. */
  readonly patch?: PreservePatchSummary;
}

/** The facts a choice is judged on. */
export type PreserveChoiceFacts = Pick<PreserveRunState, 'boot' | 'banks'>;

/** What a choice writes, or why the run cannot do it. */
export interface PreserveChoiceVerdict {
  readonly choice: PreserveBankChoice;
  /** The banks it writes, in A, B, R order; null when the run cannot do it. */
  readonly banks: readonly BankKey[] | null;
  /** In words: what it writes, or why it cannot. */
  readonly what: string;
  /** What the person reads before the commit. A warning never stops the run. */
  readonly warnings: readonly string[];
}

/** Banks in words: "slot A, slot B and recovery R". */
export function bankListWords(keys: readonly BankKey[]): string {
  const words = keys.map(bankWordsOf);
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;
}

/** The bank the camera reports it entered at the backup, in words. */
export function lastStartWords(boot: PreserveBootFacts): string {
  if (boot.entered !== null) {
    return (
      `${bankWordsOf(boot.entered)}, as the camera records it (active-slot word ` +
      `${String(boot.activeSlotWord)})`
    );
  }
  return boot.activeSlotWord === null
    ? 'not known — the active-slot word could not be read'
    : `not known — the active-slot word is ${String(boot.activeSlotWord)}, which names no bank`;
}

/** The bank the next start enters, and why, in words. */
export function nextStartWords(boot: PreserveBootFacts): string {
  return `${boot.nextStart === null ? 'not known' : bankWordsOf(boot.nextStart)} — ${boot.why}`;
}

/**
 * A bank that holds an image Preserve cannot derive from a factory image: the stock firmware with a
 * change Preserve does not know (a frame-rate patch, say), or no stock image at all. Preserve does not
 * patch such a bank or put it back (the owner, 2026-10-26; TESTING.md 42.95). One phrase for every
 * family Preserve writes, in the bank table, the choices and every refusal, on the page and in the CLI.
 */
function unknownImageWhat(cameraVersion: string): string {
  return (
    `holds an unknown image (not the stock ${cameraVersion} firmware, nor a change to it that ` +
    'Preserve knows; a frame-rate patch is not one), so Preserve does not patch it or put it back'
  );
}

/** What the person can do about a bank that holds an unknown image (`bank`: the bank, in words). */
function unknownImageRemedy(bank: string): string {
  return (
    `write the stock image back to ${bank} first (for example from a full flash backup taken ` +
    'before the change), then start a new run'
  );
}

/** A bank that holds an unknown image, as the bank table and the choices say it. */
export function unknownImageWords(cameraVersion: string): string {
  return `it ${unknownImageWhat(cameraVersion)}. To include this bank, ${unknownImageRemedy('it')}`;
}

/** The run's refusal when the bank its build is taken from holds an unknown image: nothing is written. */
export function unknownImageRefusal(bank: BankKey, cameraVersion: string): string {
  const words = bankWordsOf(bank);
  return (
    `${words.charAt(0).toUpperCase()}${words.slice(1)} ${unknownImageWhat(cameraVersion)}. ` +
    'The run takes the firmware it patches from this bank, so it stops here, before anything is ' +
    `written. To preserve this camera, ${unknownImageRemedy(words)}.`
  );
}

/** One bank of the run in words: its build and that the run can write it, or why it cannot. */
export function bankRecordWords(bank: PreserveBankRecord): string {
  if (bank.refused !== null) return `not written — ${bank.refused}`;
  return (
    `${bank.buildLabel ?? 'an image'} — can be written` +
    (bank.patch === undefined ? '' : `; the patch moves ${String(bank.patch.diffCount)} bytes`) +
    (bank.imageDerivation === undefined ? '' : `; carries ${bank.imageDerivation.label}`)
  );
}

/** The banks every-bank writes, or why it cannot. */
function everyBank(
  banks: NonNullable<PreserveRunState['banks']>,
): { banks: BankKey[] } | { why: string } {
  const holding = BANK_KEYS.filter((key) => {
    const holds = banks[key].holds;
    return holds === 'image' || holds === 'unsettled';
  });
  const blocked = holding.filter((key) => banks[key].refused !== null);
  if (blocked.length > 0) {
    const first = blocked[0] ?? 'a';
    return {
      why:
        `every bank that holds an image cannot be written: ${bankWordsOf(first)} cannot — ` +
        (banks[first].refused ?? ''),
    };
  }
  if (holding.length === 0) return { why: 'no bank holds an image the run can write' };
  return { banks: holding };
}

/** The warnings for writing `targets`, from the boot facts. */
function choiceWarnings(facts: PreserveChoiceFacts, targets: readonly BankKey[]): string[] {
  const boot = facts.boot;
  if (boot === undefined) return [];
  const out: string[] = [];
  if (boot.nextStart !== null && !targets.includes(boot.nextStart)) {
    out.push(
      `The next start enters ${bankWordsOf(boot.nextStart)} (${boot.why}), and this choice does ` +
        'not patch it: after the restart the camera runs that bank’s own image, so the whole-flash ' +
        'read stops before it reads anything. The restore still puts every written bank back.',
    );
  }
  if (boot.nextStart === null && facts.banks !== undefined) {
    const every = everyBank(facts.banks);
    const covered = 'banks' in every && every.banks.every((key) => targets.includes(key));
    if (!covered) {
      out.push(
        `Which bank the next start enters is not known (${boot.why}). If it enters a bank this ` +
          'choice does not patch, the whole-flash read stops before it reads anything.',
      );
    }
  }
  return out;
}

/** One choice, judged on the backup's facts. */
export function preserveChoiceOf(
  facts: PreserveChoiceFacts,
  choice: PreserveBankChoice,
): PreserveChoiceVerdict {
  const banks = facts.banks;
  const boot = facts.boot;
  if (banks === undefined || boot === undefined) {
    return {
      choice,
      banks: null,
      what: 'the backup has not read the banks yet, so no bank can be chosen',
      warnings: [],
    };
  }
  const offered = (targets: readonly BankKey[], what: string): PreserveChoiceVerdict => ({
    choice,
    banks: targets,
    what,
    warnings: choiceWarnings(facts, targets),
  });
  const refused = (what: string): PreserveChoiceVerdict => ({
    choice,
    banks: null,
    what,
    warnings: [],
  });
  if (choice === 'all') {
    const every = everyBank(banks);
    return 'banks' in every
      ? offered(every.banks, `every bank that holds an image: ${bankListWords(every.banks)}`)
      : refused(every.why);
  }
  if (choice === 'next-start') {
    if (boot.nextStart !== null) {
      const bank = banks[boot.nextStart];
      return bank.refused === null
        ? offered(
            [boot.nextStart],
            `${bankWordsOf(boot.nextStart)}, the bank the next start enters: ${boot.why}`,
          )
        : refused(
            `the next start enters ${bankWordsOf(boot.nextStart)} (${boot.why}), and the run cannot ` +
              `write it: ${bank.refused}`,
          );
    }
    const every = everyBank(banks);
    return 'banks' in every
      ? offered(
          every.banks,
          `every bank that holds an image (${bankListWords(every.banks)}): which bank the next start ` +
            `enters is not known (${boot.why})`,
        )
      : refused(
          `which bank the next start enters is not known (${boot.why}), and ${every.why}; choose ` +
            'a bank by name',
        );
  }
  const bank = banks[choice];
  return bank.refused === null
    ? offered([choice], bankWordsOf(choice))
    : refused(`${bankWordsOf(choice)} cannot be written: ${bank.refused}`);
}

/** Every choice, in the order the page and the CLI list them. */
export function preserveChoicesOf(facts: PreserveChoiceFacts): readonly PreserveChoiceVerdict[] {
  return PRESERVE_BANK_CHOICES.map((choice) => preserveChoiceOf(facts, choice));
}

/**
 * The order the commit writes the banks in: the bank the bootloader tries last first, the one it tries
 * first last. While a later bank is written, the banks written before it already hold a whole patched
 * image, which passes the check, so a start after an interrupted write still finds one. [inferred]
 */
export function commitOrderOf(targets: readonly BankKey[], word: number): BankKey[] {
  return [...lockedBootOrder(word)].reverse().filter((key) => targets.includes(key));
}

/** The order the restore writes the banks in: the bank the bootloader tries first, first. [inferred] */
export function restoreOrderOf(targets: readonly BankKey[], word: number): BankKey[] {
  return lockedBootOrder(word).filter((key) => targets.includes(key));
}
