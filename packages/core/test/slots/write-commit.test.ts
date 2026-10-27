/* ====================================================================
 * What a commit status lets the slot page say about the bank.
 *
 * The status is read after CompleteMemoryUpgrade, so it is the only evidence of
 * how far the commit got. These tests pin the three classes `classifyCommitStatus`
 * sorts the firmware's own return values into, and the words `commitRefusal`
 * uses for each: 'refused before programming; the bank is unchanged' is said for
 * the first class only, and 'may be partially written' for the others. Every
 * refusal carries `dropAnalysis`, whatever the class.
 *
 * Driven over a recording device with no camera. The emulator's refusals on the
 * 2016 chimera are in write.emulator.test.ts.
 *
 * The decoder is protocol/commit-status.ts, which the preservation pipeline's
 * `commitToBank` decodes with too (TESTING.md 42.84: a 0x00040005 said "flash may
 * be partially written" there and "the erase stage" here); its last block pins that.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { WindowEntry } from '../../src/profiles/types.js';
import type { SeekDevice } from '../../src/protocol/client.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import type { SlotEntry } from '../../src/slots/types.js';
import { commitToBank } from '../../src/preservation/pipeline.js';
import { classifyCommitStatus, commitStatusMeaning } from '../../src/protocol/commit-status.js';
import {
  commitRefusal,
  flashInvalidatesAnalysis,
  stageAndCommit,
} from '../../src/slots/write-commit.js';

const BANK_B = 0x14060000;

/** The three firmware return sites the page can name, and the statuses it sees. */
const REFUSED_BEFORE_PROGRAMMING = [
  0x00070000 /* BAD_IMAGE: the checksum did not match the staged bytes */,
  0x00050000 /* UNSUPPORTED: the image did not decrypt, or the bank type is refused */,
  0x00070100 /* BAD_IMAGE_KEYS: the nano revisions' key probe, before erase */,
  0x00030200 /* WRONG_FW_OP: no upgrade was armed */,
  0x0003020a /* WRONG_FW_OP with the armed op byte in the low byte */,
];
const ERASE_STAGE = [0x00040005, 0x00040006, 0x00040007];
const MAY_BE_PARTIAL = [
  0x00040100 /* FLASH_PROGRAM_FAILED on slot A */, 0x00040105 /* FLASH_PROGRAM_FAILED on slot B */,
  0x00040200 /* FLASH_VERIFY_FAILED */, 0x00012345 /* a status this page does not recognise */,
];

/**
 * A recording device. Staging polls answer 0; after the commit, the status
 * answers `afterCommit` (null for an unreadable status). `commitThrows` makes
 * the commit transfer itself fail, which says nothing about the bank.
 */
function deviceAnswering(
  afterCommit: number | null,
  options: { readonly commitThrows?: boolean; readonly stagingStatus?: number } = {},
): { readonly device: SeekDevice; readonly sent: string[] } {
  const sent: string[] = [];
  let committed = false;
  const device = {
    transport: { isOpen: true, open: () => Promise.resolve(), info: { recipientFallback: null } },
    armWindow: () => {
      sent.push('arm');
      return Promise.resolve();
    },
    setFeaturedFirmwareData: () => {
      sent.push('stage');
      return Promise.resolve();
    },
    getErrorCode: () => {
      if (!committed) return Promise.resolve(options.stagingStatus ?? 0);
      return Promise.resolve(afterCommit);
    },
    completeMemoryUpgrade: () => {
      sent.push('commit');
      committed = true;
      return options.commitThrows === true
        ? Promise.reject(new Error('the transfer timed out'))
        : Promise.resolve();
    },
  } as unknown as SeekDevice;
  return { device, sent };
}

function contextFor(device: SeekDevice): WorkflowContext {
  return {
    device,
    profile: getProfile('compact-2016'),
    detection: null,
    reporter: silentReporter,
  };
}

