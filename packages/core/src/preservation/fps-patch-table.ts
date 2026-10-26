/* ==================================================================== *
 * GENERATED from FW-V1 emu/fps_patch.py (PATCHES, KNOWN_RATE, NOT_PATCHED) by
 * scripts/gen-fps-table.py. Do not edit the entries by hand: change fps_patch.py and run the
 * script again. test/preservation/fps-patch.differential.test.ts checks the result byte for byte
 * against the Python output. Bytes are hex strings here; fps-patch.ts turns them into byte arrays
 * and gates them. Each entry carries its evidence, and each byte edit says what it changes.
 * ==================================================================== */

/** One patch as the Python table writes it (offsets into the DECRYPTED image). */
export interface FpsPatchSource {
  readonly id: string;
  readonly family: string;
  readonly version: string;
  readonly fromHz: number;
  readonly targetHz: number;
  readonly stockSha256: string;
  readonly patchedSha256: string;
  readonly length: number;
  readonly edits: readonly {
    readonly offset: number;
    readonly before: string;
    readonly after: string;
  }[];
  readonly row: { readonly label: string; readonly offset: number; readonly length: number };
  readonly sibling: {
    readonly sha256: string;
    readonly offset: number;
    readonly length: number;
  } | null;
}

export const FPS_PATCH_TABLE: readonly FpsPatchSource[] = [
  {
    // compact_pro-1.0.3.0. 1.0.3.0-FF (18 Hz) row 14 at 0xC2CC is byte-identical to the patched row 14. The
    // FF build also drops the leading step of rows 0-12, 14 and 16 and changes the row-16 flags; those are
    // the boot and shutter rows, not the steady state, and are NOT applied here. Emulator, IP 8 Normal:
    // 8.84 -> 17.68 Hz. Not run on a camera.
    id: 'compact_pro-1.0.3.0',
    family: 'compact_pro',
    version: '1.0.3.0',
    fromHz: 9,
    targetHz: 18,
    stockSha256: '5e1f3f24c8bc1e85bcb67e73e0ee23f301864ee7839a48135598fca961373e26',
    patchedSha256: 'd410b04cdaa10c34db64f5ecdda4afcbee2c4a57b053cb951e060258e2d93461',
    length: 51848,
    edits: [
      // row 14 (the 2016 r2016 table, 68-byte rows) +0 count: 02 -> 01
      { offset: 0xc2bc, before: '02', after: '01' },
      // row 14 +4..+11: step0 00 04 00 20 -> 00 04 10 23 (the armed step moves to slot 0); step1 00 04 10
      // 23 -> 00 00 00 00 (the freed slot zeroed, as the 18 Hz build has it)
      { offset: 0xc2c0, before: '0004002000041023', after: '0004102300000000' },
    ],
    row: {
      label: 'row 14, the steady self-loop (row link ee: next = alt = 14), 68-byte r2016 record',
      offset: 0xc2bc,
      length: 68,
    },
    sibling: {
      sha256: '6f06b3334c0c7243ca09753fda471f660d766db183963cb0ce8d5516bfe89682',
      offset: 0xc2cc,
      length: 68,
    },
  },
  {
    // compact_pro-1.0.3.2. 1.0.3.2-FF (18 Hz) record 20 at 0xC258 is byte-identical to the patched record.
    // The FF build also drops the leading substep of records 8, 9, 12, 14-18 (the same nine records as the
    // 4.9 table, FRAME_RATE.md sec.6.4) and moves a u16 table at 0xBF32; those are not the steady state and
    // are NOT applied here. Emulator, IP 8 Normal: 8.84 -> 17.68 Hz. Not run on a camera.
    id: 'compact_pro-1.0.3.2',
    family: 'compact_pro',
    version: '1.0.3.2',
    fromHz: 9,
    targetHz: 18,
    stockSha256: 'c776924773ed42468957de742284636461e9dafef8d4ab431f5627795b5cfa0c',
    patchedSha256: '68bcc5f989384fac390ebd25dd6c12098780e9e79d24528b294e1c8cc156cb2f',
    length: 51728,
    edits: [
      // record 20 (38-byte records, the 4.9 layout) +0 count: 02 -> 01
      { offset: 0xc258, before: '02', after: '01' },
      // record 20 +6..+9: substeps 00 20 10 23 -> 10 23 00 00 (armed step to slot 0, slot 1 zeroed)
      { offset: 0xc25e, before: '00201023', after: '10230000' },
    ],
    row: {
      label: 'record 20, the steady self-loop (next = alt = 0x14), 38-byte record',
      offset: 0xc258,
      length: 38,
    },
    sibling: {
      sha256: '196560c05096369165c8858f6a3f66239b6651ad73ff84f26a3fccdcf8c193d3',
      offset: 0xc258,
      length: 38,
    },
  },
  {
    // compact_pro-4.9.1.15. FRAME_RATE.md sec.6.3 (experiment A, the only one of the 9 Hz images measured
    // on hardware): 8.85 fps -> 17.70 fps with these three bytes. No same-layout 18 Hz sibling exists;
    // 4.18.2.0-FF uses the 54-byte record. Six bytes differ from the stock image: the three edited bytes
    // (+0x19B0, +0x19B6, +0x19B7) and the acceptance-sum adjust word at +0x238, +0x23A and +0x23B.
    // Emulator, IP 8 Normal: 8.84 -> 17.68 Hz.
    id: 'compact_pro-4.9.1.15',
    family: 'compact_pro',
    version: '4.9.1.15',
    fromHz: 9,
    targetHz: 18,
    stockSha256: '13db63815bce911fb9388277cc6a177498df1023e9713994dd116e6eef6f84bb',
    patchedSha256: '75405c18271faadc8f08c4d713d5c962ec2159cfec7329046574507584943bc8',
    length: 54840,
    edits: [
      // g_hw_profile_records[20] @0x100019B0 (the documented edit, FRAME_RATE.md sec.6.3 experiment A):
      // n_substeps 02 -> 01
      { offset: 0x19b0, before: '02', after: '01' },
      // substep 0: 00 20 -> 10 23 (the armed substep, moved to slot 0). Slot 1 (10 23) is left in place:
      // n_substeps = 1 never reads it. Measured 17.70 fps on hardware (FRAME_RATE.md sec.6.3).
      { offset: 0x19b6, before: '0020', after: '1023' },
    ],
    row: {
      label: 'record 20, the steady self-loop (next = alt = 0x14), 38-byte record, 4.9.1.15 table',
      offset: 0x19b0,
      length: 38,
    },
    sibling: null,
  },
  {
    // compact_pro-4.9.2.0. 4.18.2.0-FF (18 Hz) row 20 at 0xA660 is byte-identical to the patched row 20 (54
    // bytes). The stock 4.9.2.0 row is that 18 Hz row with one leading no-op substep (00 00 01, a whole
    // frame of no work) in front of its armed substep. The same shape is what FRAME_RATE.md sec.6.3
    // experiment B built from the 18 Hz image. Emulator, IP 8 Normal: 8.84 -> 17.68 Hz. Not measured on
    // hardware.
    id: 'compact_pro-4.9.2.0',
    family: 'compact_pro',
    version: '4.9.2.0',
    fromHz: 9,
    targetHz: 18,
    stockSha256: 'b8d069f1cedfea80b0f15448a84d148ddc63aba0f0b2c77e10f9a79a7b5d8c0e',
    patchedSha256: '4dcf0442478b9eb9f708f6ed08697f78ce1c3d13f2e6acadb527f5c330b8c00b',
    length: 44760,
    edits: [
      // row 20 (54-byte telemetry rows, the 4.18 layout) @0x1000A634: count 02 -> 01
      { offset: 0xa634, before: '02', after: '01' },
      // substeps: 00 00 01 | 20 03 01 -> 20 03 01 | 00 00 00 (armed substep to slot 0, slot 1 zeroed)
      { offset: 0xa63a, before: '000001200301', after: '200301000000' },
    ],
    row: {
      label: 'row 20, the steady self-loop (next = alt = 0x14), 54-byte telemetry row',
      offset: 0xa634,
      length: 54,
    },
    sibling: {
      sha256: '48f0ebfd3f55d1dc4aee16f693eedd11c2d5cbbe88f4ca200a90c8ea1b19e735',
      offset: 0xa660,
      length: 54,
    },
  },
  {
    // compact_32k-1.3.0.8-to32. 32 Hz, one capture per published frame, in the Normal stream (mode 8; mode
    // 9 runs the same program). Stock block 13 is seed (op 5, sel 3), accumulate (op 6, sel 3) twice, mean
    // of three (op 7, sel 3), then the fill (op 8, sel 1, delivery). The one step is op 3 with the delivery
    // bit, a plain copy of the capture (frame_line_op_3, image.c:1111) on the seeds' selection 0x13, so
    // every capture runs the sensor mode the stock average runs (CMD mode 3, app_init.c:1547-1557). The
    // earlier one-step op 5 form (13 25 23) wrote 0xFFFF over every sample above 15000 (frame_line_op_5,
    // image.c:1149): 33 % dead pixels in the emulator's bright scene, and the 26 fps of TESTING.md 42.20
    // (not reproduced on the same unit in 42.27). Camera (owner's PIR206, bank B, 2026-10-19): Normal 32.16
    // to 32.20 fps (5 s medians; stock 8.04 to 8.05), 0 frozen pairs, level 5,760 against stock 5,739
    // (means of frames). The terminator selection 0x11 saturated the camera picture (67 % of samples at or
    // above 15000) and was rejected. Emulator, IP 8: 8.065 -> 32.258 Hz, level 6,801 -> 6,797. OPEN: a long
    // stream may leave 32 Hz (docs/FPS_PATCH_LONG_STREAM.md). NO-SKIP (TESTING.md 42.97): the entry also
    // carries the no-skip branch (the last edit, image +0x626c), so one press writes the 32 Hz image with
    // the USB fix, 18972f32. The image this entry wrote before (32 Hz only, 5313f107) is recognised as an
    // earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then
    // patch. Emulator (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image
    // skips about 110 of 120 field starts at 0.5, 2 and 5 ms late; this image skips none and tears none
    // there, and tears only with a chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-1.3.0.8-to32',
    family: 'compact_32k',
    version: '1.3.0.8',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2969d0df5bfeac74b88e6ee608ee8b2657fecf2e0234e9ce2731add2408f3d1c',
    patchedSha256: '18972f321f6df59b5ad22e85057ec40099738420160aec896906eec898895def',
    length: 49128,
    edits: [
      // block 13 header count 04 -> 01: the self-loop block runs one step instead of four, so every capture
      // is published
      { offset: 0xb750, before: '04', after: '01' },
      // its steps (3 bytes each: source selection, op, header): the four stock steps 13 05 20 | 13 06 20 |
      // 13 07 20 | 11 28 23 become one step 13 23 23 and zeros. 13 is the stock seeds' selection
      // (line-sourced, CMD mode 3, the mode of the captures the stock average is made of). 23 is op 3 with
      // the delivery bit 0x20: frame_line_op_3 (image.c:1111) is a plain copy of the line, with no read of
      // the destination and no rescale. Header 23 (type 3, gpio 1) is stock.
      { offset: 0xb754, before: '130520130620130720112823', after: '132323000000000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:1713: it logs "USB TX not complete - Skipping field",
      // sets the skip flag (_10) and clears FLAG_D). On a slow host (an Android phone reads that chunk
      // about 1 ms late) every other field is lost. The `cbz r0` over that block (20 b3) becomes `b.n` (24
      // e0) to the same target, image +0x62b8, the path an idle endpoint always takes, so no field is
      // skipped. A frame still starts only with the IN queue empty (:479), so the queue cannot overflow.
      { offset: 0x626c, before: '20b3', after: '24e0' },
    ],
    row: {
      label:
        'mode-8 capture program, block 13 (header 04 0d 0d 00), reduced to one step: a plain copy with the delivery bit (op 3)',
      offset: 0xb750,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.1.7-to32. 32 Hz, one capture per published frame, Normal stream (mode 8; mode 9 runs
    // the same program). Stock block 13 is seed (op 5, sel 1), accumulate (op 6, sel 1) twice, mean of
    // three (op 7, sel 1), then the fill (op 8, sel 0, delivery). The one step is op 1 with the delivery
    // bit, frame_chunk_copy (frame_chunk_ops_target.c:669), a plain copy of the chunk on the seeds'
    // selection 0x11. The earlier one-step op 5 form (11 25 23) wrote 0xFFFF over every sample above 15000
    // (frame_chunk_seed, frame_chunk_ops_target.c:171). The terminator selection 0x10 froze the picture in
    // the emulator, so it is not used. Emulator, IP 8 Normal: 8.065 -> 32.258 Hz, level 6,797 -> 6,792, 0
    // frozen pairs; IP 9 the same rate. Not measured on a camera. OPEN: a long stream may leave 32 Hz
    // (docs/FPS_PATCH_LONG_STREAM.md). NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip
    // branch (the last edit, image +0x3056), so one press writes the 32 Hz image with the USB fix,
    // 9b24dbc2. The image this entry wrote before (32 Hz only, 51c6f0d5) is recognised as an earlier patch
    // (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator
    // (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of
    // 120 field starts at 0.5, 2 and 5 ms late; this image skips none and tears none there, and tears only
    // with a chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-4.8.1.7-to32',
    family: 'compact_32k',
    version: '4.8.1.7',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '04d9e1559d63463cf6c0c29ddc21f64af093bc3fe4d4e769ba41d4d8b0798419',
    patchedSha256: '9b24dbc2ef87d41fb42d9a03a151babdfd714f28b936f7230b8664a6d0c335d6',
    length: 49888,
    edits: [
      // block 13 header count 04 -> 01: the self-loop block runs one step instead of four, so every capture
      // is published
      { offset: 0x976e, before: '04', after: '01' },
      // its steps (3 bytes each: source selection, op, header): the four stock steps 11 05 20 | 11 06 20 |
      // 11 07 20 | 10 28 23 become one step 11 21 23 and zeros. 11 is the stock seeds' selection
      // (line-sourced, sel 1: the CMD mode the stock seeds run in, frame_step_gpio_apply). 21 is op 1 with
      // the delivery bit 0x20: frame_chunk_copy (frame_chunk_ops_target.c:669) is the plain copy of the
      // chunk (mem_copy_flashaware, no read of the destination, no rescale). Header 23 is stock.
      { offset: 0x9772, before: '110520110620110720102823', after: '112123000000000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (isr.c:1911-1950: it logs "USB TX not complete - Skipping field",
      // sets the skip flag, clears FLAG_D and sets frame_tx_flag (read only by frame_step_gpio_apply, to
      // re-align the sensor GPIO after a skipped field)). On a slow host (an Android phone reads that chunk
      // about 1 ms late) every other field is lost. The `cbz r0` over that block (40 b3) becomes `b.n` (28
      // e0) to the same target, image +0x30aa, the path an idle endpoint always takes, so no field is
      // skipped. A frame still starts only with the IN queue empty (capture_engine_target.c:721), so the
      // queue cannot overflow.
      { offset: 0x3056, before: '40b3', after: '28e0' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00), reduced to one step: a plain copy with the delivery bit (op 1)',
      offset: 0x976e,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.1.9-to32. 32 Hz, one capture per published frame, Normal stream (mode 8; mode 9 runs
    // the same program). The block is the 4.8.1.7 block (the same bytes and handler table), so the step is
    // the same op 1 copy on selection 0x11; the 4.8.1.7 entry gives the op semantics and the rejected
    // selection. Emulator, IP 8 Normal: 8.065 -> 32.258 Hz, 0 frozen pairs; IP 9 the same rate. Not
    // measured on a camera. OPEN: a long stream may leave 32 Hz (docs/FPS_PATCH_LONG_STREAM.md). NO-SKIP
    // (TESTING.md 42.97): the entry also carries the no-skip branch (the last edit, image +0x304a), so one
    // press writes the 32 Hz image with the USB fix, 30f65476. The image this entry wrote before (32 Hz
    // only, 14e25960) is recognised as an earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched
    // again: restore the stock image, then patch. Emulator (FW-V1 noskip study, the last chunk of each
    // frame read late): the 32 Hz-only image skips about 110 of 120 field starts at 2 ms late; this image
    // skips none and tears none there, and tears only with a chunk held 30 ms. The branch has not been run
    // on a camera of this build.
    id: 'compact_32k-4.8.1.9-to32',
    family: 'compact_32k',
    version: '4.8.1.9',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2c5eedec97ba168b5defba3b5065c0d50e058102725c577a33ff29d270c3cdd5',
    patchedSha256: '30f65476179393d9fba001aed0b1e38961b1f5d03441dfe8840942f27e107cb7',
    length: 48800,
    edits: [
      // block 13 header count 04 -> 01: one step instead of four, every capture is published (as the
      // 4.8.1.7 patch)
      { offset: 0x95a6, before: '04', after: '01' },
      // its steps (3 bytes each): the four stock steps 11 05 20 | 11 06 20 | 11 07 20 | 10 28 23 become one
      // step 11 21 23 and zeros, the same bytes as the 4.8.1.7 patch: 11 is the seeds' selection, 21 is op
      // 1 (frame_chunk_copy) with the delivery bit, 23 the stock header (type 3, gpio 1)
      { offset: 0x95aa, before: '110520110620110720102823', after: '112123000000000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (the 4.8.1.7 block: it logs "USB TX not complete - Skipping field",
      // sets the skip flag, clears FLAG_D and sets frame_tx_flag (read only by frame_step_gpio_apply)). On
      // a slow host (an Android phone reads that chunk about 1 ms late) every other field is lost. The `cbz
      // r0` over that block (40 b3) becomes `b.n` (28 e0) to the same target, image +0x309e, the path an
      // idle endpoint always takes, so no field is skipped. A frame still starts only with the IN queue
      // empty (capture_engine_target.c:724), so the queue cannot overflow.
      { offset: 0x304a, before: '40b3', after: '28e0' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00), reduced to one step: a plain copy with the delivery bit (op 1)',
      offset: 0x95a6,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-1.3.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Stock block 8 is the four-step sequence op 5 (seed, x4 above the level), op 6, op 6
    // (accumulate), op 7 (mean of four, push, header id 3, gpio 1). The one step is op 3 (a plain copy of
    // the line, no read of the destination) with the delivery bit, header id 3 and gpio 1 as stock, so the
    // samples keep their scale. Camera (owner's PIR206, serial 1013CE098ACA, bank A, boot word 0,
    // 2026-10-19): Normal medians 31.1 to 32.3 fps (most 32.2), 0 frozen pairs, about 94 % of pixels change
    // per frame; Hi FPS (IP 3, stock one capture per frame) about 32 fps. The stock 1.3.0.0 picture was not
    // measured on the camera. Emulator, IP 8: 8.065 -> 32.258 Hz, level 6,798 -> 6,797. The unit first
    // carried the withdrawn mode-6 16 Hz edit as well (image d91284c6, KNOWN_RATE); that edit takes no part
    // in the Normal or Hi FPS streams. NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip
    // branch (the last edit, image +0x6190), so one press writes the 32 Hz image with the USB fix,
    // edeabb71. The image this entry wrote before (32 Hz only, ef90c94a) is recognised as an earlier patch
    // (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator
    // (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of
    // 120 field starts at 0.5, 2 and 5 ms late; this image skips none and tears none there, and tears only
    // with a chunk held 30 ms. Camera: the bench Compact 101310HSNEA2 runs this image in banks A, B and R
    // (TESTING.md 42.93); a Redmi 4X went from 84 to 88 % of frames skipped to 32/33 fps, a Pixel 8 Pro is
    // unchanged in normal use.
    id: 'compact_32k-1.3.0.0-to32',
    family: 'compact_32k',
    version: '1.3.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '862717a8a605021def7858ac0c04ad4aa1abe23d357d6c2417699939137f481c',
    patchedSha256: 'edeabb713319472f7ec8bc9fc43aa911f3395afeeeb04ddd2c890371ca583c02',
    length: 47768,
    edits: [
      // mode-8 capture program (the processed "normal" stream), block 8 @ +0xB898, the steady self-loop
      // (first = next = 8, header id 3, gpio 1): header 84 08 (count 4) -> 81 08 (count 1)
      { offset: 0xb898, before: '84', after: '81' },
      // its steps @ +0xB89A..+0xB8A1: op 5 (seed) | op 6 | op 6 | op 7 (mean of four, push, hdr 3) 59 20 |
      // 69 20 | 69 20 | 79 27 -> op 3 (copy) with push, hdr 3, gpio 1: 39 27 | 00 x6
      { offset: 0xb89a, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:952: it logs "USB TX not complete - Skipping field",
      // sets the skip flag (_10) and clears FLAG_D). On a slow host (an Android phone reads that chunk
      // about 1 ms late) every other field is lost. The `cbz r0` over that block (18 b3) becomes `b.n` (23
      // e0) to the same target, image +0x61da, the path an idle endpoint always takes, so no field is
      // skipped. A frame still starts only with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x6190, before: '18b3', after: '23e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 8 (the steady self-loop, 34-byte blocks); one copy with the delivery bit per capture',
      offset: 0xb898,
      length: 34,
    },
    sibling: null,
  },
  {
    // compact_32k-0.7.0.8-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks with 3-bit header fields (style a). Block 4 is the steady self-loop
    // (first = next = 4): four steps, table indices 4, 5, 5, 6, publish on the fourth. The table has no
    // frame_line_op_2 (frame_data.c:52-54), so index 2 is frame_line_op_3 (image.c:307), the gain-table
    // remap of one capture, the transform the stock Hi FPS block applies. The plain word copy (index 1,
    // image 8b0f4781) and the op-5 copy (index 4, image 0a43308c) were both about 12 % brighter than stock
    // with about five times the spread on the camera, so they were rejected. Camera (owner's PIR206, bank
    // B, 2026-10-19, P3): Normal 32.18 to 32.21 fps (5 s medians; stock 8.05), 0 frozen pairs, level 5,693
    // against stock 5,716 (same session), std 33.5 against 34.3. Emulator, IP 8: 8.065 -> 32.258 Hz, level
    // 6,008 -> 6,005. Slots refuse firmware older than 0.8.0.0, so the page does not offer it; flashing it
    // needs the J-Link. NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the last
    // edit, image +0x5f98), so one press writes the 32 Hz image with the USB fix, f08d84bd. The image this
    // entry wrote before (32 Hz only, c5194276) is recognised as an earlier patch (KNOWN_RATE,
    // EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator (FW-V1
    // noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of 120
    // field starts at 2 ms late; this image skips none and tears none there, and tears only with a chunk
    // held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-0.7.0.8-to32',
    family: 'compact_32k',
    version: '0.7.0.8',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '6bac46abf3023d02cf0ba8a43bfbebdd7a85c77ffbedbab08d53e2f297a3e1ea',
    patchedSha256: 'f08d84bdda1f7036468da6d45ebcd475fe085646df19d2b8f9e1e118001c35b9',
    length: 46616,
    edits: [
      // block 4 of the mode-8 program (14-byte blocks with 3-bit header fields; the self-loop at image
      // +0xB514, first = next = 4, publish on its fourth step), header byte 0 (count | first << 3): 24 ->
      // 21, count 4 -> 1, first 4 kept, so the block runs one step and every capture is published.
      { offset: 0xb514, before: '24', after: '21' },
      // its four steps at +0xB516 (2 bytes each, style a: sel (2 bits) | active << 2 | op << 3 | push << 7,
      // then hdr | gpio << 4). The stock steps are table indices 4, 5, 5, 6 (frame_line_op_5, _6, _6, _7;
      // the table has no frame_line_op_2, frame_data.c:52-54): 25 10 2d 10 2d 10 b5 13. They become one
      // step, table index 2 = frame_line_op_3 (image.c:307), the gain-table remap of one capture, with sel
      // 1 and active as stock, the publish bit, header id 3 and gpio 1: 95 13. The stock steps after it are
      // zeroed (00 x 6).
      { offset: 0xb516, before: '25102d102d10b513', after: '9513000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:963: a silent skip: no log; it sets the skip flag
      // (session +0x15) and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms
      // late) every other field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the
      // same target, image +0x5fc6, the path an idle endpoint always takes, so no field is skipped. A frame
      // still starts only with the IN queue empty (:500), so the queue cannot overflow.
      { offset: 0x5f98, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 4 (14-byte blocks, the steady self-loop), reduced to one step: frame_line_op_3 (the gain-table remap of one capture) with the publish bit',
      offset: 0xb514,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.8.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks with the 1.3.0.0 step bits (style b). Block 6 is the steady self-loop
    // (first = next = 6): four steps op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with
    // the publish bit (frame_line_op_3, image.c:343: a row copy, no read of the destination, no scale),
    // header id 3, gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B, E1): Normal 32.16 to 32.20 fps
    // (stock 8.04 to 8.05), 0 frozen pairs, level 5,829 against stock 5,814. Emulator, IP 8: 8.065 ->
    // 32.258 Hz. NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the last edit,
    // image +0x6110), so one press writes the 32 Hz image with the USB fix, e6da3523. The image this entry
    // wrote before (32 Hz only, 9b2c6f89) is recognised as an earlier patch (KNOWN_RATE, EARLIER_PATCHES)
    // and is not patched again: restore the stock image, then patch. Emulator (FW-V1 noskip study, the last
    // chunk of each frame read late): the 32 Hz-only image skips about 110 of 120 field starts at 2 ms
    // late; this image skips none and tears none there, and tears only with a chunk held 30 ms. The branch
    // has not been run on a camera of this build.
    id: 'compact_32k-0.8.0.0-to32',
    family: 'compact_32k',
    version: '0.8.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '9f5d9006f8bce9539e3f913ab5aad55e7ca6bc84e55839d1fe8d48c1c7463836',
    patchedSha256: 'e6da35233e005a159c238965f4d679b30130bb4828d2f7e6162924fc3a36d74d',
    length: 47188,
    edits: [
      // block 6 of the mode-8 program (14-byte blocks; the self-loop at image +0xb744), header byte 0
      // (count | first << 4): 64 -> 61, count 4 -> 1 with first 6 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb744, before: '64', after: '61' },
      // its four steps at image +0xb746 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb746, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x613e, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x6110, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 6 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb744,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.9.0.2-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four steps
    // op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit
    // (frame_line_op_3, a row copy with no scale), header id 3, gpio 1, sel 1 as stock. Camera (owner's
    // PIR206, bank B, E1): Normal 32.16 to 32.21 fps (stock 7.96 to 8.05), 0 frozen pairs, level 5,835
    // against stock 5,836. Emulator, IP 8: 8.065 -> 32.258 Hz. NO-SKIP (TESTING.md 42.97): the entry also
    // carries the no-skip branch (the last edit, image +0x619c), so one press writes the 32 Hz image with
    // the USB fix, 4dfcdcd2. The image this entry wrote before (32 Hz only, e41610e3) is recognised as an
    // earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then
    // patch. Emulator (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image
    // skips about 110 of 120 field starts at 0.5, 2 and 5 ms late; this image skips none and tears none
    // there, and tears only with a chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-0.9.0.2-to32',
    family: 'compact_32k',
    version: '0.9.0.2',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '3c597b72f5f4081d5f76e9348cc0d6a1d46a13453a2ca9c5005b117930df57d8',
    patchedSha256: '4dfcdcd295e54fd5772e7f57c306e349d97be4d124ab14a4ff7859af5b601287',
    length: 47368,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb7f6), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb7f6, before: '74', after: '71' },
      // its four steps at image +0xb7f8 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb7f8, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61ca, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x619c, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb7f6,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.9.0.6-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four steps
    // op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit, header id 3,
    // gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B, E1): Normal 32.10 to 32.20 fps (stock 8.04 to
    // 8.05), 0 frozen pairs, level 4,868 against stock 4,848 (a darker, noisier build). Emulator, IP 8:
    // 8.065 -> 32.258 Hz. NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the last
    // edit, image +0x619c), so one press writes the 32 Hz image with the USB fix, 9727a08c. The image this
    // entry wrote before (32 Hz only, 54d383ad) is recognised as an earlier patch (KNOWN_RATE,
    // EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator (FW-V1
    // noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of 120
    // field starts at 2 ms late; this image skips none and tears none there, and tears only with a chunk
    // held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-0.9.0.6-to32',
    family: 'compact_32k',
    version: '0.9.0.6',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'c07c3c3f913415bbfe3aed926a8fda94dd91ea2b8fbb023a02c1b958d26abdab',
    patchedSha256: '9727a08c08450908bc57831f55b22df4b88254ae2a6b918d61580749d8d35f9c',
    length: 47156,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb712), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb712, before: '74', after: '71' },
      // its four steps at image +0xb714 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb714, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61ca, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x619c, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb712,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.9.0.7-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four steps
    // op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit, header id 3,
    // gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B, E1): Normal medians 30.73 to 32.19 fps, the
    // first seconds low (stock 7.19 to 8.09), 0 frozen pairs, level 5,833 against stock 5,826. Emulator, IP
    // 8: 8.065 -> 32.258 Hz. NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the
    // last edit, image +0x6184), so one press writes the 32 Hz image with the USB fix, 71fe108e. The image
    // this entry wrote before (32 Hz only, 1ad41e1e) is recognised as an earlier patch (KNOWN_RATE,
    // EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator (FW-V1
    // noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of 120
    // field starts at 2 ms late; this image skips none and tears none there, and tears only with a chunk
    // held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-0.9.0.7-to32',
    family: 'compact_32k',
    version: '0.9.0.7',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'f3ecc810260a1ddf96e25bf9f9d0c405d8bce9975ef47497f6f2e7c4da020182',
    patchedSha256: '71fe108e2edfdc9bce2cc5e2511619590e954c1a8882a7f350a1499402b3ddbb',
    length: 47352,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb7e6), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb7e6, before: '74', after: '71' },
      // its four steps at image +0xb7e8 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb7e8, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61b2, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x6184, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb7e6,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.9.1.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four steps
    // op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit, header id 3,
    // gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B): the first run gave 27.8 to 30.8 fps and was
    // not reproduced; four reruns gave 32.16 to 32.23 fps (stock 8.04 to 8.05); 0 frozen pairs; level 5,842
    // against stock 5,847. Emulator, IP 8: 8.065 -> 32.258 Hz. NO-SKIP (TESTING.md 42.97): the entry also
    // carries the no-skip branch (the last edit, image +0x619c), so one press writes the 32 Hz image with
    // the USB fix, f1f9057f. The image this entry wrote before (32 Hz only, 1814e5ac) is recognised as an
    // earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then
    // patch. Emulator (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image
    // skips about 110 of 120 field starts at 2 ms late; this image skips none and tears none there, and
    // tears only with a chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-0.9.1.0-to32',
    family: 'compact_32k',
    version: '0.9.1.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'f0ff04d53111b858c17affefd64dee2fa12d3320f14b6ca3260581f49917a62d',
    patchedSha256: 'f1f9057fc00c4a0436a86b49e4738dec7ef381a05b565df38528ff8af302974e',
    length: 47368,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb7f6), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb7f6, before: '74', after: '71' },
      // its four steps at image +0xb7f8 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb7f8, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61ca, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x619c, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb7f6,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-0.10.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame,
    // no mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four
    // steps op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit, header
    // id 3, gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B, E1): Normal 32.17 to 32.24 fps (stock
    // 7.87 to 8.05), 0 frozen pairs, level 5,838 against stock 5,847. Hi FPS (IP 3, the edit is in the
    // Normal program only) mean 23.4 against stock 27.4, not explained. Emulator, IP 8: 8.065 -> 32.258 Hz.
    // NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the last edit, image +0x619c),
    // so one press writes the 32 Hz image with the USB fix, 28371ca7. The image this entry wrote before (32
    // Hz only, efd72e1c) is recognised as an earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched
    // again: restore the stock image, then patch. Emulator (FW-V1 noskip study, the last chunk of each
    // frame read late): the 32 Hz-only image skips about 110 of 120 field starts at 2 ms late; this image
    // skips none and tears none there, and tears only with a chunk held 30 ms. The branch has not been run
    // on a camera of this build.
    id: 'compact_32k-0.10.0.0-to32',
    family: 'compact_32k',
    version: '0.10.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '68b314052b80d40f0b28dd8c91f3530a9c1bdba5585f4f2c02b4fe98ba69d988',
    patchedSha256: '28371ca792c54a80076da0bb2c600d9beb8483db05a017547bc31e0e81d4e57c',
    length: 47368,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb7f6), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb7f6, before: '74', after: '71' },
      // its four steps at image +0xb7f8 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb7f8, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61ca, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x619c, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb7f6,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-1.0.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 14-byte blocks, style b. Block 7 is the steady self-loop (first = next = 7): four steps
    // op 5, op 6, op 6, op 7 with the publish bit become one copy, op 3 with the publish bit, header id 3,
    // gpio 1, sel 1 as stock. Camera (owner's PIR206, bank B, E1): Normal 31.3 to 32.2 fps (stock 7.9 to
    // 8.1), 0 frozen pairs, level 5,835 against stock 5,866. Emulator, IP 8: 8.065 -> 32.258 Hz. NO-SKIP
    // (TESTING.md 42.97): the entry also carries the no-skip branch (the last edit, image +0x6184), so one
    // press writes the 32 Hz image with the USB fix, a184dbab. The image this entry wrote before (32 Hz
    // only, d55ccb47) is recognised as an earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched
    // again: restore the stock image, then patch. Emulator (FW-V1 noskip study, the last chunk of each
    // frame read late): the 32 Hz-only image skips about 110 of 120 field starts at 0.5, 2 and 5 ms late;
    // this image skips none and tears none there, and tears only with a chunk held 30 ms. The branch has
    // not been run on a camera of this build.
    id: 'compact_32k-1.0.0.0-to32',
    family: 'compact_32k',
    version: '1.0.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '30f8737b511dcc4ae8aa950615c88d70b4625ee0b704cf22f2de4e651bd97fe3',
    patchedSha256: 'a184dbabcf92a74f57e1cbf57ef7b1b0963ea19f7c6b8229a7b9126096d4becd',
    length: 47352,
    edits: [
      // block 7 of the mode-8 program (14-byte blocks; the self-loop at image +0xb7e6), header byte 0
      // (count | first << 4): 74 -> 71, count 4 -> 1 with first 7 kept, so the block runs one step and
      // every capture is published.
      { offset: 0xb7e6, before: '74', after: '71' },
      // its four steps at image +0xb7e8 (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 |
      // gpio << 5): op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one
      // copy, op 3 with the publish bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27), a
      // plain copy so the scale is the stock scale; the stock steps after it are zeroed (00 x 6), as the
      // 1.3.0.0 entry does.
      { offset: 0xb7e8, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:951: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61b2, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x6184, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 7 (14-byte blocks, the steady self-loop), reduced to one step: a plain copy with the publish bit',
      offset: 0xb7e6,
      length: 14,
    },
    sibling: null,
  },
  {
    // compact_32k-1.2.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Layout: 34-byte blocks, the 1.3.0.0 layout. Block 8 is the steady self-loop (first = next = 8):
    // four steps op 5, op 6, op 6, op 7 with the publish bit become one copy, operator 3 (frame_line_op_3,
    // image.c:350: a row copy, no scale) with the publish bit, header id 3, gpio 1, sel 1 as stock. Camera
    // (owner's PIR206, bank B, E1): Normal 32.18 to 32.20 fps (stock 7.81 to 8.19), 0 frozen pairs, level
    // 5,809 against stock 5,817. Emulator, IP 8: 8.065 -> 32.258 Hz. The 16 Hz patch of this build was
    // removed (TESTING.md 42.26). NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch
    // (the last edit, image +0x6180), so one press writes the 32 Hz image with the USB fix, 785a9f14. The
    // image this entry wrote before (32 Hz only, 547d0e85) is recognised as an earlier patch (KNOWN_RATE,
    // EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator (FW-V1
    // noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of 120
    // field starts at 0.5, 2 and 5 ms late; this image skips none and tears none there, and tears only with
    // a chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-1.2.0.0-to32',
    family: 'compact_32k',
    version: '1.2.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '38a9036ae44b9fcaca31a7432257f4aa2cf71d7715a964f1c4b9553dfabfea01',
    patchedSha256: '785a9f147025ee655550c2f50bb679b27da8d3ec7bb499a7413ec68f245de3c1',
    length: 47768,
    edits: [
      // block 8 of the mode-8 program (34-byte blocks; the self-loop at image +0xB898, first = next = 8;
      // the mode-8 record in this image is (0x10001F90, 11) at file 0xB780, so the array is at file 0xB788
      // under C = 0x0FFF6808), header byte 0 (count | first << 4): 84 -> 81, count 4 -> 1, first 8 kept, so
      // the block runs one step.
      { offset: 0xb898, before: '84', after: '81' },
      // its steps at +0xB89A (2 bytes each: sel | active << 3 | op << 4, then push | hdr << 1 | gpio << 5):
      // op 5 | op 6 | op 6 | op 7 with the publish bit (59 20 69 20 69 20 79 27) become one copy, operator
      // 3 (frame_line_op_3, image.c:350: a row copy, no read of the destination, no scale) with the publish
      // bit, header id 3, gpio 1 and sel 1 as the stock publish step (39 27); the stock steps after it are
      // zeroed (00 x 6), the 1.3.0.0 edit.
      { offset: 0xb89a, before: '5920692069207927', after: '3927000000000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:962: a silent skip: no log; it sets the skip flag (_10)
      // and clears FLAG_D). On a slow host (an Android phone reads that chunk about 1 ms late) every other
      // field is lost. The `cbz r0` over that block (a8 b1) becomes `b.n` (15 e0) to the same target, image
      // +0x61ae, the path an idle endpoint always takes, so no field is skipped. A frame still starts only
      // with the IN queue empty (:482), so the queue cannot overflow.
      { offset: 0x6180, before: 'a8b1', after: '15e0' },
    ],
    row: {
      label:
        'mode-8 capture program block 8 (the steady self-loop, 34-byte blocks); one copy with the delivery bit per capture',
      offset: 0xb898,
      length: 34,
    },
    sibling: null,
  },
  {
    // compact_32k-1.3.0.8-FF-to32. 32 Hz from the FF build, one capture per published frame: the one step
    // is a copy of the seeds (op 3 with the delivery bit, selection 0x13), the same form as the 8 Hz
    // 1.3.0.8 entry. The earlier op 5 form (13 25 23) wrote 0xFFFF over every sample above 15000
    // (frame_line_op_5, image.c:1149) and was replaced. Emulator, IP 8 Normal: 16.129 -> 32.258 Hz, picture
    // level the same as stock (about 6,790 to 6,800). IP 9 the same. Not measured on a camera; not offered
    // (FF stage two). NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip branch (the last edit,
    // image +0x6484), so one press writes the 32 Hz image with the USB fix, 1be28033. The image this entry
    // wrote before (32 Hz only, bf99816f) is recognised as an earlier patch (KNOWN_RATE, EARLIER_PATCHES)
    // and is not patched again: restore the stock image, then patch. Emulator (FW-V1 noskip study, the last
    // chunk of each frame read late): the 32 Hz-only image skips about 110 of 120 field starts at 0.5, 2
    // and 5 ms late; this image skips none and tears none there, and tears only with a chunk held 30 ms.
    // The branch has not been run on a camera of this build.
    id: 'compact_32k-1.3.0.8-FF-to32',
    family: 'compact_32k',
    version: '1.3.0.8-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16',
    patchedSha256: '1be28033401381b28015c163f7fff99b556e67bdae3214be4fb8ed62831c972b',
    length: 49308,
    edits: [
      // the 16 Hz FF block 13 @ image +0xB804 (header 02 0d 0d 00, 2 steps): count 02 -> 01
      { offset: 0xb804, before: '02', after: '01' },
      // its steps @ +0xB808..+0xB80D: 13 05 20 | 11 28 23 -> 13 23 23 | 00 00 00. 13 is the FF seeds'
      // selection (the seed's CMD mode 3); 23 is op 3 with the delivery bit, frame_line_op_3
      // (image.c:1111), a plain copy of the line (the FF build's op 8 fill goes); header 23 (type 3, gpio
      // 1) is stock.
      { offset: 0xb808, before: '130520112823', after: '132323000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (app_init.c:1743: it logs "USB TX not complete - Skipping field",
      // sets the skip flag (_10) and clears FLAG_D). On a slow host (an Android phone reads that chunk
      // about 1 ms late) every other field is lost. The `cbz r0` over that block (20 b3) becomes `b.n` (24
      // e0) to the same target, image +0x64d0, the path an idle endpoint always takes, so no field is
      // skipped. A frame still starts only with the IN queue empty (:503), so the queue cannot overflow.
      { offset: 0x6484, before: '20b3', after: '24e0' },
    ],
    row: {
      label:
        '16 Hz FF block 13 (header 02 0d 0d 00, 2 steps), reduced to one step: a plain copy with the delivery bit (op 3)',
      offset: 0xb804,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.16.1.7-FF-to32. 32 Hz from the FF build, one capture per published frame: the one step
    // is op 1 with the delivery bit on selection 0x11, the same form as 4.8.1.7 (frame_chunk_copy,
    // frame_chunk_ops_target.c:669). The earlier op 5 form (11 25 23) wrote 0xFFFF over samples above 15000
    // (frame_chunk_seed, frame_chunk_ops_target.c:171) and was replaced. Emulator, IP 8 Normal: 16.129 ->
    // 32.258 Hz, picture level the same as stock (about 6,790 to 6,800). IP 9 the same. Not measured on a
    // camera; not offered (FF stage two). NO-SKIP (TESTING.md 42.97): the entry also carries the no-skip
    // branch (the last edit, image +0x305a), so one press writes the 32 Hz image with the USB fix,
    // 44f3245a. The image this entry wrote before (32 Hz only, aec53641) is recognised as an earlier patch
    // (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image, then patch. Emulator
    // (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only image skips about 110 of
    // 120 field starts at 2 ms late; this image skips none and tears none there, and tears only with a
    // chunk held 30 ms. The branch has not been run on a camera of this build.
    id: 'compact_32k-4.16.1.7-FF-to32',
    family: 'compact_32k',
    version: '4.16.1.7-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1',
    patchedSha256: '44f3245a1c7b6d35b273929947ce4400560afb99d7606b9ca0d7baed3da3f8c6',
    length: 49896,
    edits: [
      // the 16 Hz FF block 13 @ image +0x9776 (header 02 0d 0d 00, 2 steps): count 02 -> 01
      { offset: 0x9776, before: '02', after: '01' },
      // its steps @ +0x977A..+0x977F: 11 05 20 | 10 28 23 -> 11 21 23 | 00 00 00. 11 is the FF seeds'
      // selection (sel 1); 21 is op 1 with the delivery bit, frame_chunk_copy
      // (frame_chunk_ops_target.c:669), the plain copy of the chunk; header 23 (type 3, gpio 1) is stock.
      { offset: 0x977a, before: '110520102823', after: '112123000000' },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (the 4.8.1.7 block: it logs "USB TX not complete - Skipping field",
      // sets the skip flag, clears FLAG_D and sets frame_tx_flag (read only by frame_step_gpio_apply)). On
      // a slow host (an Android phone reads that chunk about 1 ms late) every other field is lost. The `cbz
      // r0` over that block (40 b3) becomes `b.n` (28 e0) to the same target, image +0x30ae, the path an
      // idle endpoint always takes, so no field is skipped. A frame still starts only with the IN queue
      // empty (capture_engine_target.c:721), so the queue cannot overflow.
      { offset: 0x305a, before: '40b3', after: '28e0' },
    ],
    row: {
      label:
        '16 Hz FF block 13 of the 4.16 program (header 02 0d 0d 00, 2 steps), reduced to one step: a plain copy with the delivery bit (op 1)',
      offset: 0x9776,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.2.1-to32. 32 Hz, one capture per published frame, no mean. Stock page 13 is seed
    // (slot 7, param 0x23), accumulate (slot 8, 0x23) twice, then mean4 (slot 10, param 0x20, LAST). The
    // one substep is frame_chunk_copy (slot 1: a copy of one chunk, no read of the destination) with LAST,
    // on param 0x23 so the capture comes from the same source selection as the stock seed; slot 7 would
    // write the 0xFFFF marker over samples above the ceiling. A copy on param 0x20 (the terminator's
    // selection) published an over-range picture (mean 15,577) and was rejected (TESTING.md 42.24, section
    // 6). Camera: on the Compact XR 4.8.2.1 (serial 1E2A50YZ7628, IP mode 9, TESTING.md 42.24) the steady
    // interval is 31.07 to 31.25 ms (32.0 to 32.2 Hz), 0 frozen pairs, body mean 5.6k to 5.7k (stock
    // 5.67k), and the render looks like stock. The Compact (non-XR) 4.8.2.1 has not been measured on a
    // camera. Emulator, IP 8 Normal (Compact full dump): 8.065 -> 32.258 Hz, level 6,797 -> 6,805. The 16
    // Hz form (TESTING.md 42.23, 62.1 ms steady) was removed (42.26). NO-SKIP (TESTING.md 42.97): the entry
    // also carries the no-skip branch (the last edit, image +0x2286), so one press writes the 32 Hz image
    // with the USB fix, 526124fc. The image this entry wrote before (32 Hz only, d64d91b0) is recognised as
    // an earlier patch (KNOWN_RATE, EARLIER_PATCHES) and is not patched again: restore the stock image,
    // then patch. Emulator (FW-V1 noskip study, the last chunk of each frame read late): the 32 Hz-only
    // image skips about 110 of 120 field starts at 0.5, 2 and 5 ms late; this image skips none and tears
    // none there, and tears only with a chunk held 30 ms. The branch has not been run on a camera of this
    // build.
    id: 'compact_32k-4.8.2.1-to32',
    family: 'compact_32k',
    version: '4.8.2.1',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'f96ac57eda75bca22791acc3ed21c80bde96c1f538f0ddd2aea6ffe447752882',
    patchedSha256: '526124fc64ca2abe7aad917b7c07612006c00958122d63e8347bde7561f06ee1',
    length: 42680,
    edits: [
      // steady page 13 @ image +0x90F2 (68-byte command page; n_substeps 4, next = alt = 13): count 04 ->
      // 01
      { offset: 0x90f2, before: '04', after: '01' },
      // its substeps @ +0x90F6..+0x9105: seed (23 07 00 01) | acc 23 08 00 01 | acc 23 08 00 01 | mean4 (20
      // 8a 03 01, LAST) -> one copy with LAST (23 81 03 01: slot 1, frame_chunk_copy, param 0x23 as the
      // stock seed and accumulates, type 3, gpio 1) | 00 x12
      {
        offset: 0x90f6,
        before: '230700012308000123080001208a0301',
        after: '23810301000000000000000000000000',
      },
      // the no-skip branch (docs/NOSKIP_PATCH_ALL_FIRMWARES.md; toolkit TESTING.md 42.93, 42.97): at the
      // first DMA group of each field the capture loop skips the field while the USB IN queue still holds
      // the previous frame's last chunk (the steady-page step: no log; it tests bit 5 of the substep,
      // clears FLAG_D and sets the skip and restart flags). On a slow host (an Android phone reads that
      // chunk about 1 ms late) every other field is lost. The `cbz r0` over that block (c0 b1) becomes
      // `b.n` (18 e0) to the same target, image +0x22ba, the path an idle endpoint always takes, so no
      // field is skipped. A frame still starts only with the IN queue empty (capture_engine_target.c:668),
      // so the queue cannot overflow.
      { offset: 0x2286, before: 'c0b1', after: '18e0' },
    ],
    row: {
      label:
        'steady self-loop command page 13 of the 68-byte frame program (n_substeps 4 -> 1, next = alt = 13; one copy with LAST per capture, so every capture is published)',
      offset: 0x90f2,
      length: 68,
    },
    sibling: null,
  },
];

/** The corpus builds that already run at a target rate: recognised, reported, never patched (KNOWN_RATE). */
export const FPS_KNOWN_RATE: Readonly<
  Record<string, { readonly name: string; readonly hz: number; readonly earlierPatch: boolean }>
> = {
  '6f06b3334c0c7243ca09753fda471f660d766db183963cb0ce8d5516bfe89682': {
    name: 'compact_pro-1.0.3.0-FF',
    hz: 18,
    earlierPatch: false,
  },
  '196560c05096369165c8858f6a3f66239b6651ad73ff84f26a3fccdcf8c193d3': {
    name: 'compact_pro-1.0.3.2-FF',
    hz: 18,
    earlierPatch: false,
  },
  '48f0ebfd3f55d1dc4aee16f693eedd11c2d5cbbe88f4ca200a90c8ea1b19e735': {
    name: 'compact_pro-4.18.2.0-FF',
    hz: 18,
    earlierPatch: false,
  },
  b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16: {
    name: 'compact-1.3.0.8-FF',
    hz: 16,
    earlierPatch: false,
  },
  b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1: {
    name: 'compact-4.16.1.7-FF',
    hz: 16,
    earlierPatch: false,
  },
  d43f8de589fca3802f58cc919d5121e60da7a9148f3e4ddd40ae924cd82d42ce: {
    name: 'nano_200-42.32.3.10',
    hz: 32,
    earlierPatch: false,
  },
  d91284c65a5dfde608e1c221b66a7ada487f3d42e6f49f01d09c2c7d643b59a9: {
    name: 'compact-1.3.0.0-mode8-32hz',
    hz: 32,
    earlierPatch: true,
  },
  ee8c7f0e09d81b916e1ffeb2807108db34c60b29a277ec8651da22f836fd80eb: {
    name: 'compact-1.3.0.8-to32-op5',
    hz: 32,
    earlierPatch: true,
  },
  '8e2ffdf6918fa5e88871981b6c443229c05c25ad0d4b7a04b07769aecd35d7e1': {
    name: 'compact-1.3.0.8-FF-to32-op5',
    hz: 32,
    earlierPatch: true,
  },
  d31e52d340e462e684dbc714b03c2712580f380b209dcea233a23c34a45ddfc1: {
    name: 'compact-4.8.1.7-to32-op5',
    hz: 32,
    earlierPatch: true,
  },
  '73586516366fde7bfaa27a8b01414632265db6f5ea00138c4fb23e2097e40d88': {
    name: 'compact-4.8.1.9-to32-op5',
    hz: 32,
    earlierPatch: true,
  },
  '5d896b208092a8778d839c54ee86ea8aac846a9cd44cdff24c554541e6315bd4': {
    name: 'compact-4.16.1.7-FF-to32-op5',
    hz: 32,
    earlierPatch: true,
  },
  '5313f107b81d99a1ac033fbfe9ecda9bd3664d2f669237876ffac1e3a01377a4': {
    name: 'compact-1.3.0.8-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '51c6f0d57c89d4cadd2a2d46c0ac0f22ddb21570d0f01f80b0748fd1fb4314e0': {
    name: 'compact-4.8.1.7-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '14e259603487af8b8db1769b144b8fcc41ec09fc8965f835becdb296bb42e495': {
    name: 'compact-4.8.1.9-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  ef90c94a448b69feea06421026c5765eceb1685d6806e7a48714c76c3d0ed273: {
    name: 'compact-1.3.0.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  c519427649dd4d7f962bc1412ed1fb085a21195404910607ea27f7bce2e83c8e: {
    name: 'compact-0.7.0.8-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '9b2c6f89a8f1dd4af056669bc38cf83c657d44a49e1c8bce57c6d85fed611c73': {
    name: 'compact-0.8.0.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  e41610e30bfee1fa6ca862eccc7c5fe8773f05cd958b190a9e22de09c7ac7eb8: {
    name: 'compact-0.9.0.2-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '54d383ad72882075f21963689fa7c69debb1359f5c7254a02b203e5ee12152ea': {
    name: 'compact-0.9.0.6-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '1ad41e1e06f339cfeea264fda4d6b34db7f96e9b6380c8b115eb38253606cc32': {
    name: 'compact-0.9.0.7-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '1814e5acf445c2e4d33aad565881e844baa0d7634794695c0981b8552dd5c53d': {
    name: 'compact-0.9.1.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  efd72e1ca423f5697b74885aa1863f3f935c42d4553ba1f62397394bc0becd65: {
    name: 'compact-0.10.0.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  d55ccb473dea99dd4e5d9507ae4920113b1fdcbaf769dabf9f9e57c8d40ef391: {
    name: 'compact-1.0.0.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  '547d0e853af87068ace1936b443af06b59636d9ac560db24e38dbff4d8001c90': {
    name: 'compact-1.2.0.0-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  bf99816f8bd36a5af33f2bb9196cf9088d9bb58f5d9a45472d40e351d34d677f: {
    name: 'compact-1.3.0.8-FF-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  aec5364181696416e33d75cb8fb64277998ba81d9b5e4823daba1a479588b9e6: {
    name: 'compact-4.16.1.7-FF-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
  d64d91b0fa87f699c32c255b2365db3e9308c6d783b0c95b48ab31f9624c10d5: {
    name: 'compact-4.8.2.1-to32-without-noskip',
    hz: 32,
    earlierPatch: true,
  },
};

/** What the Python tool does NOT patch, and why (NOT_PATCHED), kept for the record. */
export const FPS_NOT_PATCHED_NOTES: readonly string[] = [
  'Compact 32K 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4 and 0.7.0.7 at 8 Hz: no patch. Their capture programs are built at run time by the firmware (a .bss block written by code, cmd_block_fields_publish and the PB writer), so the image holds no program bytes to edit; a patch would change the builder code, which is not surveyed. 0.5.x and 0.6.0.4 are also not streamed by the framerate suite.',
  'Compact 32K 0.3.0.1 at 8 Hz: no patch. Its mode-8 program was not located in the image: no pointer word to its table and no copy of the 1.0.3.0 row-14 bytes. Not established (docs/FPS_PATCH_ALL_FIRMWARES.md section 5.16).',
  'No 16 Hz patch exists any more (1.2.0.0, 1.3.0.0, 1.3.0.8, 4.8.1.7, 4.8.1.9, 4.8.2.1 had one, each also reachable as a 32 Hz patch, 1.2.0.0 included): the 32 Hz patches replace them. The 16 Hz FF builds are stock 16 Hz images, not patches. The 1.3.0.0 mode-6 one-step form (op 3 and the idle steps removed, op 9 kept alone) alternates: each frame is the difference of the previous output and a capture, so the body mean swings about 6,900 halfwords per frame (emulator: mean from -340 to +7,197). A correlated double sample needs a reference copy in the same frame, and no one-step block has one. 1.3.0.0 reaches 32 Hz in the Normal stream through its mode-8 steady block instead (compact_32k-1.3.0.0-to32).',
  'Earlier 32K 32 Hz blocks that dropped op 5 (1.3.0.8, 4.8.1.7, 4.8.1.9, and the FF 1.3.0.8 and 4.16.1.7 ids): withdrawn. Op 5 starts the frame and clears the mask that op 8 reads, so the picture froze (emulator: 56 to 58 of 58 to 61 steady pairs with zero changed halfwords). Replaced by the one-step block that keeps op 5 with the delivery bit, which wrote the 0xFFFF marker; the current form is the plain copy with the delivery bit.',
  'Compact 0.7.0.8 image 8b0f4781 (the 32 Hz entry as first written: operator 1, a plain word copy with no gain table): it runs at 32 Hz but its picture does not match stock (level +12 %, spread about 5x, measured on the bench) and it is not recognised here. A camera that carries it is an unknown image: restore the stock image first, then press Make 32 FPS.',
  'Mosaic 10.9.1.31: already an 18 Hz image (FRAME_RATE, emu/README.md LABEL_DECISIONS); not a 9 Hz target.',
  'Nano 200 42.32.3.10 already publishes every capture (32 Hz); Mosaic FF and Nano 300 are not 9 Hz targets.',
  'The no-skip branch (TESTING.md 42.97) is in the 32 Hz Compact entries only. The Compact PRO 18 Hz entries carry no such edit: there the busy test is part of the frame-arm gate itself and is the only overlap guard, and NOPing it changed nothing in the emulator (docs/NOSKIP_PATCH_ALL_FIRMWARES.md), so no PRO no-skip edit is made.',
  "No patch takes a patched image as input (the owner, TESTING.md 42.97). The 32 Hz images an earlier patch wrote (the table's 32 Hz images before the no-skip branch joined them, the 1.3.0.0 bench image d91284c6 with the withdrawn mode-6 edit, and the one-step op 5 forms; EARLIER_PATCHES) are recognised as 32 Hz and left as they are. Restore the stock image, then press Make 32 FPS to get the 32 Hz image with the USB fix.",
];
