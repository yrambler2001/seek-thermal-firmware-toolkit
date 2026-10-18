/* ==================================================================== *
 * The keys a modern-line bank is written under, derived from the camera it
 * is written to: the booted bank and the running application. Pure, no device.
 *
 * WHAT THE CAMERA DOES WITH AN UPLOAD. The 4.x/10.x/42.x application
 * (FW-V1 `fw_validate_decrypt_program`, targets/mosaic_18hz_10_9_1_31/src/
 * update.c) takes the staged bytes and passes them through two keystreams:
 *
 *   1. decrypt_image_keyA:          XOR with the keystream of ITS Key A;
 *   2. decrypt_image_keyB_or_device: XOR with its store key's keystream (the
 *      per-device key when one is programmed, else its own Key B);
 *
 * then erases, programs what results, and reads it back against RAM. Both passes
 * are the same self-inverse cipher, so the bank receives
 *
 *      stored = upload XOR KS(application Key A) XOR KS(store key)
 *
 * and nothing else. The bootloader accepts a bank only if its stored bytes decrypt,
 * under a key it tries (its own Key A, or its store key), to the acceptance sum.
 *
 * THE DERIVATION. The page wants every bank to hold image XOR KS(K), where K is a key the
 * bootloader accepts, so it sends
 *
 *      upload = image XOR KS(K) XOR KS(store key) XOR KS(application Key A),
 *
 * and the camera stores image XOR KS(K). Two keys the bootloader accepts are candidates for K:
 *   - its store key, when the application's store key is the same key (then the upload is the
 *     image under the application's Key A alone: the form every passing row has always sent);
 *   - the booted bank's own key (Key A, on the banks of the 4.8, 4.9 and 4.18 builds), when the
 *     application's store key is not the bootloader's (Mosaic 10.9.1.31: its application stores
 *     under 997ed6e5, which the bootloader does not try; its booted bank holds Key A, which it does).
 * The store key is preferred, so the passing rows keep their bytes; the booted bank's key is the
 * fallback, and is read from the bank the camera boots, not assumed. K is then checked: a build that
 * checks its upload under its own keys (see below) must find K equal to its store key or its Key A.
 *
 * WHAT IS LOCATED, AND HOW. The application's own pair is found in the booted bank's
 * decrypted image by value (`findEmbeddedKeyTable`: each half exactly once), trying the
 * bootloader's pair first and then the decoded application pairs in
 * `application-pairs.ts`. A pair the image does not carry is not found. K is the
 * identity `identifyKey` gives the booted bank (a key the bootloader tries), and must
 * decrypt the bank to the acceptance sum with a footer, or the derivation refuses.
 *
 * WHAT A BUILD CHECKS. Some builds run `image_try_keys` on the staged image before the
 * first pass and after the second (the decoded 4.8.1.x, 4.8.2.1 XR, 4.16.1.7 FF, Nano 200
 * and Nano 300 sources do). On those a composite is accepted only when K is the
 * application's store key or its Key A: for K = Key A the staged image decrypts under
 * Key A, and the stored bank under Key A after the second pass, so both checks pass. The
 * other builds (`UNCHECKED_UPLOAD_BUILDS`: 4.9.1.15, 4.9.2.0, 4.18.2.0, 10.9.1.31,
 * 2.27.1.33) have no such check, and the composite is stored as derived. An unlisted or
 * unknown build is treated as checking. Measured: the 10.9.1.31 composite is accepted
 * by the bootloader on the emulator (accept.emulator.test.ts); the 4.16.1.7 composite is
 * refused with 0x50000 before erasing (corpus-modern.emulator.test.ts).
 * ==================================================================== */

import { bytesToHex, equalBytes, findAll, hexToBytes, hexUp } from '../bytes.js';
import { cryptBytes } from '../crypto/cipher.js';
import { findEmbeddedKeyTable, stateFromKey, UNNAMED_KEY } from '../crypto/keys.js';
import type { CipherProfile, SlotKey } from '../profiles/types.js';
import type { DerivedKey } from './types.js';
import { unreadSlotBlock } from '../workflows/device-info.js';
import type { DeviceState } from '../workflows/types.js';
import { APPLICATION_KEY_PAIRS } from './application-pairs.js';
import { classifyBuild, stagingFor } from './capability-family.js';

