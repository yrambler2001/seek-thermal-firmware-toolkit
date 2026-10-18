/**
 * "Decrypt a firmware slot" — one 64 KiB bank, read from a file, decrypted here.
 *
 * Nothing in this hook touches USB: it is the Decrypt tab's second half, and that
 * tab must work with no camera connected. The file is read in the page, decrypted
 * by core's `decryptSlotFile` (the same key solve a slot dump uses on a bank it
 * has read), and the plain image is kept in memory until it is downloaded or the
 * next file is picked. Each pick replaces the last, and a result for a file that
 * has since been replaced is dropped.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { decryptSlotFile, errorMessage, sha256hex, type SlotFileResult } from '@seek-fw/core';
import { downloadBytes } from '../lib/download';

export interface SlotFileInput {
  readonly name: string;
  readonly size: number;
}

export interface SlotFileApi {
  /** True while the picked file is being read and decrypted. */
  readonly busy: boolean;
  /** The file the current result is for, or null before the first pick. */
  readonly file: SlotFileInput | null;
  /** What core made of the file, or null before a pick has finished. */
  readonly result: SlotFileResult | null;
  /** SHA-256 of the file as picked, once it has been read. */
  readonly inputSha256: string | null;
  /** A failure to read the file itself, which is not a refusal. */
  readonly readError: string | null;
  /** The name the plain image downloads under. */
  readonly downloadName: string | null;
  decrypt: (file: File) => Promise<void>;
  download: () => void;
}

/** `bank-A.bin` becomes `bank-A_decrypted.bin`. */
export function decryptedNameOf(fileName: string): string {
  const stem = fileName.replace(/\.[^./\\]+$/, '') || 'slot';
  return `${stem}_decrypted.bin`;
}

export function useSlotFileDecrypt(): SlotFileApi {
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<SlotFileInput | null>(null);
  const [result, setResult] = useState<SlotFileResult | null>(null);
  const [inputSha256, setInputSha256] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  /* The pick whose result may still land: a later pick makes an earlier one stale. */
  const pick = useRef(0);

  const decrypt = useCallback(async (picked: File): Promise<void> => {
    const current = ++pick.current;
    setBusy(true);
    setFile({ name: picked.name, size: picked.size });
    setResult(null);
    setInputSha256(null);
    setReadError(null);
    try {
      const bytes = new Uint8Array(await picked.arrayBuffer());
      const sha = await sha256hex(bytes);
      const outcome = await decryptSlotFile(bytes);
      if (current !== pick.current) return;
      setInputSha256(sha);
      setResult(outcome);
    } catch (error) {
      if (current !== pick.current) return;
      setReadError(errorMessage(error));
    } finally {
      if (current === pick.current) setBusy(false);
    }
  }, []);

  const download = useCallback((): void => {
    if (result?.kind !== 'decrypted' || file === null) return;
    downloadBytes(result.plain, decryptedNameOf(file.name));
  }, [file, result]);

  return useMemo(
    () => ({
      busy,
      file,
      result,
      inputSha256,
      readError,
      downloadName:
        file === null || result?.kind !== 'decrypted' ? null : decryptedNameOf(file.name),
      decrypt,
      download,
    }),
    [busy, file, result, inputSha256, readError, decrypt, download],
  );
}