const ENTRY = { key: 'b', name: 'slot B', address: BANK_B } as unknown as SlotEntry;
const WRITE = { subcmd: 9, address: BANK_B, note: 'slot B' } as unknown as WindowEntry;
const PAYLOAD = Uint8Array.from({ length: 128 }, (_, i) => i);

/** Runs one commit that the camera answers with `status`; resolves to the error it throws, or null. */
async function commitAnswering(
  afterCommit: number | null,
  options: { readonly commitThrows?: boolean; readonly stagingStatus?: number } = {},
): Promise<{ readonly error: SeekError | null; readonly sent: string[] }> {
  const { device, sent } = deviceAnswering(afterCommit, options);
  try {
    await stageAndCommit(contextFor(device), ENTRY, WRITE, PAYLOAD, 0x1234);
    return { error: null, sent };
  } catch (error) {
    if (error instanceof SeekError) return { error, sent };
    throw error;
  }
}

describe('classifyCommitStatus sorts the statuses by what they prove', () => {
  it('puts every status returned before any erase or program in the refused class', () => {
    for (const status of REFUSED_BEFORE_PROGRAMMING) {
      expect(classifyCommitStatus(status), `0x${status.toString(16)}`).toBe(
        'refused-before-programming',
      );
    }
  });

  it('puts the erase-stage failures of the three banks in the erase class', () => {
    for (const status of ERASE_STAGE) {
      expect(classifyCommitStatus(status), `0x${status.toString(16)}`).toBe('erase-stage');
    }
  });

  it('puts a program or verify failure, an unknown value, and an unreadable status in the may-be-partial class', () => {
    for (const status of [...MAY_BE_PARTIAL, null]) {
      expect(classifyCommitStatus(status), String(status)).toBe('may-be-partial');
    }
  });
});

describe('a commit that returns a status other than 0', () => {
  it('says the bank is unchanged, and only that, for a status returned before programming', async () => {
    for (const status of REFUSED_BEFORE_PROGRAMMING) {
      const { error } = await commitAnswering(status);
      expect(error?.code, `0x${status.toString(16)}`).toBe('flash/commit');
      expect(error?.message).toContain('refused before programming; the bank is unchanged');
      expect(error?.message).not.toContain('may be partially written');
      expect(error?.message).not.toContain('may be partly erased');
      expect(error?.deviceCode).toBe(status);
      expect(error?.detail?.safeToRetry).toBe(true);
    }
  });

  it('says nothing was programmed but the bank may be partly erased, for an erase-stage failure', async () => {
    for (const status of ERASE_STAGE) {
      const { error } = await commitAnswering(status);
      expect(error?.message).toContain('nothing was programmed');
      expect(error?.message).toContain('the bank may be partly erased');
      expect(error?.message).not.toContain('the bank is unchanged');
      expect(error?.message).not.toContain('may be partially written');
      expect(error?.detail?.safeToRetry).toBe(false);
    }
  });

  it('says the bank may be partially written, for a program, verify or unknown status, and never that it is unchanged', async () => {
    for (const status of MAY_BE_PARTIAL) {
      const { error } = await commitAnswering(status);
      expect(error?.message).toContain('may be partially written');
      expect(error?.message).not.toContain('the bank is unchanged');
      expect(error?.detail?.safeToRetry).toBe(false);
    }
  });

  it('says the bank may be partially written when the status cannot be read at all', async () => {
    const { error } = await commitAnswering(null);
    expect(error?.code).toBe('flash/commit');
    expect(error?.message).toContain('the commit status could not be read');
    expect(error?.message).toContain('may be partially written');
    expect(error?.message).not.toContain('the bank is unchanged');
    expect(error?.detail?.safeToRetry).toBe(false);
  });

  it("names each cause in the firmware's own terms, and the stage that failed", async () => {
    expect((await commitAnswering(0x00070000)).error?.message).toContain('checksum');
    expect((await commitAnswering(0x00040005)).error?.message).toContain('erase stage');
    expect((await commitAnswering(0x00040100)).error?.message).toContain('program stage');
    expect((await commitAnswering(0x00040200)).error?.message).toContain('verify stage');
  });

  it('keeps the analysis-dropping marker on every class, so the caller re-reads', async () => {
    for (const status of [...REFUSED_BEFORE_PROGRAMMING, ...ERASE_STAGE, ...MAY_BE_PARTIAL, null]) {
      const { error } = await commitAnswering(status);
      expect(error, String(status)).not.toBeNull();
      expect(flashInvalidatesAnalysis(error), String(status)).toBe(true);
    }
  });
});

