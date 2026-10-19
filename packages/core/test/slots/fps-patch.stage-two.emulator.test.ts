/* ====================================================================
 * The frame-rate patch on the 4.x line (stage two), in the emulator, on EVERY bank the verdict table
 * offers (TESTING.md 42.36): the 4.8.1.7 and 4.8.1.9 images (on their 4.8.2.1 donor bootloader, as
 * corpus-modern-run runs them), the Compact 4.8.2.1 and Compact XR 4.8.2.1 dumps, and the Compact PRO
 * 4.9.1.15 and 4.9.2.0 dumps (booted as they are, no donor; 18 Hz). The bank is staged under the camera's
 * Key A and stored under the bank's own key, so the read-back is checked on the image it DECRYPTS to.
 *
 * The flow is in fps-patch-banks.ts, the same for stage three: one stock boot; the refusal the table records
 * for a bank it does not offer; then each offered bank (B, A, R) through patchBankFps, with the save gate, the
 * save, the write, the decrypted read-back and the check that the other banks did not change; then the
 * patched flash booted with the boot-config word as the camera has it and set to each written bank.
 *
 * THE FRAME RATE is not measured here (the bench does that, TESTING.md 42.22).
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { afterAll, describe, expect, it } from 'vitest';

import { FPS_OFFER_WITHHELD } from '../../src/preservation/fps-patch.js';
import { liveEmulatorCount } from '../emulator/harness.js';
import { announceSkip, EMU_DIR, ENTRIES } from '../emulator/suite.js';
import {
  CHIMERA_JEDEC,
  entryFor,
  MODERN_SUBJECTS,
  type ModernSubject,
} from './corpus-modern-run.js';
import { runBankFlow } from './fps-patch-banks.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const available = EMU_DIR !== null;
if (!available) announceSkip('the frame-rate patch on the 4.x Compact line (stage two)');

/**
 * The stage-two subjects. `row` is the verdict-table row whose expectations apply (the rate, the banks, and
 * the one bank the table does not offer); `patchId` is the table entry the offer must name.
 */
const STAGE_TWO: readonly {
  readonly label: string;
  readonly row: string;
  readonly patchId: string;
}[] = [
  {
    label: 'Compact 4.8.1.7 image (on 4.8.2.1)',
    row: 'Compact 4.8.1.7 (std)',
    patchId: 'compact_32k-4.8.1.7-to32',
  },
  {
    label: 'Compact 4.8.1.9 image (on 4.8.2.1)',
    row: 'Compact 4.8.1.9',
    patchId: 'compact_32k-4.8.1.9-to32',
  },
  { label: 'Compact 4.8.2.1 dump', row: 'Compact 4.8.2.1', patchId: 'compact_32k-4.8.2.1-to32' },
  {
    label: 'Compact XR 4.8.2.1 dump',
    row: 'Compact XR 4.8.2.1',
    patchId: 'compact_32k-4.8.2.1-to32',
  },
  {
    label: 'Compact PRO 4.9.1.15 dump',
    row: 'Compact PRO 4.9.1.15 (std)',
    patchId: 'compact_pro-4.9.1.15',
  },
  {
    label: 'Compact PRO 4.9.2.0 dump (1215A0YZ9AA8)',
    row: 'Compact PRO 4.9.2.0',
    patchId: 'compact_pro-4.9.2.0',
  },
];

function modernSubjectNamed(label: string): ModernSubject {
  const subject = MODERN_SUBJECTS.find((candidate) => candidate.label === label);
  if (subject === undefined) throw new Error(`no modern subject ${label}`);
  return subject;
}

for (const { label, row, patchId } of STAGE_TWO) {
  const subject = modernSubjectNamed(label);
  const entry = available ? entryFor(subject, ENTRIES) : null;
  /* An image-only entry boots as a chimera on its donor's bootloader; a full dump boots as it is. */
  const donorId = entry?.kind === 'image-only' ? (entry.donor?.id ?? null) : null;
  describe.skipIf(
    entry === null || (entry.kind === 'image-only' && donorId === null) || FPS_OFFER_WITHHELD,
  )(`the frame-rate patch on ${label} (stage two, emulator)`, () => {
    afterAll(() => {
      expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    });

    it(
      `writes every bank the verdict table offers, refuses the bank it does not offer, reads each back decrypted, and boots each patched bank`,
      async () => {
        if (entry === null) return;
        await runBankFlow({
          label,
          row,
          version: subject.version,
          entryId: entry.id,
          donor: donorId,
          jedec: donorId === null ? null : CHIMERA_JEDEC,
          patchId,
          staging: 'key-a-ciphertext',
        });
      },
      TIMEOUT_MS,
    );
  });
}
