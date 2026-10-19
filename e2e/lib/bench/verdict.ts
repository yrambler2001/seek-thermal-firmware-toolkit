/* ====================================================================
 * The bench's criterion: each subject is judged by the shared verdict table
 * (`e2e/lib/slots-expectations.ts`), and by nothing else.
 *
 *   - a bank the table records as REFUSED: the page refuses it at its picker with
 *     the table's reason, and nothing is sent. A page that takes the image, or
 *     refuses it for another reason, fails; a write into the bank fails;
 *   - a bank the table records as WRITABLE: its write must read back as written.
 *     A bank whose own image the table records as refused (`ownImage`) must have
 *     that image refused with the table's reason, and must be written from another
 *     bank's image;
 *   - the camera-wide banner must match the row's `banner`;
 *   - a bank whose build the table records (`bankVersions`) must show that build on the
 *     page; a bank the table records no build for is not checked (TESTING.md 42.39).
 *
 * This module is pure: it turns what the flow observed into the judgement. The flow
 * (`spec-flow.ts`) gathers the observations; the offline tests (`bench-verdict.e2e.ts`)
 * feed it the four cases of TESTING.md 42.21 and the failure cases.
 * ==================================================================== */

import { SLOTS_SUBJECTS, type BankLetter, type SlotsSubject } from '../slots-expectations.js';
import type { BenchSubject } from './types.js';

/** The banks in the order the table and the report list them. */
const LETTERS: readonly BankLetter[] = ['a', 'b', 'r'];

/**
 * The verdict-table row (`SlotsSubject.name`) that each launchable subject of the dump tree is
 * judged by, keyed by the subject's family and folder ("<family> <folder>"). The folder is the
 * tree's dated name, which is unique within a family; `bench-verdict.e2e.ts` checks that every
 * row of the table is named once.
 */
export const ROW_NAME_OF_SUBJECT: ReadonlyMap<string, string> = new Map([
  /* ---- Compact: the 2014 chain, 1.3.0.8 (FF and 8 Hz), and 4.x */
  ['Compact 2014.09.17-09.17.37-0.8.0.0', 'Compact 0.8.0.0'],
  ['Compact 2014.09.29-13.38.48-0.9.0.2', 'Compact 0.9.0.2'],
  ['Compact 2014.10.03-15.32.39-0.9.0.6', 'Compact 0.9.0.6'],
  ['Compact 2014.10.03-18.31.47-0.9.0.7', 'Compact 0.9.0.7'],
  ['Compact 2014.10.02-13.48.57-0.9.1.0', 'Compact 0.9.1.0'],
  ['Compact 2014.10.02-14.16.26-0.10.0.0', 'Compact 0.10.0.0'],
  ['Compact 2014.10.07-14.55.43-1.0.0.0', 'Compact 1.0.0.0'],
  ['Compact 2014.10.13-11.15.52-1.2.0.0', 'Compact 1.2.0.0'],
  ['Compact 2014.10.21-14.58.29-1.3.0.0', 'Compact 1.3.0.0'],
  ['Compact 2017.01.06-11.16.17-1.3.0.8', 'Compact 1.3.0.8 (8 Hz)'],
  ['Compact 2017.01.06-11.17.29-1.3.0.8-FF', 'Compact 1.3.0.8 FF'],
  ['Compact 2018.09.04-15.36.50-4.8.1.7', 'Compact 4.8.1.7 (std)'],
  ['Compact 2018.09.04-15.37.00-4.16.1.7-FF', 'Compact 4.16.1.7 (FF)'],
  ['Compact 2018.10.11-16.36.37-4.8.1.9', 'Compact 4.8.1.9'],
  ['Compact 2020.02.26-11.23.26-4.8.2.1', 'Compact 4.8.2.1'],
  /* ---- Compact Pro: the 2016 keystream line and the 4.x Pro line */
  ['Compact Pro 2016.07.06-17.04.49-1.0.3.0', 'Compact PRO 1.0.3.0 (std)'],
  ['Compact Pro 2016.07.06-17.05.32-1.0.3.0-FF', 'Compact PRO 1.0.3.0 (FF)'],
  ['Compact Pro 2017.01.06-15.45.07-1.0.3.2', 'Compact PRO 1.0.3.2 (std)'],
  ['Compact Pro 2017.01.06-15.45.44-1.0.3.2', 'Compact PRO 1.0.3.2 (FF)'],
  ['Compact Pro 2017.01.06-15.45.44-1.0.3.2-FF', 'Compact PRO 1.0.3.2 (FF-FF)'],
  ['Compact Pro 2019.03.14-09.18.41-4.9.1.15', 'Compact PRO 4.9.1.15 (std)'],
  ['Compact Pro 2020.02.13-15.26.01-4.9.2.0', 'Compact PRO 4.9.2.0'],
  ['Compact Pro 2020.02.13-15.26.28-4.18.2.0-FF', 'Compact PRO FF 4.18.2.0'],
  /* ---- XR, Mosaic, Nano */
  ['Compact XR 2020.02.26-11.23.26-4.8.2.1', 'Compact XR 4.8.2.1'],
  ['Mosaic 320x240 2019.11.19-09.59.21-10.9.1.31', 'Mosaic 10.9.1.31 (std)'],
  ['Mosaic 320x240 2019.12.10-10.48.25-2.27.1.33-FF', 'Mosaic FF 2.27.1.33'],
  ['Nano 200 2024.11.20-14.58.43-42.32.3.10', 'Nano 200 42.32.3.10'],
  ['Nano 300 2024.11.21-11.55.00-44.27.3.10', 'Nano 300 44.27.3.10'],
]);

