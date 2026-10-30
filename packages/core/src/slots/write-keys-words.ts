/* ==================================================================== *
 * The words of a bank write's keys (write-keys.ts) and of the camera-wide write refusals
 * (workflows/device-info.ts), as messages: a code and params next to the English the CLI prints.
 * Each builder returns exactly the English its caller wrote before it had a code.
 * ==================================================================== */

import {
  bankParam,
  coreMessage,
  listParam,
  paramText,
  type CoreMessage,
  type CoreParam,
} from '../message.js';
import type { SlotKey } from '../profiles/types.js';
import { UNNAMED_KEY } from '../crypto/keys.js';

const KEY_NAME_CODE: ReadonlyMap<string, string> = new Map([
  ['Key A', 'keyName.keyA'],
  ['Key B', 'keyName.keyB'],
  ['per-device key', 'keyName.perDevice'],
  ['the per-device key', 'keyName.thePerDevice'],
  ["the application's Key A", 'keyName.applicationKeyA'],
  ["the application's Key B", 'keyName.applicationKeyB'],
  ['key block 1', 'keyName.block1'],
  ['the device key', 'keyName.theDeviceKey'],
  /* A slot's key when this read names none (SlotState.keyName). */
  [UNNAMED_KEY, 'keyName.unknown'],
]);

/** A key's name as a param: the names core gives keys are messages (translated), any other stays as it is. */
export function keyNameParam(name: string): CoreMessage | string {
  const code = KEY_NAME_CODE.get(name);
  return code === undefined ? name : coreMessage(code, {}, name);
}

/** Every key name core gives a code, for the page's tests. */
export const KEY_NAMES: readonly string[] = [...KEY_NAME_CODE.keys()];

/* ---- evidence: the facts a write's keys rest on ---- */

export const PLAIN_CHAIN_EVIDENCE: CoreMessage = coreMessage(
  'keys.evidence.plainChain',
  {},
  'the 2014 plaintext chain: every bank is stored plain, so no upload key is derived; ' +
    'the upload is the image as it is',
);

export const FF_VENDOR_EVIDENCE: readonly CoreMessage[] = [
  coreMessage(
    'keys.evidence.ffVendor',
    {},
    'the 1.3.0.8 FF (16 Hz) build: no bank this read opened is stored plain, so the camera is not shown ' +
      'to be on the 2014 plaintext chain; the FF image is written in its vendor form, raw bytes are sent ' +
      'as given, and a plain 8 Hz image is not written',
  ),
  coreMessage(
    'keys.evidence.ffUntested',
    {},
    'a write of the FF image is offered with its UNTESTED warning: no genuine bootloader for this build ' +
      'is in the corpus, so whether the written bank boots is not measured',
  ),
];

export const LINE_2016_EVIDENCE: CoreMessage = coreMessage(
  'keys.evidence.line2016',
  {},
  'the 2016 Compact PRO line: an upload is the image XORed with the keystream of its own key ' +
    'block 0, found in the image by value, so no key of this camera builds it',
);

/**
 * The 2016 line's check key: unnamed (with why, when the read said), or named with its bytes and the bank
 * it was named (or inferred) from.
 */
export function checkKeyEvidence(
  named: {
    readonly name: string;
    readonly hex: string;
    readonly from: SlotKey | null;
    readonly inferred: boolean;
  } | null,
  unnamedWhy: CoreParam | null,
): CoreMessage {
  if (named === null) {
    const head =
      'the camera decrypts the upload with that key and re-encrypts it under the key its ' +
      'bootloader checks a bank under; that key was not named on this read';
    const tail =
      ', and the write does not need it: the bank is read back as the image it decrypts to';
    return unnamedWhy === null
      ? coreMessage('keys.evidence.checkKeyUnnamed', {}, head + tail)
      : coreMessage(
          'keys.evidence.checkKeyUnnamedWhy',
          { why: unnamedWhy },
          `${head} (${paramText(unnamedWhy)})${tail}`,
        );
  }
  const key = keyNameParam(named.name);
  const head =
    `the camera decrypts the upload with that key and re-encrypts it under ${named.name} ` +
    `${named.hex}, the key its bootloader checks a bank under`;
  const tail = ', so every bank it writes is stored the way the bootloader takes it';
  if (named.from === null) {
    return coreMessage('keys.evidence.checkKeyNamed', { key, hex: named.hex }, head + tail);
  }
  const bank = bankParam(named.from);
  return named.inferred
    ? coreMessage(
        'keys.evidence.checkKeyInferred',
        { key, hex: named.hex, bank },
        `${head} (inferred from ${paramText(bank)}, the bank the camera reports it entered, which ` +
          `the bootloader entered without its check)${tail}`,
      )
    : coreMessage(
        'keys.evidence.checkKeyNamedFrom',
        { key, hex: named.hex, bank },
        `${head} (named from ${paramText(bank)}, the bank the camera reports it entered)${tail}`,
      );
}

