/**
 * `seek-fw decrypt file <dump>` and `seek-fw decrypt slot <file>` — the offline path.
 *
 * Both touch no device, need no USB permission and load no native addon: the
 * key comes out of the ciphertext by cryptanalysis, so a dump from an SPI
 * programmer or a J-Link decrypts exactly as well as one this tool read.
 *
 *   file   a whole dump. Core's `decryptDump` scans it for every image slot and
 *          writes the per-slot images, reports and key log, as `dump` does.
 *   slot   one 64 KiB bank, as a slot read stores it. Core's `decryptSlotFile`
 *          decides what the file holds; this file writes the plain image and a
 *          report of the key's identity, size and sha256.
 *
 * Profile detection is core's, reached by simply not naming a profile: offline
 * there is no device evidence, so the file's own images decide. `--profile`
 * overrides it, and either way the choice is printed and written into the report.
 */

import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  buildOfflineDecryptManifest,
  decryptDump,
  decryptSlotFile,
  getProfile,
  hexUp,
  makeOfflineDecryptReadme,
  manifestToJson,
  profileInfoOf,
  sha256hex,
  slotFileReport,
  utf8,
  type Artifact,
  type DecryptOptions,
  type FirmwareProfile,
  type SlotFileDecryption,
} from '@seek-fw/core';
import type { CommandContext, CommandResult } from '../cli.js';
import { CliError } from '../errors.js';
import { table, uniqueArtifacts, writeRun } from './shared.js';

function stemOf(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, '');
}

async function readInput(path: string): Promise<Uint8Array> {
  let bytes: Uint8Array;
  try {
    const buffer = await readFile(path);
    bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } catch (error) {
    throw new CliError(
      `could not read ${path}: ${error instanceof Error ? error.message : String(error)}`,
      { code: 'cli/no-input' },
    );
  }
  if (bytes.length === 0) throw new CliError(`${path} is empty`, { code: 'cli/no-input' });
  return bytes;
}

export async function decryptCommand(ctx: CommandContext): Promise<CommandResult> {
  const [form, path] = ctx.args ?? [];
  if (path === undefined) {
    throw new CliError(
      'decrypt needs a form and a file: decrypt file <dump> | decrypt slot <file>',
      {
        code: 'cli/usage',
      },
    );
  }
  if (form === 'slot') return decryptSlotCommand(ctx, path);
  if (form === 'file') return decryptFileCommand(ctx, path);
  throw new CliError(`decrypt takes 'file' or 'slot', got '${form ?? ''}'`, { code: 'cli/usage' });
}

/* ==================================================================== *
 * decrypt file
 * ==================================================================== */

async function decryptFileCommand(ctx: CommandContext, path: string): Promise<CommandResult> {
  const bytes = await readInput(path);

  const fileName = basename(path);
  const startedAt = new Date().toISOString();

  /* With no --profile, core detects the family from the dump itself: offline
   * there is no device evidence, and the file's own slots are the only thing
   * that can speak for it. The choice comes back on the result so it can be
   * shown and recorded rather than silently applied. */
  const forced = ctx.options.profile === null ? null : getProfile(ctx.options.profile);
  if (forced !== null) ctx.reporter.log(`profile ${forced.id} (--profile)`, 'detail');
  ctx.reporter.log(`${fileName}: ${String(bytes.length)} B`, 'detail');

  const options: DecryptOptions = {
    dumpPath: fileName,
    signal: ctx.signal,
    ...(forced === null ? {} : { profile: forced }),
  };
  const result = await decryptDump(bytes, stemOf(fileName), options, ctx.reporter);

  const detection = result.detection;
  const profile: FirmwareProfile = forced ?? detection?.best.profile ?? getProfile('generic');

  /* Core's builder, not a literal: the web app decrypts offline too, and the
   * two manifests have to be the same document whichever front end wrote it.
   * Only the host inside `producer` differs. */
  const manifest = buildOfflineDecryptManifest({
    producer: `seek-thermal-firmware-dump (seek-fw CLI, ${profile.id})`,
    startedAt,
    finishedAt: new Date().toISOString(),
    source: { fileName, size: bytes.length, sha256: await sha256hex(bytes) },
    flashBase: profile.memory.flashBase,
    decryption: result.summary,
    profile: profileInfoOf(profile, detection),
  });

  const extra: Artifact[] = [
    { name: 'manifest.json', data: utf8(manifestToJson(manifest)) },
    { name: 'README.md', data: utf8(makeOfflineDecryptReadme(manifest)) },
  ];
  for (const artifact of extra) ctx.reporter.artifact(artifact);

  const written = await writeRun(ctx, 'decrypt', uniqueArtifacts(ctx.reporter.artifacts));

  if (ctx.human) {
    ctx.out('');
    if (detection === null) {
      ctx.out(`profile: ${profile.id} — ${profile.name} (forced with --profile)`);
    } else {
      ctx.out(
        `profile: ${profile.id} — ${profile.name} (detected, score ` +
          `${detection.best.score.toFixed(2)}${detection.ambiguous ? ', AMBIGUOUS' : ''})`,
      );
      for (const reason of detection.best.reasons) ctx.out(`  · ${reason}`);
    }
    if (result.slots.length === 0) {
      ctx.out('no firmware image slots were found in this file');
    } else {
      ctx.out('');
      ctx.out(
        table(
          result.slots.map((slot) => [
            hexUp(slot.flash),
            `${String(slot.length)} B`,
            slot.recovered.confidence,
            hexUp(slot.recovered.checksum),
            hexUp(slot.whitening.whiteningK),
            slot.duplicateOf === null ? '' : `copy of ${hexUp(slot.duplicateOf)}`,
            slot.plainSha256.slice(0, 16),
          ]),
          ['slot', 'size', 'key', 'sum', 'K', 'note', 'sha256'],
        ),
      );
      ctx.out('');
    }
  }

  return {
    source: { file: fileName, size: bytes.length, sha256: manifest.source.sha256 },
    profile: profile.id,
    detection:
      detection === null
        ? null
        : {
            id: detection.best.profile.id,
            score: detection.best.score,
            ambiguous: detection.ambiguous,
            reasons: [...detection.best.reasons],
          },
    profileForced: forced !== null,
    slots: result.slots.map((slot) => ({
      flash: hexUp(slot.flash),
      fileOffset: hexUp(slot.fileOffset),
      length: slot.length,
      confidence: slot.recovered.confidence,
      acceptanceSum: hexUp(slot.recovered.checksum),
      whiteningK: hexUp(slot.whitening.whiteningK),
      whiteningEvidence: slot.whitening.evidence,
      key: slot.whitening.keyHex,
      sp: hexUp(slot.sp),
      entry: hexUp(slot.entry),
      duplicateOf: slot.duplicateOf === null ? null : hexUp(slot.duplicateOf),
      cipherSha256: slot.cipherSha256,
      plainSha256: slot.plainSha256,
      file: slot.file,
    })),
    cancelled: result.cancelled,
    output: { directory: written.directory, zip: written.zip, files: written.files },
    manifest,
  };
}

