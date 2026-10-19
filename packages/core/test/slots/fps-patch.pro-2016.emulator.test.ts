/* ====================================================================
 * The frame-rate patch on the Compact PRO 2016 keystream line (stage three), in the emulator, on EVERY bank
 * the verdict table offers (TESTING.md 42.36): the 1.0.3.0 9 Hz native dump, and the 1.0.3.0 and 1.0.3.2 9 Hz
 * images as chimeras on their donors. The FF builds already run at 18 Hz and are not subjects here.
 *
 * The flow is in fps-patch-banks.ts, the same for stage two: one stock boot (every bank's decrypted image is the
 * table's stock image of the subject's entry); the refusal the table records for a bank it does not offer; then
 * each offered bank (B, A, R) through patchBankFps, with the save gate, the save, the write under the image's own
 * stage key (slot-keystream-ciphertext), the decrypted read-back and the check that the other banks did not
 * change; then the patched flash booted with the boot-config word as the camera has it and set to each written bank.
 *
 * THE FRAME RATE is not measured here (the bench does that, TESTING.md 42.27 and the bench matrix).
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { afterAll, describe, expect, it } from 'vitest';

import { liveEmulatorCount } from '../emulator/harness.js';
import { announceSkip, EMU_DIR } from '../emulator/suite.js';
import {
  corpusEntries,
  entryFor,
  LOCKED_SUBJECTS,
  type CorpusEntry,
  type LockedSubject,
} from './corpus-locked-subjects.js';
import { runBankFlow } from './fps-patch-banks.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const available = EMU_DIR !== null;
if (!available)
  announceSkip('the frame-rate patch on the Compact PRO 2016 keystream line (stage three)');

const ENTRIES: readonly CorpusEntry[] = corpusEntries();

/**
 * The stage-three subjects. `row` is the verdict-table row whose expectations apply (the rate and the banks);
 * `patchId` is the table entry the offer must name.
 */
const PRO_2016: readonly {
  readonly label: string;
  readonly row: string;
  readonly patchId: string;
}[] = [
  {
    label: 'Compact PRO 1.0.3.0 (9 Hz, native dump)',
    row: 'Compact PRO 1.0.3.0 (std)',
    patchId: 'compact_pro-1.0.3.0',
  },
  {
    label: 'Compact PRO 1.0.3.0 (9 Hz, chimera)',
    row: 'Compact PRO 1.0.3.0 (std)',
    patchId: 'compact_pro-1.0.3.0',
  },
  {
    label: 'Compact PRO 1.0.3.2 (9 Hz, chimera)',
    row: 'Compact PRO 1.0.3.2 (std)',
    patchId: 'compact_pro-1.0.3.2',
  },
];

function subjectNamed(label: string): LockedSubject {
  const subject = LOCKED_SUBJECTS.find((candidate) => candidate.label === label);
  if (subject === undefined) throw new Error(`no locked subject ${label}`);
  return subject;
}

for (const { label, row, patchId } of PRO_2016) {
  const subject = subjectNamed(label);
  const entry = available ? entryFor(subject, ENTRIES) : null;
  describe.skipIf(entry === null)(
    `the frame-rate patch on ${label} (2016 keystream, emulator)`,
    () => {
      afterAll(() => {
        expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
      });

      it(
        'writes every bank the verdict table offers, refuses the bank it does not offer, reads each back decrypted, and boots each patched bank',
        async () => {
          if (entry === null) return;
          await runBankFlow({
            label,
            row,
            version: subject.version,
            entryId: entry.id,
            donor: subject.donor ?? null,
            jedec: subject.jedec ?? null,
            patchId,
            staging: 'slot-keystream-ciphertext',
          });
        },
        TIMEOUT_MS,
      );
    },
  );
}
