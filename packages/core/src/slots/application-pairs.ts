/* ==================================================================== *
 * The application key pairs of the modern line, as CANDIDATES.
 *
 * A running application carries its own g_keyA (the key it decrypts an upload
 * with) and g_keyB (the key it re-encrypts under when no per-device key is
 * programmed). Those bytes are not derivable from behaviour, so they cannot be
 * computed; they can only be LOCATED. A candidate pair is accepted for an
 * application only when both halves occur exactly once in that application's
 * decrypted image (`findEmbeddedKeyTable`), so a table entry the image does not
 * carry is simply not found. The bootloader's own pair is always tried first.
 *
 * Source of each pair: the FW-V1 target sources, `g_keyA[16]` and `g_keyB[16]`
 * in `targets/<build>/src/data_unattributed.c`, named below by the target. Each
 * revision ships its own pair; the pilot pair (4.18.2.0 FF) is the one the
 * 10.9.1.31 application also carries (TESTING.md sec.21.2).
 * ==================================================================== */

export interface ApplicationKeyPair {
  /** The builds the pair ships in, as a person reads them. */
  readonly builds: string;
  /** The FW-V1 target directories the pair was read from (provenance). */
  readonly targets: string;
  readonly keyA: string;
  readonly keyB: string;
}

export const APPLICATION_KEY_PAIRS: readonly ApplicationKeyPair[] = [
  {
    builds: 'Compact 4.8.1.7, Compact 4.8.1.9, Compact XR 4.8.2.1',
    targets: 'compact_8hz_4_8_1_7, compact_8hz_4_8_1_9, compact_xr_8hz_4_8_2_1',
    keyA: '4631c41e94d0185e83cb72ab0eb772bd',
    keyB: 'e5eeacc992d3c438fe0413b8253c297c',
  },
  {
    builds: 'Compact PRO 4.9.1.15, Compact PRO 4.9.2.0',
    targets: 'compact_pro_9hz_4_9_1_15, compact_pro_9hz_4_9_2_0',
    keyA: '9091a79257d81aa75f7c77bab0aafa02',
    keyB: '95be600d80dc442d7aa00a8a9644bc54',
  },
  {
    builds: 'Compact FF 4.16.1.7',
    targets: 'compact_ff_16hz_4_16_1_7',
    keyA: 'ccd953abd5dab7a9033db899cbaa2065',
    keyB: '3b71c518c7df7588acc020b8b24b9536',
  },
  {
    builds: 'Compact PRO FF 4.18.2.0, Mosaic 10.9.1.31',
    targets: 'compact_pro_ff_18hz_4_18_2_0, mosaic_18hz_10_9_1_31',
    keyA: 'f32ad7719ddd4adaba1ded88065285b3',
    keyB: '997ed6e5e1d88d875f83a2a23c930903',
  },
  {
    builds: 'Mosaic FF 2.27.1.33, Nano 300 44.27.3.10',
    targets: 'mosaic_ff_27hz_2_27_1_33, nano_300_27hz_44_27_3_10',
    keyA: '29f9caca38d0997a6258cfbc5c2d304f',
    keyB: '4257f38adcdeaf35501e2ca9a5ec9d7a',
  },
  {
    builds: 'Nano 200 42.32.3.10',
    targets: 'nano_200_32hz_42_32_3_10',
    keyA: '2913735424d4c2d305aca1b5c3006dc4',
    keyB: '105c44f45cd059b7c530dc9b5c08b213',
  },
];
