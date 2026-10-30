/**
 * Namespace `decrypt`, English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'No file chosen.',
  'status.reading': 'Reading file ...',
  'status.notUsable': 'Not a usable dump.',
  'status.building': 'Building archive ...',
  'status.nothingDecrypted':
    'No images decrypted — see the log for why. The manifest is in your downloads.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Done — {done}/{count} slot decrypted. Check your downloads.',
    other: 'Done — {done}/{count} slots decrypted. Check your downloads.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Decrypt a dump you already have',
  'offline.description': 'A whole flash dump, decrypted slot by slot.',
  'offline.intro':
    'Step 2 of the 4.x/Nano tab already decrypts everything it reads, so you only need this if your flash image came from somewhere else — an earlier run, J-Link, or an SPI programmer. The file is read locally and never uploaded. **This part works in every browser**, including Safari and iOS, because it needs no USB access.',
  'offline.actions': 'Offline decrypt actions',
  'offline.choose': 'Choose dump file…',
  'offline.panel': 'Offline decrypt',
  'offline.detectedTitle': 'Detected firmware family',
  'offline.detectedIntro':
    "No camera is attached, so the family is scored from the images in the file itself. The key is solved out of each slot's ciphertext either way; this is what names the firmware family in the report.",
  'offline.scoreBasis': 'from the images in the file',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Decrypt a firmware slot',
  'slot.description': 'One bank, from a file: 64 KiB, as the camera stores it.',
  'slot.intro':
    "Pick a file that holds one firmware slot — a bank, 65,536 bytes, the way a slot dump on the <link>{tab}</link> tab saves it, or the 64 KiB at a bank's address in a whole-flash dump. The page finds the key from the bank's own bytes, decrypts the image, and offers it for download with the key, the size and the SHA-256 shown. No camera is used, so this works with nothing plugged in.",
  'slot.refusedIntro':
    'A file that is not one bank, holds no firmware image, or does not decrypt is refused with the reason. An erased bank says so and has nothing to decrypt.',
  'slot.actions': 'Slot file actions',
  'slot.choose': 'Choose slot file…',
  'slot.decrypting': 'Decrypting {file} …',
  'slot.unreadable': 'The file could not be read.',
  'slot.notDecrypted': 'Not decrypted: {file} is not a firmware slot this page can decrypt.',
  'slot.nothingWritten':
    'Nothing was written anywhere. Pick a 64 KiB bank file, or a whole dump in the section above.',
  'slot.erased': '{file} is an erased bank.',
  'slot.resultTitle': 'Decrypted firmware slot',
  'slot.file': 'File',
  'slot.fileSize': 'File size',
  'slot.fileSha': 'SHA-256 of the file',
  'slot.imageVersion': 'Image version',
  'slot.imageSize': 'Image size',
  'slot.imageSha': 'Image SHA-256',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Acceptance sum',
  'slot.notComputed': 'not computed for this form',
  'slot.family': 'Family',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (detected from the image)',
  'slot.familyMismatch':
    "{name} — the sum is not this family's acceptance target, so the bootloader would not take the image as it stands",
  'slot.unknown': 'unknown',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Key',
  'slot.keyPlain': 'none: the bank holds the image in the clear (the 2014 plaintext chain)',
  'slot.keyFfB': 'Key B of the 1.3.0.8 FF pair',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Stored as',
  'slot.storedAsFfB': 'the image XOR the Key B keystream, header window verbatim',
  'slot.keyNone': 'none',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Key form',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — the image itself holds this form once, which names it',
  'slot.keyFormDefault': '{k} — no form occurs once in the image, so the family default is shown',
  'slot.resultActions': 'Decrypted image actions',
  'slot.download': 'Download {file}',
  'slot.downloadFallback': 'the decrypted image',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Detected',
  'detection.score': 'Score',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} of 1.00, {basis}',
  'detection.readAs': 'Read as',
  'detection.summary': 'Summary',
  'detection.why': 'Why:',
  'detection.ambiguous':
    '**The evidence did not settle which family this is.** Either the winner scored no better than the generic fallback, or a runner-up came too close to call. The decryption is unaffected — the key is solved out of the ciphertext either way — but the family named in the report, and anything gated on it, is a guess.',
} as const satisfies NamespaceMessages;