export const KEY_TABLE_SOURCE: CoreMessage = coreMessage(
  'keys.source.keyTable',
  {},
  "the bootloader's key table",
);

export function applicationPairSource(builds: string): CoreMessage {
  return coreMessage(
    'keys.source.applicationPair',
    { builds },
    `the decoded application pair of ${builds}`,
  );
}

/** Where the running application carries its Key A (and its Key B, when it carries one). */
export function applicationEvidence(said: {
  readonly bank: SlotKey;
  readonly firmware: string;
  readonly keyA: string;
  readonly keyAAt: string;
  readonly source: CoreMessage;
  readonly keyB: { readonly hex: string; readonly at: string } | null;
}): CoreMessage {
  const bank = bankParam(said.bank);
  const params = {
    bank,
    firmware: said.firmware,
    keyA: said.keyA,
    keyAAt: said.keyAAt,
    source: said.source,
  };
  const text =
    `the running application (${paramText(bank)}, firmware ${said.firmware}) carries its Key A ` +
    `${said.keyA} at ${said.keyAAt}, from ${said.source.text}`;
  return said.keyB === null
    ? coreMessage('keys.evidence.applicationKeyA', params, text)
    : coreMessage(
        'keys.evidence.applicationKeys',
        { ...params, keyB: said.keyB.hex, keyBAt: said.keyB.at },
        `${text}, and its Key B ${said.keyB.hex} at ${said.keyB.at}`,
      );
}

export function storeEvidence(programmed: boolean): CoreMessage {
  return programmed
    ? coreMessage(
        'keys.evidence.perDevice',
        {},
        'a per-device key is programmed, so the application re-encrypts under it',
      )
    : coreMessage(
        'keys.evidence.noPerDevice',
        {},
        'no per-device key is programmed, so the application re-encrypts under its own Key B',
      );
}

/** The writes store under the bootloader's store key, which is the application's. */
export function storeKeyEvidence(said: {
  readonly key: string;
  readonly hex: string;
  readonly bank: SlotKey;
  readonly held: string;
}): CoreMessage {
  const bank = bankParam(said.bank);
  return coreMessage(
    'keys.evidence.storeKey',
    { key: keyNameParam(said.key), hex: said.hex, bank, held: keyNameParam(said.held) },
    `the application's store key is the bootloader's ${said.key} (${said.hex}), ` +
      `so the writes store every bank under it; the booted ${paramText(bank)} holds ${said.held}, ` +
      'which the bootloader accepts as well',
  );
}

/** The writes store under the booted bank's own key. */
export function bootedKeyEvidence(said: {
  readonly bank: SlotKey;
  readonly key: string;
  readonly hex: string;
}): CoreMessage {
  const bank = bankParam(said.bank);
  return coreMessage(
    'keys.evidence.bootedKey',
    { bank, key: keyNameParam(said.key), hex: said.hex },
    `the booted ${paramText(bank)} decrypts under ${said.key} (${said.hex}), a key the ` +
      "bootloader tries; the application's store key is not the bootloader's, so the writes store every " +
      'bank under the booted bank’s key',
  );
}

/** The keys whose keystreams the upload carries, and the key the device stores under. */
export function masksEvidence(masks: readonly string[], atRest: string): CoreMessage {
  return coreMessage(
    'keys.evidence.masks',
    { masks: listParam(masks.map(keyNameParam), 'comma'), key: keyNameParam(atRest) },
    `the upload is the image XOR the keystreams of ${masks.join(', ')}; ` +
      `the device stores the image under ${atRest}`,
  );
}

/** Another bank: the key it decrypts under (null: none known), and the key it is written under. */
export function otherBankEvidence(bank: SlotKey, held: string | null, atRest: string): CoreMessage {
  const heldParam: CoreParam =
    held === null ? coreMessage('keys.noKnownKey', {}, 'no known key') : keyNameParam(held);
  const words = bankParam(bank);
  return coreMessage(
    'keys.evidence.otherBank',
    { bank: words, held: heldParam, key: keyNameParam(atRest) },
    `${paramText(words)} decrypts under ${paramText(heldParam)}; ` +
      `it is written under ${atRest} by the same rule, and read back to check`,
  );
}

/* ---- refusals: why no key is derived ---- */

export const BOOT_UNNAMED_REFUSAL: CoreMessage = coreMessage(
  'keys.refused.bootUnnamed',
  {},
  'the booted bank could not be named, so the key the bank is stored under cannot be read from it',
);