/** A named key and its 16 bytes. */
export interface KeyRef {
  readonly name: string;
  readonly key: Uint8Array;
}

/** The running application's own pair, as located in its decrypted image. */
export interface ApplicationKeys {
  /** The booted bank the application was read from. */
  readonly bank: SlotKey;
  readonly firmware: string | null;
  readonly keyA: Uint8Array;
  /** Null when a per-device key is programmed: the application's Key B is then not used. */
  readonly keyB: Uint8Array | null;
  /** Where the pair came from: the bootloader's key table, or a decoded application pair. */
  readonly source: string;
  readonly keyAAt: number;
  readonly keyBAt: number | null;
}

export interface WriteKeys {
  /** Why no bank can be written from this camera, stated with the measurement; null when derived. */
  readonly refusal: string | null;
  /**
   * The 2014 plaintext chain: every bank is stored plain, so there is no key to derive. An upload is
   * the image as it is (staging 'plain'), and `atRest`, `application`, `store` and `masks` are null or
   * empty. A null `atRest` with `plainChain` false is a refusal, never this.
   */
  readonly plainChain: boolean;
  /** The booted bank the at-rest key was read from, or null. */
  readonly booted: SlotKey | null;
  /** The key the booted bank decrypts under, by the bootloader's name for it ("Key A"), or null. */
  readonly bootedKeyName: string | null;
  /** K: the key every bank is written under: the store key, or the booted bank's key (see deriveWriteKeys). */
  readonly atRest: KeyRef | null;
  readonly application: ApplicationKeys | null;
  /** The application's store key: the per-device key when programmed, else its own Key B. */
  readonly store: KeyRef | null;
  /** The keys whose keystreams the upload carries, pairwise cancelled, in the order XORed. */
  readonly masks: readonly KeyRef[];
  /** One line per fact the derivation relied on, for the page and the CLI. */
  readonly evidence: readonly string[];
}

/**
 * The builds whose decoded upload path (FW-V1 targets/<build>/src/update.c,
 * `fw_validate_decrypt_program`) has no `image_try_keys` check on the staged image.
 */
export const UNCHECKED_UPLOAD_BUILDS: ReadonlySet<string> = new Set([
  '4.9.1.15',
  '4.9.2.0',
  '4.18.2.0',
  '10.9.1.31',
  '2.27.1.33',
]);

/** Whether this build checks an upload under its own keys before it programs it (unknown: yes). */
export function checksUploadUnderOwnKeys(version: string | null): boolean {
  return version === null || !UNCHECKED_UPLOAD_BUILDS.has(version);
}

/**
 * Whether this build's slot writes are sent under keys the camera holds: the Key A staging, the modern
 * line. Only those writes read the camera's key table and the upload-key derivation, so only those can be
 * refused for the camera as a whole. The 2014 plaintext chain (plain staging), the 2016 keystream line
 * (its own key pair, found in the image) and the 1.3.0.8 FF build (its vendor form) stage from their own
 * images: the write path sends them whatever the camera's key table says, so a camera-wide reason such as
 * "the key table could not be confirmed" or "the write path is implemented only for the 2014 chain" is a
 * false banner on them (it is the classic `flash` gate's wording, not the slot page's).
 */
export function stagesUnderCameraKey(state: DeviceState): boolean {
  return stagingFor(classifyBuild(state.profile, state.version).family) === 'key-a-ciphertext';
}

/**
 * Why a bank of this camera cannot be written, or null when it can. On a build whose writes are sent under
 * the camera's keys (`stagesUnderCameraKey`): the page's own gate minus the one reason it replaces, then the
 * derivation of the upload keys. On the other builds no camera-wide reason applies, and the bank's own
 * refusal (the plan, an unread or an empty bank) is the page's answer. The slot page, the CLI and the writer
 * all ask this one question, so they cannot disagree about it.
 */
export function slotWriteRefusal(state: DeviceState): string | null {
  const gate = gateWithoutAppKeys(state);
  if (gate !== null) return gate;
  return stagesUnderCameraKey(state) && !state.plainChain ? deriveWriteKeys(state).refusal : null;
}

/**
 * The text of the page's "No bank of this camera can be written from here" banner, or null when the page
 * shows none. The one definition: the page reads it, and the tests and the bench assert the CLI's JSON
 * `writeKeys.refused` against it, so the two cannot disagree.
 */