/* ==================================================================== *
 * decrypt slot
 * ==================================================================== */

/** The one-line statement of what a slot decrypt found, for the terminal. */
function statusLine(result: SlotFileDecryption): string {
  switch (result.status) {
    case 'decrypted':
      return 'decrypted';
    case 'empty':
      return 'empty — an erased bank, nothing to decrypt';
    case 'no-image':
      return 'no firmware image in this bank';
    case 'bad-header':
      return 'the image header is out of range; not decrypted';
    case 'not-decrypted':
      return 'an image header, but its key does not recover; not decrypted';
  }
}

function keyLine(result: SlotFileDecryption): string {
  const key = result.key;
  if (key === null) return '(none)';
  if (key.method === 'stored-plain') return 'none — stored plain (the 2014 plaintext chain)';
  if (key.method === 'ff-key-b') return 'FF 1.3.0.8 Key B';
  const name = key.named ?? 'a key this build does not name';
  return `${name} (K=${hexUp(key.whiteningK ?? 0)}, key ${key.key ?? '(none)'})`;
}

async function decryptSlotCommand(ctx: CommandContext, path: string): Promise<CommandResult> {
  const bytes = await readInput(path);
  const fileName = basename(path);
  const stem = stemOf(fileName);

  const forced = ctx.options.profile === null ? null : getProfile(ctx.options.profile);
  if (forced !== null) ctx.reporter.log(`profile ${forced.id} (--profile)`, 'detail');
  const result = await decryptSlotFile(bytes, forced === null ? {} : { profile: forced });

  /* The report is written whatever the outcome: for a bank that holds no image it is the
   * only record of why. */
  if (result.plain !== null) {
    ctx.reporter.artifact({ name: `${stem}-decrypted.bin`, data: result.plain });
  }
  ctx.reporter.artifact({
    name: `${stem}-report.txt`,
    data: utf8(slotFileReport(result, fileName)),
  });
  const written = await writeRun(ctx, 'decrypt-slot', uniqueArtifacts(ctx.reporter.artifacts));

  if (ctx.human) {
    ctx.out('');
    ctx.out(
      table([
        ['  bank', statusLine(result)],
        [
          '  profile',
          `${result.profile.id} — ${result.profile.name} (${
            result.profile.detected ? 'detected from the bank' : 'given by --profile'
          })`,
        ],
        ['  key', keyLine(result)],
        ['  file', `${fileName} (${String(result.size)} B), sha256 ${result.sha256}`],
        [
          '  decrypted',
          result.plain === null
            ? '(no image)'
            : `${String(result.plain.length)} B, sha256 ${result.plainSha256 ?? '(none)'}`,
        ],
      ]),
    );
  }

  const output = { directory: written.directory, zip: written.zip, files: written.files };
  const summary = {
    source: { file: fileName, size: result.size, sha256: result.sha256 },
    status: result.status,
    profile: result.profile,
    header: result.header,
    key: result.key,
    decrypted: result.plain !== null,
    plainSha256: result.plainSha256,
    notes: [...result.notes],
    output,
  };

  /* A bank that holds no image, or whose key does not recover, has nothing to show a script
   * but the report, so it fails the run. The report is written first, as above. */
  if (
    result.status === 'no-image' ||
    result.status === 'bad-header' ||
    result.status === 'not-decrypted'
  ) {
    throw new CliError(`${fileName}: ${statusLine(result)}`, {
      code: 'decrypt/no-image',
      hint: `The report is ${written.directory === null ? 'in the zip' : `in ${written.directory}`}.`,
    });
  }
  return summary;
}