describe('the commit status decides, not the transfer', () => {
  it('a commit transfer that fails but whose status reads 0 is a success', async () => {
    const { error, sent } = await commitAnswering(0, { commitThrows: true });
    expect(error).toBeNull();
    expect(sent.at(-1)).toBe('commit');
  });

  it('a commit transfer that fails and whose status is a program failure is classed by the status', async () => {
    const { error } = await commitAnswering(0x00040100, { commitThrows: true });
    expect(error?.message).toContain('may be partially written');
    expect(flashInvalidatesAnalysis(error)).toBe(true);
  });
});

describe('the staging refusals, before any commit, are unchanged', () => {
  it('a status word during staging stops the write before the commit, and says nothing was written', async () => {
    const { error, sent } = await commitAnswering(0, { stagingStatus: 0x00030200 });
    expect(sent).not.toContain('commit');
    expect(error?.code).toBe('slots/refused');
    expect(error?.message).toContain('nothing was written to flash');
    expect(flashInvalidatesAnalysis(error)).toBe(false);
  });
});

describe('commitRefusal', () => {
  it('names the bank in the message, and says so for every class', () => {
    for (const status of [0x00070000, 0x00040005, 0x00040100, null]) {
      expect(commitRefusal('slot B', status).message).toContain('slot B');
    }
  });
});

describe('the preservation commit decodes a status as the slot writer does (protocol/commit-status.ts)', () => {
  /** Runs `commitToBank` against the recording device; resolves to the message it throws. */
  async function preservationCommit(afterCommit: number | null): Promise<string> {
    const { device } = deviceAnswering(afterCommit);
    const live = Object.assign(device, { assertNotCancelled: () => undefined });
    try {
      await commitToBank(live, 'a', PAYLOAD, { label: 'step 04', reporter: silentReporter });
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
    return '(no error)';
  }

  it('says an erase-stage failure programmed nothing and may have partly erased the bank, not "partially written"', async () => {
    for (const status of ERASE_STAGE) {
      const message = await preservationCommit(status);
      expect(message, `0x${status.toString(16)}`).toContain(
        'the erase stage failed: nothing was programmed, but the erase may have started, so slot A ' +
          'may be partly erased',
      );
      expect(message).not.toContain('partially written');
    }
  });

  it('says the bank is unchanged for a status returned before programming, and may be partial otherwise', async () => {
    expect(await preservationCommit(0x00070000)).toContain(
      'refused before programming; slot A is unchanged',
    );
    expect(await preservationCommit(0x00040100)).toContain(
      'the program stage failed — slot A may be partially written',
    );
    expect(await preservationCommit(null)).toContain(
      'the status could not be read, so slot A may be partially written',
    );
  });

  it('is one decoder: the same clause for every class, whoever names the bank', () => {
    expect(commitStatusMeaning(0x00040005, 'slot B')).toBe(
      'the erase stage failed: nothing was programmed, but the erase may have started, so slot B may ' +
        'be partly erased',
    );
    expect(commitStatusMeaning(0x00050000, 'slot B')).toBe(
      "the image did not decrypt under the camera's keys, or the data type is refused: refused " +
        'before programming; slot B is unchanged',
    );
  });
});
