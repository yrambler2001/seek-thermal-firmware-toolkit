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
    // compact_32k-1.3.0.8-to16. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 6   H z ,   t w o   c a p t u r e s   p e r   f r a m e .   T h e   1 . 3 . 0 . 8 - F F   b u
    // // i l d   ( 1 6   H z )   r u n s   t h e   s a m e   p r o g r a m   i n   e v e r y   b l o c k
    // // b u t   t h i s   o n e :   i t s   b l o c k   1 3   i s   2   s t e p s   ( 1 3   0 5   2 0
    // // =   l i n e   o p   5 ,   t h e n   1 1   2 8   2 3   =   l i n e   o p   8   w i t h   t h e
    // // d e l i v e r y   b i t ) ,   t h e   s t o c k   b l o c k   h a s   4   ( o p s   5 ,   6 ,
    // // 7 ,   8 ) .   T h e   p a t c h e d   b l o c k   e q u a l s   t h e   F F   b l o c k   b y t
    // // e   f o r   b y t e .   E m u l a t o r   ( f p s _ p a t c h _ f r a m e s . p y ,   8 0 - f r
    // // a m e   b o o t ) :   e v e r y   s t e a d y   f r a m e   b o d y   e q u a l s   t h e   1 .
    // // 3 . 0 . 8 - F F   f r a m e   a t   t h e   s a m e   i n d e x   ( 6 0   o f   6 0 ) .   W h a
    // // t   i s   l o s t   i s   t h e   t h r e e - c a p t u r e   a v e r a g e   o f   t h e   s t
    // // o c k   f r a m e ,   w h i c h   t h e   F F   b u i l d   a l s o   g i v e s   u p .
    id: 'compact_32k-1.3.0.8-to16',
    family: 'compact_32k',
    version: '1.3.0.8',
    fromHz: 8,
    targetHz: 16,
    stockSha256: '2969d0df5bfeac74b88e6ee608ee8b2657fecf2e0234e9ce2731add2408f3d1c',
    patchedSha256: '18d974c489fcbccf92c81a3179a7e5e8ee7612370374276fabd938d8c20ce15f',
    length: 49128,
    edits: [
      { offset: 0xb750, before: '04', after: '02' },
      { offset: 0xb757, before: '130620130720112823', after: '112823000000000000' },
    ],
    row: {
      label:
        'mode-8 capture program, block 13 (header 04 0d 0d 00: count 4, first = next = 13), a self-loop whose last step carries the delivery bit',
      offset: 0xb750,
      length: 52,
    },
    sibling: {
      sha256: 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16',
      offset: 0xb804,
      length: 52,
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
    // compact_32k-4.8.1.7-to16. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 6   H z .   T h e   4 . 1 6 . 1 . 7 - F F   b u i l d   ( 1 6   H z )   h a s   t h i s   b l
    // // o c k   a s   2   s t e p s   ( 1 1   0 5   2 0 ,   1 0   2 8   2 3 ) ;   t h e   p a t c h e d
    // // b l o c k   e q u a l s   i t   b y t e   f o r   b y t e .   E m u l a t o r   ( 8 0 - f r a m
    // // e   b o o t ) :   e v e r y   s t e a d y   f r a m e   b o d y   e q u a l s   t h e   4 . 1 6
    // // . 1 . 7 - F F   f r a m e   a t   t h e   s a m e   i n d e x   ( 5 6   o f   5 6 ) .   T h e
    // // s t o c k   b l o c k   d i f f e r s   f r o m   t h e   F F   b l o c k   i n   t h e   c o u
    // // n t   b y t e   a n d   t h e   t w o   m i d d l e   l i n e   s t e p s   ( 1 1   0 6   2 0 ,
    // // 1 1   0 7   2 0 ) ,   n o t h i n g   e l s e .
    id: 'compact_32k-4.8.1.7-to16',
    family: 'compact_32k',
    version: '4.8.1.7',
    fromHz: 8,
    targetHz: 16,
    stockSha256: '04d9e1559d63463cf6c0c29ddc21f64af093bc3fe4d4e769ba41d4d8b0798419',
    patchedSha256: '7ef65e01337f6ef3cb6be3c31a63878e15bcdfa0063105a6d3b3278e08df8637',
    length: 49888,
    edits: [
      { offset: 0x976e, before: '04', after: '02' },
      { offset: 0x9775, before: '110620110720102823', after: '102823000000000000' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00: count 4, first = next = 13) of the 32K capture program, last step carries the delivery bit',
      offset: 0x976e,
      length: 52,
    },
    sibling: {
      sha256: 'b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1',
      offset: 0x9776,
      length: 52,
    },
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
    // compact_32k-4.8.1.9-to16. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 6   H z .   S a m e   b l o c k   b y t e s   a s   t h e   4 . 8 . 1 . 7   s t o c k   i m a
    // // g e .   T h e   p a t c h e d   b l o c k   e q u a l s   t h e   4 . 1 6 . 1 . 7 - F F   b l o
    // // c k   ( 1 6   H z ;   a n o t h e r   v e r s i o n :   n o   4 . 8 . 1 . 9   F F   e x i s t s
    // // ) .   E m u l a t o r   ( 8 0 - f r a m e   b o o t ) :   e v e r y   s t e a d y   f r a m e
    // // b o d y   e q u a l s   t h e   4 . 1 6 . 1 . 7 - F F   f r a m e   a t   t h e   s a m e   i n
    // // d e x   ( 5 6   o f   5 6 ) ,   t h e   s a m e   f r a m e s   a s   t h e   4 . 8 . 1 . 7   p
    // // a t c h .
    id: 'compact_32k-4.8.1.9-to16',
    family: 'compact_32k',
    version: '4.8.1.9',
    fromHz: 8,
    targetHz: 16,
    stockSha256: '2c5eedec97ba168b5defba3b5065c0d50e058102725c577a33ff29d270c3cdd5',
    patchedSha256: '995ffeae7cc6c4582afa0d7482466959225bea2268bf67deba554c2f3f110dc9',
    length: 48800,
    edits: [
      { offset: 0x95a6, before: '04', after: '02' },
      { offset: 0x95ad, before: '110620110720102823', after: '102823000000000000' },
    ],
    row: {
      label:
        'steady self-loop block (header 04 0d 0d 00: count 4, first = next = 13) of the 32K capture program, last step carries the delivery bit',
      offset: 0x95a6,
      length: 52,
    },
    sibling: {
      sha256: 'b1016ea14f2e830fb3691afbd60cd679035c7700a99c777a8a3c276e034f6ca1',
      offset: 0x9776,
      length: 52,
    },
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
    // compact_32k-1.3.0.0-to16. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // 1 6   H z ,   t w o   c a p t u r e s   p e r   f r a m e :   o p   3   ( c o p y ,   3 9   6 0
    // // )   t h e n   o p   9   w i t h   t h e   d e l i v e r y   b i t   ( 9 9   2 7 ) .   N o   F F
    // // s i b l i n g   o f   1 . 3 . 0 . 0   e x i s t s .   T h e   f i r s t   v e r s i o n   o f
    // // t h i s   e d i t   k e p t   t h e   i d l e   s t e p   0 1   4 0   a n d   r e m o v e d   o
    // // p   3 ,   s o   o p   9   s u b t r a c t e d   t h e   p r e v i o u s   f r a m e :   t h e
    // // b o d y   m e a n   a l t e r n a t e d   b e t w e e n   a b o u t   - 7 0   a n d   + 6 , 9 0
    // // 0   ( w i t h d r a w n ) .   E m u l a t o r   ( 8 0 - f r a m e   b o o t ,   t h i s   b l o
    // // c k ) :   n o   a l t e r n a t i o n   ( m e d i a n   m e a n   s w i n g   1 . 1   h a l f w
    // // o r d s ;   s t o c k   1 . 0 ) ;   b o d y   l e v e l   m e d i a n   - 1 . 3   ( s t o c k
    // // - 2 . 8 ) ;   2 7 , 5 1 6   h a l f w o r d s   c h a n g e   p e r   f r a m e   ( s t o c k
    // // 2 7 , 5 5 8 ) .   O n e   s t e a d y   f r a m e   i n   t h i r t y   h a s   a   t r a n s i
    // // e n t   m e a n   ( + 3 5 2 ,   - 3 3 )   a t   t h e   s a m e   6 0 - c a p t u r e   p e r i
    // // o d   t h e   s t o c k   s h o w s   a s   - 4 6 ,   - 1 1 ;   t h e   s i z e   o f   t h a t
    // // t r a n s i e n t   i s   n o t   e x p l a i n e d .   O P E N :   t h e   t w o   r e m o v e
    // // d   i d l e   s t e p s   c a r r i e d   s h u t t e r   c o d e s   2   a n d   0 ,   s o   t
    // // h e   s h u t t e r   s e q u e n c e   c h a n g e s   f r o m   2 , 3 , 0 , 1   t o   3 , 1
    // // ( n o t   m o d e l l e d   b y   t h e   e m u l a t o r ) ;   n o   1 6   H z   1 . 3 . 0 . 0
    // // C o m p a c t   e x i s t s   t o   c o m p a r e   w i t h .
    id: 'compact_32k-1.3.0.0-to16',
    family: 'compact_32k',
    version: '1.3.0.0',
    fromHz: 8,
    targetHz: 16,
    stockSha256: '862717a8a605021def7858ac0c04ad4aa1abe23d357d6c2417699939137f481c',
    patchedSha256: '0ede6768f57acdfa65c19bdb3f62973789a43b28db24d7fbc4bc60fddde90692',
    length: 47768,
    edits: [
      { offset: 0xb964, before: '24', after: '22' },
      { offset: 0xb966, before: '0140396001009927', after: '3960992700000000' },
    ],
    row: {
      label:
        'mode-6 capture program, block 2 (34-byte blocks; self-loop, first = next = 2), 4 steps, last one carries the delivery bit',
      offset: 0xb964,
      length: 34,
    },
    sibling: null,
  },
  {
    // compact_32k-1.2.0.0-to16. Python PATCHES entry, emu/fps_patch.py. Evidence:
    // // T h e   s a m e   3 4 - b y t e   b l o c k   a s   1 . 3 . 0 . 0   ( i d e n t i c a l   b y t
    // // e s   a t   + 0 x B 9 6 4 :   2 4   0 2 ,   0 1   4 0   3 9   6 0   0 1   0 0   9 9   2 7 ) ,
    // // s o   t h e   s a m e   e d i t   a n d   t h e   s a m e   r e a s o n i n g .   N o   F F   s
    // // i b l i n g   o f   1 . 2 . 0 . 0 .   E m u l a t o r   ( 8 0 - f r a m e   b o o t ) :   i t s
    // // s t e a d y   f r a m e s   e q u a l   t h e   1 . 3 . 0 . 0   p a t c h ' s   f r a m e s   (
    // // 7 8   o f   7 8 ,   s a m e   i n d i c e s ) ;   t h e   1 . 3 . 0 . 0   O P E N   p o i n t s
    // // a p p l y .
    id: 'compact_32k-1.2.0.0-to16',
    family: 'compact_32k',
    version: '1.2.0.0',
    fromHz: 8,
    targetHz: 16,
    stockSha256: '38a9036ae44b9fcaca31a7432257f4aa2cf71d7715a964f1c4b9553dfabfea01',
    patchedSha256: 'b2dae4a43a69b04fc88b5f650a1998d02f1ca663923bb227069ac540ed04273b',
    length: 47768,
    edits: [
      { offset: 0xb964, before: '24', after: '22' },
      { offset: 0xb966, before: '0140396001009927', after: '3960992700000000' },
    ],
    row: {
      label:
        'mode-6 capture program, block 2 (34-byte blocks; self-loop, first = next = 2), 4 steps, last one carries the push bit',
      offset: 0xb964,
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
};

/** What the Python tool does NOT patch, and why (NOT_PATCHED), kept for the record. */
export const FPS_NOT_PATCHED_NOTES: readonly string[] = [
  'Compact 32K 0.3.0.1, 0.7.0.7, 0.7.0.8, 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0 at 8 Hz (and 0.5.x, 0.6.0.4, which the framerate suite cannot stream): no patch. Their images carry none of the steady-record byte patterns this tool knows (the 52-byte and 34-byte capture blocks, the PRO 1.0.3.0 row 14 and the PRO 4.9 row 20; see emu/README.md). Their record layout is not decoded.',
  'Compact XR 4.8.2.1 and the Compact 4.8.2.1 dump (both hold the one image f96ac57eda75): no patch. It runs 68-byte command pages (include/fw_types.h cmd_page_t; 30 pages for modes 8 and 9); the steady page and its delivery rule were not identified.',
  'Compact 32K 1.3.0.0 and 1.2.0.0 at 32 Hz: no patch. Its one-step block (op 3 and the idle steps removed, op 9 kept alone) alternates: each frame is the difference of the previous output and a capture, so the body mean swings about 6,900 halfwords per frame (emulator, 1.3.0.0 and 1.2.0.0: mean from -340 to +7,197). A correlated double sample needs a reference copy in the same frame, and no one-step block has one.',
  'Earlier 32K 32 Hz blocks that dropped op 5 (1.3.0.8, 4.8.1.7, 4.8.1.9, and the FF 1.3.0.8 and 4.16.1.7 ids): withdrawn. Op 5 starts the frame and clears the mask that op 8 reads, so the picture froze (emulator: 56 to 58 of 58 to 61 steady pairs with zero changed halfwords). Replaced by the one-step block that keeps op 5 with the delivery bit.',
  'Mosaic 10.9.1.31: already an 18 Hz image (FRAME_RATE, emu/README.md LABEL_DECISIONS); not a 9 Hz target.',
  'Nano 200 42.32.3.10 already publishes every capture (32 Hz); Mosaic FF and Nano 300 are not 9 Hz targets.',
];