export function writeBannerOf(state: DeviceState): string | null {
  const refusal = slotWriteRefusal(state);
  if (refusal !== null) return refusal;
  if (!stagesUnderCameraKey(state) || state.plainChain) return null;
  const keys = deriveWriteKeys(state);
  return keys.atRest === null ? (keys.refusal ?? 'the keys could not be derived') : null;
}

/**
 * The sentence that says which key a derived write stores under, and from which booted bank it was
 * derived (the CLI and the page both show it). `bankLabel` is how the caller names the bank.
 */
export function derivedKeyLine(
  derived: Pick<DerivedKey, 'key' | 'holds'>,
  bankLabel: string,
): string {
  if (!derived.holds || derived.holds === derived.key) {
    return `${derived.key}, derived from the booted ${bankLabel}`;
  }
  return `${derived.key} (the store key), derived from the booted ${bankLabel}, which holds ${derived.holds}`;
}

/** XOR-cancel equal keys pairwise (XOR is self-inverse), keeping the order of the rest. */
export function cancelPairs(masks: readonly KeyRef[]): KeyRef[] {
  const kept: KeyRef[] = [];
  for (const mask of masks) {
    const at = kept.findIndex((k) => equalBytes(k.key, mask.key));
    if (at >= 0) kept.splice(at, 1);
    else kept.push(mask);
  }
  return kept;
}

/** The key a bank is stored under, by the bootloader's own name for it. */
function keyBytesNamed(state: DeviceState, name: string): Uint8Array | null {
  if (name === 'Key A') return state.keyTable?.keyA ?? null;
  if (name === 'Key B') return state.keyTable?.keyB ?? null;
  if (name === 'per-device key') return state.storeKey.programmed ? state.storeKey.key : null;
  return null;
}

/**
 * The page's own flash gate, for the camera as a whole: the flash gate's reasons minus the three that
 * are not about the camera as a whole.
 *   - the running application lacks the bootloader's pair (this module replaces it, `appKeysBlock`);
 *   - a bank the read could not read: the bank's row says so and its write is refused by name, so the
 *     other banks are still writable and the banner must not say none is;
 *   - the upgrade flow's reasons (`upgradeBlockedBy`: which bank an upgrade would write). The page writes
 *     the bank it names through that bank's own window, and an unnamed boot is handled by the
 *     acknowledgement, so the upgrade's target does not refuse a write;
 *   - on a build that does not stage under the camera's key (`stagesUnderCameraKey`), the classic writer's
 *     own reasons (`classicWriterBlockedBy`: the key table, the 2014-only line).
 * Null when nothing else refuses. Every other reason still refuses the whole camera, and says which.
 */
export function gateWithoutAppKeys(state: DeviceState): string | null {
  const unread = new Set(state.slots.filter((slot) => slot.unread).map(unreadSlotBlock));
  const upgrade = new Set(state.upgradeBlockedBy ?? []);
  /* The classic writer's own reasons refuse only the lines that write under the camera's key; the 2016 and
   * FF lines do not stage under it, so they never see those reasons. */
  const classic = stagesUnderCameraKey(state)
    ? new Set<string>()
    : new Set(state.classicWriterBlockedBy ?? []);
  const others = state.flashBlockedBy.filter(
    (why) =>
      why !== (state.appKeysBlock ?? null) &&
      !unread.has(why) &&
      !upgrade.has(why) &&
      !classic.has(why),
  );
  if (others.length === 0) return null;
  return `this camera cannot be written from here: ${others.join('; ')}`;
}

/**
 * Derive the keys one upload is built with, from the booted bank and the running
 * application (see the header). Every refusal names the measurement that failed.
 */
