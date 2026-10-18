/* ==================================================================== *
 * GENERATED from FW-V1 emu/fps_patch.py (PATCHES, KNOWN_RATE, NOT_PATCHED) by a one-shot
 * port, and checked by test/preservation/fps-patch.differential.test.ts byte for byte against
 * the Python output. Do not edit the numbers by hand: change fps_patch.py and port it again.
 * Bytes are hex strings here; fps-patch.ts turns them into byte arrays and gates them.
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
    // compact_pro-1.0.3.0. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 . 0 . 3 . 0 - F F   ( 1 8   H z )   r o w   1 4   a t   0 x C 2 C C   i s   b y t e - i d e n
    // // t i c a l   t o   t h e   p a t c h e d   r o w   1 4 .   T h e   F F   b u i l d   a l s o   d
    // // r o p s   t h e   l e a d i n g   s t e p   o f   r o w s   0 - 1 2 ,   1 4   a n d   1 6   a n
    // // d   c h a n g e s   t h e   r o w - 1 6   f l a g s ;   t h o s e   a r e   t h e   b o o t   a
    // // n d   s h u t t e r   r o w s ,   n o t   t h e   s t e a d y   s t a t e ,   a n d   a r e   N
    // // O T   a p p l i e d   h e r e .
    id: 'compact_pro-1.0.3.0',
    family: 'compact_pro',
    version: '1.0.3.0',
    fromHz: 9,
    targetHz: 18,
    stockSha256: '5e1f3f24c8bc1e85bcb67e73e0ee23f301864ee7839a48135598fca961373e26',
    patchedSha256: 'd410b04cdaa10c34db64f5ecdda4afcbee2c4a57b053cb951e060258e2d93461',
    length: 51848,
    edits: [
      { offset: 0xc2bc, before: '02', after: '01' },
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
    // compact_pro-1.0.3.2. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 . 0 . 3 . 2 - F F   ( 1 8   H z )   r e c o r d   2 0   a t   0 x C 2 5 8   i s   b y t e - i
    // // d e n t i c a l   t o   t h e   p a t c h e d   r e c o r d .   T h e   F F   b u i l d   a l s
    // // o   d r o p s   t h e   l e a d i n g   s u b s t e p   o f   r e c o r d s   8 ,   9 ,   1 2 ,
    // // 1 4 - 1 8   ( t h e   s a m e   n i n e   r e c o r d s   a s   t h e   4 . 9   t a b l e ,   F
    // // R A M E _ R A T E . m d   s e c . 6 . 4 )   a n d   m o v e s   a   u 1 6   t a b l e   a t   0
    // // x B F 3 2 ;   t h o s e   a r e   n o t   t h e   s t e a d y   s t a t e   a n d   a r e   N O
    // // T   a p p l i e d   h e r e .
    id: 'compact_pro-1.0.3.2',
    family: 'compact_pro',
    version: '1.0.3.2',
    fromHz: 9,
    targetHz: 18,
    stockSha256: 'c776924773ed42468957de742284636461e9dafef8d4ab431f5627795b5cfa0c',
    patchedSha256: '68bcc5f989384fac390ebd25dd6c12098780e9e79d24528b294e1c8cc156cb2f',
    length: 51728,
    edits: [
      { offset: 0xc258, before: '02', after: '01' },
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
    // compact_pro-4.9.1.15. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // F R A M E _ R A T E . m d   s e c . 6 . 3   ( e x p e r i m e n t   A ,   t h e   o n l y   o n
    // // e   o f   t h e   9   H z   i m a g e s   m e a s u r e d   o n   h a r d w a r e ) :   8 . 8 5
    // // f p s   - >   1 7 . 7 0   f p s   w i t h   t h e s e   t h r e e   b y t e s .   N o   s a m e
    // // - l a y o u t   1 8   H z   s i b l i n g   e x i s t s ;   4 . 1 8 . 2 . 0 - F F   u s e s   t
    // // h e   5 4 - b y t e   r e c o r d .   E x a c t l y   3   b y t e s   d i f f e r   f r o m   t
    // // h e   s t o c k   i m a g e .
    id: 'compact_pro-4.9.1.15',
    family: 'compact_pro',
    version: '4.9.1.15',
    fromHz: 9,
    targetHz: 18,
    stockSha256: '13db63815bce911fb9388277cc6a177498df1023e9713994dd116e6eef6f84bb',
    patchedSha256: '75405c18271faadc8f08c4d713d5c962ec2159cfec7329046574507584943bc8',
    length: 54840,
    edits: [
      { offset: 0x19b0, before: '02', after: '01' },
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
    // compact_pro-4.9.2.0. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 4 . 1 8 . 2 . 0 - F F   ( 1 8   H z )   r o w   2 0   a t   0 x A 6 6 0   i s   b y t e - i d e
    // // n t i c a l   t o   t h e   p a t c h e d   r o w   2 0   ( 5 4   b y t e s ) .   T h e   s t o
    // // c k   4 . 9 . 2 . 0   r o w   i s   t h a t   1 8   H z   r o w   w i t h   o n e   l e a d i n
    // // g   n o - o p   s u b s t e p   ( 0 0   0 0   0 1 ,   a   w h o l e   f r a m e   o f   n o   w
    // // o r k )   i n   f r o n t   o f   i t s   a r m e d   s u b s t e p .   T h e   s a m e   s h a
    // // p e   i s   w h a t   F R A M E _ R A T E . m d   s e c . 6 . 3   e x p e r i m e n t   B   b u
    // // i l t   f r o m   t h e   1 8   H z   i m a g e .   N o t   m e a s u r e d   o n   h a r d w a
    // // r e .
    id: 'compact_pro-4.9.2.0',
    family: 'compact_pro',
    version: '4.9.2.0',
    fromHz: 9,
    targetHz: 18,
    stockSha256: 'b8d069f1cedfea80b0f15448a84d148ddc63aba0f0b2c77e10f9a79a7b5d8c0e',
    patchedSha256: '4dcf0442478b9eb9f708f6ed08697f78ce1c3d13f2e6acadb527f5c330b8c00b',
    length: 44760,
    edits: [
      { offset: 0xa634, before: '02', after: '01' },
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
    // compact_32k-1.3.0.8-to32. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 3 2   H z ,   o n e   s t e p   p e r   c a p t u r e :   b l o c k   1 3   i s   1 3   2 5   2
    // // 3   ( l i n e   o p   5   w i t h   t h e   d e l i v e r y   b i t ,   h e a d e r   t y p e
    // // 3 ) .   T h e   s t o c k   o p   8   ( f i l l   o f   t h e   s a t u r a t e d   p i x e l s
    // // f r o m   t h e   f o u r t h   c a p t u r e )   i s   d r o p p e d ,   s o   t h i s   i s
    // // n o t   t h e   f r o z e n   b l o c k   t h a t   d r o p p e d   o p   5   ( w i t h d r a w
    // // n :   i t s   p i c t u r e   d i d   n o t   c h a n g e ) .   E m u l a t o r   ( 8 0 - f r a
    // // m e   b o o t ) :   t h e   e v e n   s t e a d y   f r a m e s   a r e   t h e   1 . 3 . 0 . 8
    // // - F F   f r a m e s   o n e   f o r   o n e   ( f r a m e   2 j   =   F F   f r a m e   j ,   3
    // // 1   o f   3 1 ) ;   t h e   o d d   f r a m e s   a r e   t h e   c a p t u r e s   t h e   F F
    // // b u i l d   d o e s   n o t   d e l i v e r ,   a n d   n o   t w o   s t e a d y   f r a m e s
    // // a r e   e q u a l .   O P E N :   t h e   s e n s o r   r u n s   C M D   m o d e   3   o n   e
    // // v e r y   c a p t u r e   ( t h e   s t o c k   a n d   F F   b u i l d s   a l t e r n a t e
    // // 3   a n d   0 ;   t h e   e m u l a t o r   d o e s   n o t   m o d e l   t h e   s e n s o r '
    // // s   r e s p o n s e   t o   t h e   m o d e ) ;   t h e   s a t u r a t i o n   f i l l   i s
    // // g o n e   ( t h e   f e e d   h a s   n o   s a t u r a t e d   p i x e l ,   s o   t h e   e m
    // // u l a t o r   c a n n o t   s h o w   i t ) ;   3 2   H z   o n   a   r e a l   C o m p a c t
    // // i s   u n p r o v e n ;   a   l o n g   s t r e a m   l e a v e s   3 2   H z   ( s e e   d o c
    // // s / F P S _ P A T C H _ L O N G _ S T R E A M . m d   a n d   t h e   l o n g - r u n   c h e c
    // // k   o f   f p s _ p a t c h _ t e s t s . p y ) .
    id: 'compact_32k-1.3.0.8-to32',
    family: 'compact_32k',
    version: '1.3.0.8',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2969d0df5bfeac74b88e6ee608ee8b2657fecf2e0234e9ce2731add2408f3d1c',
    patchedSha256: 'ee8c7f0e09d81b916e1ffeb2807108db34c60b29a277ec8651da22f836fd80eb',
    length: 49128,
    edits: [
      { offset: 0xb750, before: '04', after: '01' },
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
    // compact_32k-4.8.1.7-to32. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 3 2   H z ,   o n e   s t e p   p e r   c a p t u r e :   b l o c k   1 3   i s   1 1   2 5   2
    // // 3   ( l i n e   o p   5   o n   s e l   1   w i t h   t h e   d e l i v e r y   b i t ) .   T h
    // // e   s t o c k   o p   8   f i l l   i s   d r o p p e d .   E m u l a t o r   ( 8 0 - f r a m e
    // // b o o t ) :   t h e   e v e n   s t e a d y   f r a m e s   a r e   t h e   4 . 1 6 . 1 . 7 - F
    // // F   f r a m e s   o n e   f o r   o n e   ( f r a m e   2 j   =   F F   f r a m e   j ,   2 9
    // // o f   2 9 ) ;   t h e   o d d   f r a m e s   a r e   t h e   c a p t u r e s   t h e   F F   b
    // // u i l d   d o e s   n o t   d e l i v e r .   O P E N :   t h e   o n e   s t e p   r u n s   s
    // // e l   1   o n   e v e r y   c a p t u r e   ( t h e   F F   p u b l i s h i n g   s t e p   i s
    // // s e l   0 ,   w h o s e   C M D   m o d e   i s   n o t   d e c o d e d   f o r   4 . 8 ) ;   t
    // // h e   s a t u r a t i o n   f i l l   i s   g o n e   a n d   c a n n o t   b e   s e e n   o n
    // // t h i s   f e e d ;   3 2   H z   o n   a   r e a l   C o m p a c t   i s   u n p r o v e n ;
    // // a   l o n g   s t r e a m   l e a v e s   3 2   H z   ( d o c s / F P S _ P A T C H _ L O N G _
    // // S T R E A M . m d ) .
    id: 'compact_32k-4.8.1.7-to32',
    family: 'compact_32k',
    version: '4.8.1.7',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '04d9e1559d63463cf6c0c29ddc21f64af093bc3fe4d4e769ba41d4d8b0798419',
    patchedSha256: 'd31e52d340e462e684dbc714b03c2712580f380b209dcea233a23c34a45ddfc1',
    length: 49888,
    edits: [
      { offset: 0x976e, before: '04', after: '01' },
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
    // compact_32k-4.8.1.9-to32. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 3 2   H z ,   o n e   s t e p   p e r   c a p t u r e :   1 1   2 5   2 3 ,   t h e   s a m e
    // // b l o c k   a s   t h e   4 . 8 . 1 . 7   p a t c h .   E m u l a t o r   ( 8 0 - f r a m e   b
    // // o o t ) :   t h e   e v e n   s t e a d y   f r a m e s   a r e   t h e   4 . 1 6 . 1 . 7 - F F
    // // f r a m e s   o n e   f o r   o n e   ( 2 9   o f   2 9 ) ,   a n d   t h e   f r a m e s   e q
    // // u a l   t h o s e   o f   t h e   4 . 8 . 1 . 7   p a t c h   ( 5 9   o f   5 9 ) .   T h e   s
    // // a m e   O P E N   p o i n t s   a s   4 . 8 . 1 . 7   a p p l y .
    id: 'compact_32k-4.8.1.9-to32',
    family: 'compact_32k',
    version: '4.8.1.9',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '2c5eedec97ba168b5defba3b5065c0d50e058102725c577a33ff29d270c3cdd5',
    patchedSha256: '73586516366fde7bfaa27a8b01414632265db6f5ea00138c4fb23e2097e40d88',
    length: 48800,
    edits: [
      { offset: 0x95a6, before: '04', after: '01' },
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
    // compact_32k-1.3.0.0-to32. Python PATCHES entry, emu/fps_patch.py. 32 Hz in the Normal stream (IP mode 8): the
    // mode-8 capture program's block 8 (the steady self-loop) goes from op 5, 6, 6, 7 (mean of four, publish on the
    // fourth capture) to one op-3 copy with the delivery bit. Measured on a Compact 1.3.0.0 (serial 1013CE098ACA):
    // Normal mode 32.2 fps median, 0 frozen pairs.
    id: 'compact_32k-1.3.0.0-to32',
    family: 'compact_32k',
    version: '1.3.0.0',
    fromHz: 8,
    targetHz: 32,
    stockSha256: '862717a8a605021def7858ac0c04ad4aa1abe23d357d6c2417699939137f481c',
    patchedSha256: 'ef90c94a448b69feea06421026c5765eceb1685d6806e7a48714c76c3d0ed273',
    length: 47768,
    edits: [
      { offset: 0xb898, before: '84', after: '81' },
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
    // compact_32k-1.3.0.8-FF-to32. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 3 2   H z   f r o m   t h e   F F   b u i l d ,   o n e   s t e p   p e r   c a p t u r e :   1
    // // 3   2 5   2 3   ( t h e   F F   b l o c k   1 3   k e e p s   i t s   o p   5   a n d   g i v e
    // // s   u p   i t s   o p   8   s t e p ) .   T h e   F F   i m a g e   d i f f e r s   f r o m   t
    // // h e   8   H z   1 . 3 . 0 . 8   i m a g e   e l s e w h e r e   a s   w e l l   ( r e s e t   v
    // // e c t o r   0 x 1 0 0 8 0 6 b 1 ,   n o t   0 x 1 0 0 8 0 6 6 d ;   1 8 0   b y t e s   l o n g
    // // e r ) ;   o f   t h e   1 6   b l o c k s   o f   i t s   p r o g r a m   o n l y   b l o c k
    // // 1 3   d i f f e r s .   E m u l a t o r   ( 8 0 - f r a m e   b o o t ) :   t h e   e v e n   s
    // // t e a d y   f r a m e s   a r e   t h e   F F   b u i l d ' s   o w n   f r a m e s   o n e   f
    // // o r   o n e   ( 3 1   o f   3 1 ) .   T h e   s a m e   O P E N   p o i n t s   a s   t h e   s
    // // t o c k   1 . 3 . 0 . 8   3 2   H z   p a t c h   a p p l y .
    id: 'compact_32k-1.3.0.8-FF-to32',
    family: 'compact_32k',
    version: '1.3.0.8-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16',
    patchedSha256: '8e2ffdf6918fa5e88871981b6c443229c05c25ad0d4b7a04b07769aecd35d7e1',
    length: 49308,
    edits: [
      { offset: 0xb804, before: '02', after: '01' },
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
    // compact_32k-4.16.1.7-FF-to32. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 3 2   H z   f r o m   t h e   F F   b u i l d ,   o n e   s t e p   p e r   c a p t u r e :   1
    // // 1   2 5   2 3   ( t h e   F F   b l o c k   1 3   k e e p s   i t s   o p   5   o n   s e l   1
    // // a n d   g i v e s   u p   i t s   o p   8   s t e p ) .   O f   t h e   1 6   b l o c k s   o f
    // // i t s   p r o g r a m   o n l y   b l o c k   1 3   d i f f e r s   f r o m   t h e   4 . 8   8
    // // H z   p r o g r a m .   E m u l a t o r   ( 8 0 - f r a m e   b o o t ) :   t h e   e v e n   s
    // // t e a d y   f r a m e s   a r e   t h e   F F   b u i l d ' s   o w n   f r a m e s   o n e   f
    // // o r   o n e   ( 2 9   o f   2 9 ) .   T h e   s a m e   O P E N   p o i n t s   a s   4 . 8 . 1
    // // . 7   a p p l y .
    id: 'compact_32k-4.16.1.7-FF-to32',
    family: 'compact_32k',
    version: '4.16.1.7-FF',
    fromHz: 16,
    targetHz: 32,
    stockSha256: 'b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1',
    patchedSha256: '5d896b208092a8778d839c54ee86ea8aac846a9cd44cdff24c554541e6315bd4',
    length: 49896,
    edits: [
      { offset: 0x9776, before: '02', after: '01' },
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
    // compact_32k-4.8.2.1-to32. Python PATCHES entry, emu/fps_patch.py. Evidence: stock steady command page 13
    // keeps its header and becomes ONE substep: frame_chunk_copy (slot 1, the capture as the sensor delivered it)
    // with LAST, on param 0x23 as the stock seed and accumulates, type 3, gpio 1: one capture per published frame,
    // no mean. Measured on the Compact XR 4.8.2.1 (serial 1E2A50YZ7628, IP mode 9, TESTING.md 42.24): steady
    // interval 31.07 to 31.25 ms (32.0 to 32.2 Hz), 1 capture per frame, 0 frozen pairs, the picture as stock (body
    // mean 5.6k to 5.7k, about 29.6k of 32.4k halfwords change per frame); six runs, raw- and app-written. The first
    // form (param 0x20) published a picture over the sensor ceiling and was rejected. Calibration stretches are
    // unchanged and not patched.
    id: 'compact_32k-4.8.2.1-to32',
    family: 'compact_32k',
    version: '4.8.2.1',
    fromHz: 8,
    targetHz: 32,
    stockSha256: 'f96ac57eda75bca22791acc3ed21c80bde96c1f538f0ddd2aea6ffe447752882',
    patchedSha256: 'd64d91b0fa87f699c32c255b2365db3e9308c6d783b0c95b48ab31f9624c10d5',
    length: 42680,
    edits: [
      { offset: 0x90f2, before: '04', after: '01' },
      {
        offset: 0x90f6,
        before: '230700012308000123080001208a0301',
        after: '23810301' + '0'.repeat(24),
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
  // the 1.3.0.0 image measured first on the bench: the mode-8 32 Hz edit plus the since-withdrawn mode-6 16 Hz edit
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
