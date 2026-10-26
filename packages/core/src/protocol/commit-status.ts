/* ==================================================================== *
 * What a CompleteMemoryUpgrade status proves about the bank it was sent for. Pure. Both writers decode it
 * here: the slot writer (slots/write-commit.ts `commitRefusal`) and the preservation pipeline's commit
 * (preservation/pipeline.ts `commitToBank`), so a status cannot be "the erase stage" on one page and "flash
 * may be partially written" on the other (TESTING.md 42.84: a 0x00040005 on a 1.0.3.0 camera said the
 * second in Preserve).
 *
 * The status is read AFTER the commit transfer, so it is the only evidence of how far the commit got. Each
 * value below is one the firmware returns from a named site (FW-V1 codegen/fn/cmd_CompleteMemoryUpgrade.c
 * and fw_validate_decrypt_program.c, the base variants that the 1.3.0.8, Compact PRO and 4.x builds carry;
 * the nano and Compact XR revisions add 0x70100):
 *
 *  - BAD_IMAGE 0x70000: the staged bytes do not sum to the checksum the host sent. Returned before the
 *    image is decrypted or anything is erased.
 *  - UNSUPPORTED 0x50000: the image did not decrypt under the camera's keys, or the data type is one this
 *    build refuses. Returned before erase.
 *  - ACCEPTANCE 0x70100: the image's acceptance check refused it, before erase. Which check depends on the
 *    build (FW-V1 cmd_CompleteMemoryUpgrade, the base variants and the 1.3.0.8 revisions): the 8 Hz 1.3.x
 *    plain word-sum gate, which runs with no re-key; the 1.3.0.8 FF keystream gate, the sum of the staged
 *    bytes XOR Key A, which runs BEFORE its re-key (TESTING.md 42.10); and, on the nano and nano200
 *    revisions only, a probe after the re-key that returns the same code. Not a nano or Compact XR code
 *    alone: the Compact 1.3.0.8 builds return it too.
 *  - WRONG_FW_OP 0x0003_02xx: no bank upgrade was armed, so the commit did nothing. Returned before the
 *    image is looked at.
 *  - FLASH_ERASE_FAILED 0x0004_00SS: the erase of the bank's block failed. The program call is never
 *    reached, but the erase was attempted, so the block may be partly erased. SS is the bank's address
 *    byte (0x05, 0x06, 0x07). The 2016 application returns it from the same site for modes 7 to 9 (FW-V1
 *    targets/compact_pro_9hz_1_0_3_0/src/rpc_cmds.c:1808-1812: `flash_driver_erase_block` failing returns
 *    the address byte | 0x40000, before the program call).
 *  - FLASH_PROGRAM_FAILED 0x0004_01SS and FLASH_VERIFY_FAILED 0x0004_02SS: the program or verify stage
 *    ran, so the bank may hold part of an image.
 *
 * So three classes, and only the first is "the bank is unchanged".
 * ==================================================================== */

import { ERR_BAD_CHECKSUM } from './ops.js';

const ERR_UNSUPPORTED = 0x50000;
/** The acceptance-gate refusal (see the status table above): nothing is erased or programmed. */
const ERR_ACCEPTANCE = 0x70100;
/** The class of RPC_STATUS_WRONG_FW_OP(op): the detail is 0x0302, the value is the armed op byte. */
const WRONG_FW_OP_CLASS = 0x00030200;
/** The class of the three RPC_STATUS_FLASH_*_FAILED codes; the low byte is the slot. */
const FLASH_FAILURE_CLASS = 0x00040000;
/** The detail byte (bits 8-15) of a flash failure: 0 erase, 1 program, 2 verify. */
const ERASE_DETAIL = 0x0000;
const PROGRAM_DETAIL = 0x0100;
const VERIFY_DETAIL = 0x0200;

/** What one non-zero commit status proves about the bank. */
export type CommitStatusClass =
  /** Returned before any erase or program call: the bank is unchanged. */
  | 'refused-before-programming'
  /** The erase stage failed: nothing was programmed, the bank may be partly erased. */
  | 'erase-stage'
  /** The program or verify stage ran, or the status is unknown: the bank may be partly written. */
  | 'may-be-partial';

/**
 * Which class a commit status falls in. `null` (the status could not be read) is treated as the worst
 * case, because nothing says the commit stopped early. Call it for a status other than 0, the success
 * value.
 */
export function classifyCommitStatus(status: number | null): CommitStatusClass {
  if (status === null) return 'may-be-partial';
  if (
    status === ERR_BAD_CHECKSUM ||
    status === ERR_UNSUPPORTED ||
    status === ERR_ACCEPTANCE ||
    (status & 0xffffff00) === WRONG_FW_OP_CLASS
  ) {
    return 'refused-before-programming';
  }
  if ((status & 0xffff0000) === FLASH_FAILURE_CLASS && (status & 0xff00) === ERASE_DETAIL) {
    return 'erase-stage';
  }
  return 'may-be-partial';
}

/** The cause in words for a status, as the firmware's own return site names it. */
export function commitStatusCause(status: number): string {
  if (status === ERR_BAD_CHECKSUM) return 'the transfer checksum did not match the staged bytes';
  if (status === ERR_UNSUPPORTED) {
    return "the image did not decrypt under the camera's keys, or the data type is refused";
  }
  if (status === ERR_ACCEPTANCE) {
    return 'the image was refused by its acceptance check before anything was erased (the check depends on the build)';
  }
  if ((status & 0xffffff00) === WRONG_FW_OP_CLASS) return 'no bank upgrade was armed';
  if ((status & 0xffff0000) === FLASH_FAILURE_CLASS) {
    const detail = status & 0xff00;
    if (detail === ERASE_DETAIL) return 'the erase stage failed';
    if (detail === PROGRAM_DETAIL) return 'the program stage failed';
    if (detail === VERIFY_DETAIL) return 'the verify stage failed';
  }
  return 'a status not known here';
}

/**
 * What a non-zero status proves about `bank`, as one clause after "CompleteMemoryUpgrade returned …":
 * "the bank is unchanged" for the first class only, "nothing was programmed … may be partly erased" for the
 * erase stage, and "may be partially written" for the rest and for an unreadable status.
 */
export function commitStatusMeaning(status: number | null, bank: string): string {
  if (status === null) {
    return `the status could not be read, so ${bank} may be partially written`;
  }
  const cause = commitStatusCause(status);
  switch (classifyCommitStatus(status)) {
    case 'refused-before-programming':
      return `${cause}: refused before programming; ${bank} is unchanged`;
    case 'erase-stage':
      return (
        `${cause}: nothing was programmed, but the erase may have started, so ${bank} may be ` +
        'partly erased'
      );
    case 'may-be-partial':
      return `${cause} — ${bank} may be partially written`;
  }
}