export function deriveWriteKeys(state: DeviceState): WriteKeys {
  const evidence: string[] = [];
  const refused = (refusal: string): WriteKeys => ({
    refusal,
    plainChain: false,
    booted: null,
    bootedKeyName: null,
    atRest: null,
    application: null,
    store: null,
    masks: [],
    evidence,
  });

  /* The 2014 plaintext chain: no bank is keyed, so there is no key to read from the booted bank and no
   * application pair to locate. Nothing is refused for a key it does not have (TESTING.md 42.13). */
  if (state.plainChain) {
    return {
      refusal: null,
      plainChain: true,
      booted: state.boot?.booted ?? null,
      bootedKeyName: null,
      atRest: null,
      application: null,
      store: null,
      masks: [],
      evidence: [
        'the 2014 plaintext chain: every bank is stored plain, so no upload key is derived; ' +
          'the upload is the image as it is',
      ],
    };
  }

  const boot = state.boot;
  if (boot === null) {
    return refused(
      'the booted bank could not be named, so the key the bank is stored under cannot be read from it',
    );
  }
  const booted = state.byKey.get(boot.booted) ?? null;
  const bootedName = `bank ${boot.booted.toUpperCase()}`;
  if (booted === null || booted.unread || booted.plain === null) {
    return refused(
      `the booted ${bootedName} does not decrypt to an image, so the key it is stored under cannot be read`,
    );
  }

  /* The booted bank: the bootloader accepts it under the key its identity names (identifyKey). The
   * placeholder UNNAMED_KEY is no key the bootloader tries, so it names none. */
  const bootedKeyName = booted.keyName === UNNAMED_KEY ? null : booted.keyName;
  if (!booted.bootable || bootedKeyName === null) {
    return refused(
      `the booted ${bootedName} decrypts under no key the bootloader tries (its Key A, or its store ` +
        'key), so the key the bank is stored under cannot be read from it',
    );
  }
  const bootedKey = keyBytesNamed(state, bootedKeyName);
  if (bootedKey === null) {
    return refused(
      `the booted ${bootedName} decrypts under ${bootedKeyName}, but this camera's key table does not carry ` +
        'that key, so it cannot be written under it',
    );
  }

  /* The running application: its own pair, located by value in the booted bank's image. */
  const plain = booted.plain;
  const version = booted.plainHeader?.versionStr ?? state.version ?? null;
  const programmed = state.storeKey.programmed;
  const candidates: { source: string; keyA: Uint8Array; keyB: Uint8Array }[] = [];
  if (state.keyTable !== null) {
    candidates.push({
      source: "the bootloader's key table",
      keyA: state.keyTable.keyA,
      keyB: state.keyTable.keyB,
    });
  }
  for (const pair of APPLICATION_KEY_PAIRS) {
    candidates.push({
      source: `the decoded application pair of ${pair.builds}`,
      keyA: hexToBytes(pair.keyA),
      keyB: hexToBytes(pair.keyB),
    });
  }
  let application: ApplicationKeys | null = null;
  for (const cand of candidates) {
    if (programmed) {
      const at = findAll(plain, cand.keyA);
      if (at.length === 1) {
        application = {
          bank: boot.booted,
          firmware: version,
          keyA: cand.keyA,
          keyB: null,
          source: cand.source,
          keyAAt: at[0] ?? 0,
          keyBAt: null,
        };
        break;
      }
    } else {
      const at = findEmbeddedKeyTable(plain, cand.keyA, cand.keyB);
      if (at !== null) {
        application = {
          bank: boot.booted,
          firmware: version,
          keyA: cand.keyA,
          keyB: cand.keyB,
          source: cand.source,
          keyAAt: at.offsetA,
          keyBAt: at.offsetB,
        };
        break;
      }
    }
  }
  if (application === null) {
    const table = state.keyTable;
    const counted =
      table === null
        ? ''
        : ` (the bootloader's Key A occurs ${String(findAll(plain, table.keyA).length)} time(s), ` +
          `its Key B ${String(findAll(plain, table.keyB).length)})`;
    return refused(
      `the running application (${bootedName}, firmware ${version ?? '?'}) carries none of the key ` +
        `pairs this page knows, each half exactly once, so its Key A cannot be located in its image${counted}`,
    );
  }
  evidence.push(
    `the running application (${bootedName}, firmware ${version ?? '?'}) carries its Key A ` +
      `${bytesToHex(application.keyA)} at ${hexUp(application.keyAAt)}, from ${application.source}` +
      (application.keyB !== null
        ? `, and its Key B ${bytesToHex(application.keyB)} at ${hexUp(application.keyBAt ?? 0)}`
        : ''),
  );

  /* The store key the application re-encrypts under. */
  const store: KeyRef = programmed
    ? { name: 'the per-device key', key: state.storeKey.key ?? new Uint8Array(16) }
    : { name: "the application's Key B", key: application.keyB ?? new Uint8Array(16) };
  evidence.push(
    programmed
      ? 'a per-device key is programmed, so the application re-encrypts under it'
      : 'no per-device key is programmed, so the application re-encrypts under its own Key B',
  );

  /*
   * The key the writes store every bank under. Two keys the bootloader accepts are candidates: its
   * store key (which the application re-encrypts under, when its store key is the bootloader's), and
   * the booted bank's own key. The store key is preferred, because it is the form every row that
   * passes has always been sent in, and the booted bank's own key is the fallback where the
   * application's store key is not the bootloader's (the booted bank then holds a key the page must
   * keep to, or the camera would keep it under a key it cannot take). Both are bootloader keys.
   */
  const bootStore = state.storeKey;
  let atRest: KeyRef;
  if (bootStore.key !== null && equalBytes(bootStore.key, store.key)) {
    const storeName = bootStore.programmed ? 'per-device key' : 'Key B';
    atRest = { name: storeName, key: bootStore.key };
    evidence.push(
      `the application's store key is the bootloader's ${storeName} (${bytesToHex(bootStore.key)}), ` +
        `so the writes store every bank under it; the booted ${bootedName} holds ${bootedKeyName}, ` +
        'which the bootloader accepts as well',
    );
  } else {
    atRest = { name: bootedKeyName, key: bootedKey };
    evidence.push(
      `the booted ${bootedName} decrypts under ${bootedKeyName} (${bytesToHex(bootedKey)}), a key the ` +
        "bootloader tries; the application's store key is not the bootloader's, so the writes store every " +
        'bank under the booted bank’s key',
    );
  }

  if (checksUploadUnderOwnKeys(version)) {
    const underStore = equalBytes(atRest.key, store.key);
    const underKeyA = equalBytes(atRest.key, application.keyA);
    if (!underStore && !underKeyA) {
      return refused(
        `the running application (${bootedName}, firmware ${version ?? '?'}) checks an upload under its ` +
          `own keys before it programs it (image_try_keys, in the decoded source of this build), and ` +
          `the key the writes store under, ${atRest.name} (${bytesToHex(atRest.key)}), is neither its ` +
          'Key A nor its store key, so the camera would refuse the upload with 0x50000 before erasing ' +
          'anything',
      );
    }
  }

  const masks = cancelPairs([
    atRest,
    store,
    { name: "the application's Key A", key: application.keyA },
  ]);
  evidence.push(
    `the upload is the image XOR the keystreams of ${masks.map((m) => m.name).join(', ')}; ` +
      `the device stores the image under ${atRest.name}`,
  );
  for (const other of state.slots) {
    if (other.key === boot.booted || other.unread || other.plain === null) continue;
    evidence.push(
      `bank ${other.key.toUpperCase()} decrypts under ` +
        `${other.keyName === null || other.keyName === UNNAMED_KEY ? 'no key this page knows' : other.keyName}; ` +
        `it is written under ${atRest.name} by the same rule, and read back to check`,
    );
  }

  return {
    refusal: null,
    plainChain: false,
    booted: boot.booted,
    bootedKeyName,
    atRest,
    application,
    store,
    masks,
    evidence,
  };
}

/**
 * The device's own arithmetic, run on the bytes the page would send: the application's
 * two passes over the staged image, then the bootloader's acceptance under K. Returns a
 * refusal when the stored bank would not decrypt to the stamped image, else null. Pure.
 */
export function uploadLandsUnder(
  keys: WriteKeys,
  cipher: CipherProfile,
  stamped: Uint8Array,
  upload: Uint8Array,
): string | null {
  if (keys.atRest === null || keys.application === null || keys.store === null) {
    return 'the upload keys are not derived';
  }
  const K = cipher.whiteningK;
  const body = upload.subarray(0, stamped.length);
  const afterKeyA = cryptBytes(body, stateFromKey(keys.application.keyA, K), cipher);
  const stored = cryptBytes(afterKeyA, stateFromKey(keys.store.key, K), cipher);
  const decrypted = cryptBytes(stored, stateFromKey(keys.atRest.key, K), cipher);
  return equalBytes(decrypted, stamped)
    ? null
    : `the upload would be stored as an image that does not decrypt under ${keys.atRest.name} to the ` +
        'staged image, so it is not sent';
}