export const NOT_DERIVED_REFUSAL: CoreMessage = coreMessage(
  'keys.refused.notDerived',
  {},
  'the keys could not be derived',
);

export function notDecryptedRefusal(key: SlotKey): CoreMessage {
  const bank = bankParam(key);
  return coreMessage(
    'keys.refused.notDecrypted',
    { bank },
    `the booted ${paramText(bank)} does not decrypt to an image, so the key it is stored under cannot be read`,
  );
}

export function noBootKeyRefusal(key: SlotKey): CoreMessage {
  const bank = bankParam(key);
  return coreMessage(
    'keys.refused.noBootKey',
    { bank },
    `the booted ${paramText(bank)} decrypts under no key the bootloader tries (its Key A, or its store ` +
      'key), so the key the bank is stored under cannot be read from it',
  );
}

export function keyNotInTableRefusal(key: SlotKey, keyName: string): CoreMessage {
  const bank = bankParam(key);
  return coreMessage(
    'keys.refused.keyNotInTable',
    { bank, key: keyNameParam(keyName) },
    `the booted ${paramText(bank)} decrypts under ${keyName}, but this camera's key table does not carry ` +
      'that key, so it cannot be written under it',
  );
}

/** No known pair is in the running application; `counted` is how often the bootloader's keys occur. */
export function noApplicationPairRefusal(
  key: SlotKey,
  firmware: string,
  counted: { readonly keyA: number; readonly keyB: number } | null,
): CoreMessage {
  const bank = bankParam(key);
  const text =
    `the running application (${paramText(bank)}, firmware ${firmware}) carries none of the known key ` +
    "pairs (the bootloader's and the decoded application pairs), each half exactly once, so its Key A " +
    'cannot be located in its image';
  if (counted === null) {
    return coreMessage('keys.refused.noApplicationPair', { bank, firmware }, text);
  }
  const [keyA, keyB] = [String(counted.keyA), String(counted.keyB)];
  return coreMessage(
    'keys.refused.noApplicationPairCounted',
    { bank, firmware, keyA, keyB },
    `${text} (the bootloader's Key A occurs ${keyA} time(s), its Key B ${keyB})`,
  );
}

/** The running build checks an upload under its own keys, and the store key is neither of them. */
export function uploadCheckedRefusal(said: {
  readonly bank: SlotKey;
  readonly firmware: string;
  readonly key: string;
  readonly hex: string;
}): CoreMessage {
  const bank = bankParam(said.bank);
  return coreMessage(
    'keys.refused.uploadChecked',
    { bank, firmware: said.firmware, key: keyNameParam(said.key), hex: said.hex },
    `the running application (${paramText(bank)}, firmware ${said.firmware}) checks an upload under its ` +
      'own keys before it programs it (the decoded source of this build tries the upload under its ' +
      'Key A and its store key, as its bootloader tries a bank), and ' +
      `the key the writes store under, ${said.key} (${said.hex}), is neither its ` +
      'Key A nor its store key, so the camera would refuse the upload with 0x50000 before erasing ' +
      'anything',
  );
}

/* ---- the camera-wide write refusals (DeviceState.bankWriteRefusals) ---- */

export function acceptanceSumRefusal(family: string, sum: string): CoreMessage {
  return coreMessage(
    'writeRefusal.acceptanceSum',
    { family, sum },
    `no slot decrypts to ${family}'s ${sum} acceptance sum`,
  );
}

export const KEY_TABLE_REFUSAL: CoreMessage = coreMessage(
  'writeRefusal.keyTable',
  {},
  "this camera's key table could not be confirmed",
);

export function whiteningRefusal(k: string, family: string, expected: string): CoreMessage {
  return coreMessage(
    'writeRefusal.whitening',
    { k, family, expected },
    `this camera's key table resolves under K=${k} but ${family} ` + `encrypts under K=${expected}`,
  );
}

/** The detection names another family; `reasons` are its evidence (`evidenceMessages`, or its English). */
export function otherFamilyRefusal(
  detected: string,
  family: string,
  reasons: readonly CoreParam[],
): CoreMessage {
  const why = listParam(reasons, 'semicolon');
  return coreMessage(
    'writeRefusal.otherFamily',
    { detected, family, reasons: why },
    `the evidence says this camera is ${detected}, not ${family} ` + `(${paramText(why)})`,
  );
}

/** Every camera-wide refusal in one sentence. */
export function cameraRefusalMessage(reasons: readonly CoreParam[]): CoreMessage {
  const all = listParam(reasons, 'semicolon');
  return coreMessage(
    'writeRefusal.camera',
    { reasons: all },
    `this camera cannot be written from here: ${paramText(all)}`,
  );
}