/**
 * The verdict-table row a subject is judged by, or null when the table has no row for it (the
 * bench then cannot judge it, and runs nothing). `rows` defaults to the shared table.
 */
export function verdictRowOf(
  subject: Pick<BenchSubject, 'family' | 'folder'>,
  rows: readonly SlotsSubject[] = SLOTS_SUBJECTS,
): SlotsSubject | null {
  const name = ROW_NAME_OF_SUBJECT.get(`${subject.family} ${subject.folder}`);
  if (name === undefined) return null;
  return rows.find((row) => row.name === name) ?? null;
}

/** What the picker said about one bank's own image: refused (with the page's logged reason), or taken. */
export interface PickerOffer {
  readonly accepted: boolean;
  /** The reason the page logged for the refusal, or null when it logged none (or the picker took it). */
  readonly reason: string | null;
}

/** What the page did with one write: read back as written, failed, or nothing was sent. */
export type WriteObservation = 'written' | 'failed' | 'none';

export interface BankObservation {
  /** The own image offered at the picker, or null when the bench offered none. */
  readonly offer: PickerOffer | null;
  readonly write: WriteObservation;
}

export interface SubjectObservation {
  readonly banks: Readonly<Record<BankLetter, BankObservation>>;
  /** The banner the page showed (`shown` null: none), or null when the page was not read. */
  readonly banner: { readonly shown: string | null } | null;
  /**
   * The build the page shows for each bank (`shown` null: none), or absent when the page's builds were not read.
   * Checked only for the banks the row's `bankVersions` records.
   */
  readonly versions?: Readonly<Record<BankLetter, string | null>> | null;
  /**
   * Whether the flow ran every bank to its step. When it stopped early, a missing offer or write is
   * already explained by the flow's own failure, so the judge does not repeat it.
   */
  readonly finished: boolean;
}

export interface BankJudgement {
  readonly bank: BankLetter;
  /** The table's refusal of this bank was given: the page refused the bank's own image with the table's reason. */
  readonly refused: boolean;
  /** A write through the page read back as written. */
  readonly written: boolean;
}

/** What a subject passed as: writes, refusals the table records, or both. */
export type PassedAs = 'write' | 'refusal' | 'write and refusal';

export interface SubjectJudgement {
  /** Every way the observations disagree with the table. Empty when the subject passes. */
  readonly failures: readonly string[];
  readonly banks: readonly BankJudgement[];
  /** What the subject passed as, or null when it did not pass or passed nothing. */
  readonly passedAs: PassedAs | null;
}

