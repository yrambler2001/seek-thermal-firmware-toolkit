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
    // the boot and shutter rows, not the steady state, and are NOT applied here.
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
    // are NOT applied here.
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
    // 4.18.2.0-FF uses the 54-byte record. Exactly 3 bytes differ from the stock image.
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
    // experiment B built from the 18 Hz image. Not measured on hardware.
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
    // compact_32k-1.3.0.8-to32. 32 Hz, one step per capture: block 13 is 13 25 23 (line op 5 with the
    // delivery bit, header type 3). The stock op 8 (fill of the saturated pixels from the fourth capture)
    // is dropped, so this is not the frozen block that dropped op 5 (withdrawn: its picture did not
    // change). Emulator (80-frame boot): the even steady frames are the 1.3.0.8-FF frames one for one
    // (frame 2j = FF frame j, 31 of 31); the odd frames are the captures the FF build does not deliver, and
    // no two steady frames are equal. OPEN: the sensor runs CMD mode 3 on every capture (the stock and FF
    // builds alternate 3 and 0; the emulator does not model the sensor's response to the mode); the
    // saturation fill is gone (the feed has no saturated pixel, so the emulator cannot show it); 32 Hz on a
    // real Compact is unproven; a long stream leaves 32 Hz (see docs/FPS_PATCH_LONG_STREAM.md and the
    // long-run check of fps_patch_tests.py).
    id: 'compact_32k-1.3.0.8-to32',
    family: 'compact_32k',
    version: '1.3.0.8',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2969d0df5bfeac74b88e6ee608ee8b2657fecf2e0234e9ce2731add2408f3d1c',
    patchedSha256: 'ee8c7f0e09d81b916e1ffeb2807108db34c60b29a277ec8651da22f836fd80eb',
    length: 49128,
    edits: [
      // block 13 header count 04 -> 01: the self-loop block runs one step instead of four, so every capture
      // is published
      { offset: 0xb750, before: '04', after: '01' },
      // its steps (3 bytes each): op 5 | op 6 | op 7 | op 8 with the delivery bit -> one step 13 25 23, op
      // 5 on the same source selection as the stock block with the delivery bit (0x20) set in the op byte
      // and header type 3; the other steps are zeroed
      { offset: 0xb754, before: '130520130620130720112823', after: '132523000000000000000000' },
    ],
    row: {
      label:
        'mode-8 capture program, block 13 (header 04 0d 0d 00), reduced to one step: op 5 with the delivery bit',
      offset: 0xb750,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.1.7-to32. 32 Hz, one step per capture: block 13 is 11 25 23 (line op 5 on sel 1 with
    // the delivery bit). The stock op 8 fill is dropped. Emulator (80-frame boot): the even steady frames
    // are the 4.16.1.7-FF frames one for one (frame 2j = FF frame j, 29 of 29); the odd frames are the
    // captures the FF build does not deliver. OPEN: the one step runs sel 1 on every capture (the FF
    // publishing step is sel 0, whose CMD mode is not decoded for 4.8); the saturation fill is gone and
    // cannot be seen on this feed; 32 Hz on a real Compact is unproven; a long stream leaves 32 Hz
    // (docs/FPS_PATCH_LONG_STREAM.md).
    id: 'compact_32k-4.8.1.7-to32',
    family: 'compact_32k',
    version: '4.8.1.7',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '04d9e1559d63463cf6c0c29ddc21f64af093bc3fe4d4e769ba41d4d8b0798419',
    patchedSha256: 'd31e52d340e462e684dbc714b03c2712580f380b209dcea233a23c34a45ddfc1',
    length: 49888,
    edits: [
      // block 13 header count 04 -> 01: the self-loop block runs one step instead of four, so every capture
      // is published
      { offset: 0x976e, before: '04', after: '01' },
      // its steps (3 bytes each): op 5 | op 6 | op 7 | op 8 with the delivery bit -> one step 11 25 23, op
      // 5 on source selection 1 as the stock block, with the delivery bit (0x20) set in the op byte and
      // header type 3; the other steps are zeroed
      { offset: 0x9772, before: '110520110620110720102823', after: '112523000000000000000000' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00), reduced to one step: op 5 with the delivery bit',
      offset: 0x976e,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.1.9-to32. 32 Hz, one step per capture: 11 25 23, the same block as the 4.8.1.7 patch.
    // Emulator (80-frame boot): the even steady frames are the 4.16.1.7-FF frames one for one (29 of 29),
    // and the frames equal those of the 4.8.1.7 patch (59 of 59). The same OPEN points as 4.8.1.7 apply.
    id: 'compact_32k-4.8.1.9-to32',
    family: 'compact_32k',
    version: '4.8.1.9',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2c5eedec97ba168b5defba3b5065c0d50e058102725c577a33ff29d270c3cdd5',
    patchedSha256: '73586516366fde7bfaa27a8b01414632265db6f5ea00138c4fb23e2097e40d88',
    length: 48800,
    edits: [
      // block 13 header count 04 -> 01: one step instead of four, every capture is published (as the
      // 4.8.1.7 patch)
      { offset: 0x95a6, before: '04', after: '01' },
      // its steps: the four steps (op 5 | 6 | 7 | 8 with the delivery bit) -> the one step 11 25 23, as the
      // 4.8.1.7 patch
      { offset: 0x95aa, before: '110520110620110720102823', after: '112523000000000000000000' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00), reduced to one step: op 5 with the delivery bit',
      offset: 0x95a6,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-1.3.0.0-to32. 32 Hz in the Normal stream (IP mode 8), one capture per published frame, no
    // mean. Stock block 8 is the four-step sequence op 5 (seed, x4 above the level), op 6, op 6
    // (accumulate), op 7 (mean of four, push, header id 3, gpio 1). The candidate is one step, op 3 (a
    // plain copy of the line, no read of the destination) with the delivery bit, header id 3 and gpio 1 as
    // stock: the samples keep their scale (op 7 quarters what op 5 and op 6 multiplied up), so the picture
    // is the stock picture without the averaging. MEASURED on a Compact 1.3.0.0 (PIR206, serial
    // 1013CE098ACA), power-cycled after the write: Normal mode (no Hi FPS) steady 32.0 to 32.3 fps median,
    // 0 frozen pairs, ~94 % of pixels change between consecutive frames, level ~5,900 with a ~430-count
    // spread as stock; Hi FPS (IP mode 3, which is stock one capture per frame) ~32 fps. Not modelled by
    // the emulator, which streams mode 6 only. The unit measured first carried the withdrawn mode-6 16 Hz
    // edit as well (image d91284c6..., KNOWN_RATE); the mode-6 edit does not take part in the Normal or Hi
    // FPS streams.
    id: 'compact_32k-1.3.0.0-to32',
    family: 'compact_32k',
    version: '1.3.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '862717a8a605021def7858ac0c04ad4aa1abe23d357d6c2417699939137f481c',
    patchedSha256: 'ef90c94a448b69feea06421026c5765eceb1685d6806e7a48714c76c3d0ed273',
    length: 47768,
    edits: [
      // mode-8 capture program (the processed "normal" stream), block 8 @ +0xB898, the steady self-loop
      // (first = next = 8, header id 3, gpio 1): header 84 08 (count 4) -> 81 08 (count 1)
      { offset: 0xb898, before: '84', after: '81' },
      // its steps @ +0xB89A..+0xB8A1: op 5 (seed) | op 6 | op 6 | op 7 (mean of four, push, hdr 3) 59 20 |
      // 69 20 | 69 20 | 79 27 -> op 3 (copy) with push, hdr 3, gpio 1: 39 27 | 00 x6
      { offset: 0xb89a, before: '5920692069207927', after: '3927000000000000' },
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
    // compact_32k-1.3.0.8-FF-to32. 32 Hz from the FF build, one step per capture: 13 25 23 (the FF block 13
    // keeps its op 5 and gives up its op 8 step). The FF image differs from the 8 Hz 1.3.0.8 image
    // elsewhere as well (reset vector 0x100806b1, not 0x1008066d; 180 bytes longer); of the 16 blocks of
    // its program only block 13 differs. Emulator (80-frame boot): the even steady frames are the FF
    // build's own frames one for one (31 of 31). The same OPEN points as the stock 1.3.0.8 32 Hz patch
    // apply.
    id: 'compact_32k-1.3.0.8-FF-to32',
    family: 'compact_32k',
    version: '1.3.0.8-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16',
    patchedSha256: '8e2ffdf6918fa5e88871981b6c443229c05c25ad0d4b7a04b07769aecd35d7e1',
    length: 49308,
    edits: [
      // the 16 Hz FF block 13 @ image +0xB804 (header 02 0d 0d 00, 2 steps): count 02 -> 01
      { offset: 0xb804, before: '02', after: '01' },
      // its steps @ +0xB808..+0xB80D: 13 05 20 | 11 28 23 -> 13 25 23 | 00 00 00 (op 5 with the delivery
      // bit; the FF build's op 8 fill goes)
      { offset: 0xb808, before: '130520112823', after: '132523000000' },
    ],
    row: {
      label:
        '16 Hz FF block 13 (header 02 0d 0d 00, 2 steps), reduced to one step: op 5 with the delivery bit',
      offset: 0xb804,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.16.1.7-FF-to32. 32 Hz from the FF build, one step per capture: 11 25 23 (the FF block
    // 13 keeps its op 5 on sel 1 and gives up its op 8 step). Of the 16 blocks of its program only block 13
    // differs from the 4.8 8 Hz program. Emulator (80-frame boot): the even steady frames are the FF
    // build's own frames one for one (29 of 29). The same OPEN points as 4.8.1.7 apply.
    id: 'compact_32k-4.16.1.7-FF-to32',
    family: 'compact_32k',
    version: '4.16.1.7-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1',
    patchedSha256: '5d896b208092a8778d839c54ee86ea8aac846a9cd44cdff24c554541e6315bd4',
    length: 49896,
    edits: [
      // the 16 Hz FF block 13 @ image +0x9776 (header 02 0d 0d 00, 2 steps): count 02 -> 01
      { offset: 0x9776, before: '02', after: '01' },
      // its steps @ +0x977A..+0x977F: 11 05 20 | 10 28 23 -> 11 25 23 | 00 00 00
      { offset: 0x977a, before: '110520102823', after: '112523000000' },
    ],
    row: {
      label:
        '16 Hz FF block 13 of the 4.16 program (header 02 0d 0d 00, 2 steps), reduced to one step: op 5 with the delivery bit',
      offset: 0x9776,
      length: 52,
    },
    sibling: null,
  },
  {
    // compact_32k-4.8.2.1-to32. 32 Hz, one capture per published frame, no mean. Stock page 13 is seed
    // (slot 7, param 0x23), accumulate (slot 8, 0x23) twice, then mean4 (slot 10, param 0x20, LAST). The
    // candidate is the one substep frame_chunk_copy (slot 1: mem_copy_flashaware of one chunk, no test and
    // no read of the destination) with LAST, on param 0x23 so that its capture comes from the same source
    // selection and sensor mode as the stock seed and accumulates. Why this slot: copy writes the raw
    // sample, as stock mean4 does for an over-ceiling sample; slot 7 would write the 0xFFFF dead marker
    // over over-ceiling samples. The accumulators (8, 9, 10) read the destination, the state behind the
    // frozen 1.3.0.8 and 4.8.1.x one-step forms and the alternating 1.3.0.0 form; copy does not. A
    // one-substep page is valid: g_telemetry_rows pages 0 to 10 are one-step pages, each with LAST; mode 4
    // has one page of one step. Gpio 1 on the step as stock (the blade is not commanded per frame in steady
    // state). The acceptance sum moves as the patcher computes it.
    // FIRST CANDIDATE, REJECTED on the bench (TESTING.md 42.24): the same page with param 0x20 (the
    // terminator's source selection; patched sha256 d6cea626...). Emulator: 32.26 Hz, not frozen. On the
    // Compact XR 4.8.2.1 (serial 1E2A50YZ7628): steady 32.2 Hz (31.06 ms), one capture per frame, 0 frozen
    // pairs, but the picture is not stock: the published samples average 15,577 (99.99 % of pixels above
    // the sensor ceiling 0x3A98), against stock 5,700. The first candidate is therefore not a rate change
    // of the stock picture.
    // MEASURED on the bench (Compact XR 4.8.2.1, serial 1E2A50YZ7628, IP mode 9, TESTING.md 42.24): this
    // form, raw-written three times and app-written (seek-fw slots patch-fps) three times. Steady thermal
    // interval 31.07 to 31.25 ms (32.0 to 32.2 Hz), one capture per published frame, 0 frozen pairs, about
    // 29.6k of 32,448 halfwords change per frame, body mean median 5.6k to 5.7k (stock 5.67k in the same
    // session), and the render looks like stock. All-frame rate 24.7 to 26.1 fps (the calibration stretch
    // is unpatched; stock 8.1). 16 Hz (42.23) on the same unit: 14.1 fps all frames, 62.1 ms steady. Not
    // measured: a warm object in view, IP mode 8.
    id: 'compact_32k-4.8.2.1-to32',
    family: 'compact_32k',
    version: '4.8.2.1',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'f96ac57eda75bca22791acc3ed21c80bde96c1f538f0ddd2aea6ffe447752882',
    patchedSha256: 'd64d91b0fa87f699c32c255b2365db3e9308c6d783b0c95b48ab31f9624c10d5',
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
  Record<string, { readonly name: string; readonly hz: number }>
> = {
  '6f06b3334c0c7243ca09753fda471f660d766db183963cb0ce8d5516bfe89682': {
    name: 'compact_pro-1.0.3.0-FF',
    hz: 18,
  },
  '196560c05096369165c8858f6a3f66239b6651ad73ff84f26a3fccdcf8c193d3': {
    name: 'compact_pro-1.0.3.2-FF',
    hz: 18,
  },
  '48f0ebfd3f55d1dc4aee16f693eedd11c2d5cbbe88f4ca200a90c8ea1b19e735': {
    name: 'compact_pro-4.18.2.0-FF',
    hz: 18,
  },
  b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16: {
    name: 'compact-1.3.0.8-FF',
    hz: 16,
  },
  b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1: {
    name: 'compact-4.16.1.7-FF',
    hz: 16,
  },
  d43f8de589fca3802f58cc919d5121e60da7a9148f3e4ddd40ae924cd82d42ce: {
    name: 'nano_200-42.32.3.10',
    hz: 32,
  },
  d91284c65a5dfde608e1c221b66a7ada487f3d42e6f49f01d09c2c7d643b59a9: {
    name: 'compact-1.3.0.0-mode8-32hz',
    hz: 32,
  },
};

/** What the Python tool does NOT patch, and why (NOT_PATCHED), kept for the record. */
export const FPS_NOT_PATCHED_NOTES: readonly string[] = [
  'Compact 32K 0.3.0.1, 0.7.0.7, 0.7.0.8, 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0 at 8 Hz (and 0.5.x, 0.6.0.4, which the framerate suite cannot stream): no patch. Their images carry none of the steady-record byte patterns this tool knows (the 52-byte and 34-byte capture blocks, the PRO 1.0.3.0 row 14 and the PRO 4.9 row 20; see emu/README.md). Their record layout is not decoded.',
  'Compact 4.8.2.1 image f96ac57eda75 is in the table as compact_32k-4.8.2.1-to32 (page 13 reduced to one copy with LAST, one capture per frame; measured on the XR, offered). The Compact 4.8.2.1 image is also the Compact XR 4.8.2.1 image.',
  'Compact 32K 1.2.0.0: no patch. Its former 16 Hz patch (mode-6 block 2) was removed with every other 16 Hz patch, and its mode-8 steady block (the one 1.3.0.0 is patched through) was not read or measured.',
  'No 16 Hz patch exists any more (1.2.0.0, 1.3.0.0, 1.3.0.8, 4.8.1.7, 4.8.1.9, 4.8.2.1 had one, each also reachable as a 32 Hz patch except 1.2.0.0): the 32 Hz patches replace them. The 16 Hz FF builds are stock 16 Hz images, not patches. The 1.3.0.0 mode-6 one-step form (op 3 and the idle steps removed, op 9 kept alone) alternates: each frame is the difference of the previous output and a capture, so the body mean swings about 6,900 halfwords per frame (emulator: mean from -340 to +7,197). A correlated double sample needs a reference copy in the same frame, and no one-step block has one. 1.3.0.0 reaches 32 Hz in the Normal stream through its mode-8 steady block instead (compact_32k-1.3.0.0-to32).',
  'Earlier 32K 32 Hz blocks that dropped op 5 (1.3.0.8, 4.8.1.7, 4.8.1.9, and the FF 1.3.0.8 and 4.16.1.7 ids): withdrawn. Op 5 starts the frame and clears the mask that op 8 reads, so the picture froze (emulator: 56 to 58 of 58 to 61 steady pairs with zero changed halfwords). Replaced by the one-step block that keeps op 5 with the delivery bit.',
  'Mosaic 10.9.1.31: already an 18 Hz image (FRAME_RATE, emu/README.md LABEL_DECISIONS); not a 9 Hz target.',
  'Nano 200 42.32.3.10 already publishes every capture (32 Hz); Mosaic FF and Nano 300 are not 9 Hz targets.',
];
