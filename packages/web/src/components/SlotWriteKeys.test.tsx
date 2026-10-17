/**
 * The keys the slot writes use, shown before anything is picked (`SlotWriteKeys`):
 * the booted bank's key, the key every other bank is written under, and the
 * measured reason when the camera cannot be written under those keys. The
 * verdict comes from core; these tests pin how the page shows it.
 */

import { describe, expect, it } from 'vitest';
import { SlotWriteKeys, type WriteKeysVerdict } from './SlotWriteKeys';
import { render } from '../test-helpers';

/** The store key is written, and the booted bank holds Key A, which the bootloader accepts too. */
const STORE: WriteKeysVerdict = {
  refusal: null,
  bootedName: 'slot A',
  keyName: 'Key B',
  bootedKeyName: 'Key A',
  evidence: [
    'the booted bank A decrypts under Key A, a key the bootloader tries',
    'the running application carries its Key A at 0x4100',
  ],
};

/** The booted bank's own key is written. */
const SAME: WriteKeysVerdict = {
  refusal: null,
  bootedName: 'slot A',
  keyName: 'Key A',
  bootedKeyName: 'Key A',
  evidence: [],
};

const REFUSED: WriteKeysVerdict = {
  refusal:
    'the running application (bank A, firmware 4.16.1.7) checks an upload under its own keys before it programs it',
  bootedName: 'slot A',
  keyName: null,
  bootedKeyName: 'Key A',
  evidence: [],
};

describe('SlotWriteKeys', () => {
  it('says which key the booted bank holds, and that every bank is written under the store key the same way', () => {
    const { container, unmount } = render(<SlotWriteKeys verdict={STORE} />);
    const text = container.textContent;
    expect(text).toContain('Keys for the writes');
    expect(text).toContain('slot A holds Key A');
    expect(text).toContain(
      'Key B (the store key), derived from the booted slot A, which holds Key A; every bank is written the same way',
    );
    expect(text).toContain('the running application carries its Key A at 0x4100');
    unmount();
  });

  it('says the booted bank’s own key is what every bank is written under, when it is', () => {
    const { container, unmount } = render(<SlotWriteKeys verdict={SAME} />);
    const text = container.textContent;
    expect(text).toContain(
      'Key A, derived from the booted slot A; every bank is written the same way',
    );
    expect(text).not.toContain('the store key');
    unmount();
  });

  it('shows the measured reason, and no key claim, when the camera is refused', () => {
    const { container, unmount } = render(<SlotWriteKeys verdict={REFUSED} />);
    const text = container.textContent;
    expect(text).toContain('No bank of this camera can be written from here.');
    expect(text).toContain('checks an upload under its own keys before it programs it');
    expect(text).not.toContain('derived from the booted');
    unmount();
  });

  it('says what the page cannot name, rather than inventing a key', () => {
    const { container, unmount } = render(
      <SlotWriteKeys
        verdict={{ ...STORE, bootedName: null, keyName: null, bootedKeyName: null }}
      />,
    );
    const text = container.textContent;
    expect(text).toContain('the booted bank holds a key the page cannot name');
    unmount();
  });
});