/** Whether the page's logged reason contains the table's fragment (the empty fragment: any refusal). */
export function reasonMatches(logged: string | null, expected: string): boolean {
  if (logged === null) return false;
  if (expected === '') return true;
  return collapse(logged).includes(collapse(expected));
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function quoted(reason: string): string {
  return reason === '' ? 'any refusal' : `"${reason}"`;
}

/**
 * The judgement of one subject against its table row. Every failure is a disagreement between what
 * the page did and what the table says, named by its bank.
 */
export function judgeSubject(row: SlotsSubject, observed: SubjectObservation): SubjectJudgement {
  const failures: string[] = [];
  const banks = LETTERS.map((letter) => judgeBank(letter, row, observed, failures));
  if (observed.banner !== null) judgeBanner(row.banner, observed.banner.shown, failures);
  if (observed.versions !== undefined && observed.versions !== null) {
    judgeVersions(row, observed.versions, failures);
  }
  const refused = banks.some((bank) => bank.refused);
  const written = banks.some((bank) => bank.written);
  const passedAs: PassedAs | null =
    !refused && !written ? null : !refused ? 'write' : !written ? 'refusal' : 'write and refusal';
  return { failures, banks, passedAs: failures.length === 0 ? passedAs : null };
}

function judgeBank(
  letter: BankLetter,
  row: SlotsSubject,
  observed: SubjectObservation,
  failures: string[],
): BankJudgement {
  const name = letter.toUpperCase();
  const verdict = row.banks[letter];
  const seen = observed.banks[letter];
  /* The refusal the table records for this bank: the bank's own (it is refused), or its own image (ownImage). */
  const recorded: string | null = !verdict.writable
    ? verdict.reason
    : row.ownImage?.bank === letter
      ? row.ownImage.reason
      : null;
  const offer = seen.offer;
  let refused = false;
  if (recorded === null) {
    if (offer !== null && !offer.accepted) {
      failures.push(
        `bank ${name}: the page refuses its image (${quoted(offer.reason ?? 'no reason logged')}), and the table says it is writable`,
      );
    }
  } else if (offer === null) {
    if (observed.finished) {
      failures.push(
        `bank ${name}: the table records a refusal (${quoted(recorded)}), but no image of its own was offered (nothing sent)`,
      );
    }
  } else if (offer.accepted) {
    failures.push(
      `bank ${name}: the page takes the image offered, and the table records a refusal (${quoted(recorded)})`,
    );
  } else if (!reasonMatches(offer.reason, recorded)) {
    failures.push(
      `bank ${name}: the page refuses it for ${quoted(offer.reason ?? 'no reason logged')}, and the table records ${quoted(recorded)}`,
    );
  } else {
    refused = true;
  }

  if (!verdict.writable) {
    if (seen.write !== 'none') {
      failures.push(
        `bank ${name}: the page took a write to it, and the table records it as refused`,
      );
    }
  } else if (seen.write === 'failed') {
    failures.push(
      `bank ${name}: its write did not read back as written, and the table says it is writable`,
    );
  } else if (seen.write === 'none' && observed.finished) {
    failures.push(`bank ${name}: not written, and the table says it is writable`);
  }
  return { bank: letter, refused, written: seen.write === 'written' };
}

function judgeBanner(expected: string, shown: string | null, failures: string[]): void {
  if (expected === 'none') {
    if (shown !== null)
      failures.push(`the page shows the banner "${shown}", and the table records none`);
    return;
  }
  if (shown === null) {
    failures.push(`the table records the banner "${expected}", and the page shows none`);
  } else if (!reasonMatches(shown, expected)) {
    failures.push(`the page shows the banner "${shown}", and the table records "${expected}"`);
  }
}

/**
 * Each bank the row records a build for must show that build on the page. A bank the page shows no build for,
 * or another build, is a failure named by its bank (a bank the row records nothing for is not checked).
 */
function judgeVersions(
  row: SlotsSubject,
  shown: Readonly<Record<BankLetter, string | null>>,
  failures: string[],
): void {
  for (const letter of LETTERS) {
    const expected = row.bankVersions?.[letter];
    if (expected === undefined) continue;
    const name = letter.toUpperCase();
    const seen = shown[letter];
    if (seen === null) {
      failures.push(
        `bank ${name}: the page shows no build for it, and the table records build ${expected} (TESTING.md 42.39)`,
      );
    } else if (seen !== expected) {
      failures.push(
        `bank ${name}: the page reads build ${seen}, and the table records build ${expected} (TESTING.md 42.39)`,
      );
    }
  }
}

/** The words the report uses for what a subject passed as. */
export const PASSED_AS_WORD: Readonly<Record<PassedAs, string>> = {
  write: 'a write',
  refusal: 'a refusal the table records',
  'write and refusal': 'a write and a refusal the table records',
};
