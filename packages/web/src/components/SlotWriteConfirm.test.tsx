/**
 * The slot page's confirmation. Same bar as the flash view's: a real modal, the
 * original's words, Cancel first, one deliberate press. The one addition is the
 * checkbox a booted or recovery bank needs, which must be ticked before the
 * confirm can be pressed, and which is what goes to the write.
 */

import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SlotWriteConfirm, type SlotWriteConfirmProps } from './SlotWriteConfirm';
import { buttonByText, render } from '../test-helpers';

function setup(
  overrides: Partial<Pick<SlotWriteConfirmProps, 'risk' | 'open' | 'ffImage' | 'targetEmpty'>> = {},
): ReturnType<typeof render> & {
  onConfirm: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
} {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const handle = render(
    <SlotWriteConfirm
      open={overrides.open ?? true}
      fileName="fw_decrypted.bin"
      slotName="slot B"
      slotAddress="0x14060000"
      risk={overrides.risk ?? { booted: false, recovery: false, bootUnnamed: false }}
      {...(overrides.ffImage === undefined ? {} : { ffImage: overrides.ffImage })}
      targetEmpty={overrides.targetEmpty ?? false}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { ...handle, onConfirm, onCancel };
}

function dialog(): HTMLElement {
  const node = document.body.querySelector<HTMLElement>('[role="alertdialog"]');
  if (node === null) throw new Error('no alert dialog is open');
  return node;
}

function checkbox(): HTMLInputElement | null {
  return document.body.querySelector<HTMLInputElement>('#slot-write-ack');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SlotWriteConfirm', () => {
  it('states the write in the same words as the flash view, and names the bank', () => {
    const { unmount } = setup();
    const node = dialog();
    expect(node.textContent).toContain('Write fw_decrypted.bin to slot B at 0x14060000?');
    expect(node.textContent).toContain(
      "This erases a 64 KiB block of the camera's flash and programs it at slot B.",
    );
    expect(node.textContent).toContain(
      'If the image does not run, the camera cannot be recovered over USB — only with SWD/J-Link or an SPI programmer.',
    );
    expect(node.textContent).toContain('No reset is sent.');
    unmount();
  });

  it('says an empty bank holds no image, so no firmware is overwritten, and that the block is still erased and programmed', () => {
    const { unmount } = setup({ targetEmpty: true });
    const node = dialog();
    expect(node.textContent).toContain(
      'slot B is empty: it holds no image, so no firmware is overwritten.',
    );
    expect(node.textContent).toContain(
      "The write still erases the 64 KiB block of the camera's flash at slot B (already blank) and programs it.",
    );
    /* The rest of the words are the same. */
    expect(node.textContent).toContain('No reset is sent.');
    expect(node.textContent).toContain('only with SWD/J-Link or an SPI programmer.');
    unmount();
  });

  it('says nothing about emptiness for a bank that holds an image', () => {
    const { unmount } = setup({ targetEmpty: false });
    expect(dialog().textContent).not.toContain('is empty');
    unmount();
  });

  it('an empty bank gets no exemption from the tick: recovery, or an unnamed boot, still needs it', () => {
    const recovery = setup({
      targetEmpty: true,
      risk: { booted: false, recovery: true, bootUnnamed: false },
    });
    expect(checkbox()).not.toBeNull();
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    recovery.unmount();

    const { onConfirm, unmount } = setup({
      targetEmpty: true,
      risk: { booted: false, recovery: false, bootUnnamed: true },
    });
    expect(checkbox()).not.toBeNull();
    act(() => {
      checkbox()?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('asks for no checkbox on a standby bank, and confirms with one press', () => {
    const { onConfirm, onCancel, unmount } = setup();
    expect(checkbox()).toBeNull();
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(false);
    expect(onCancel).not.toHaveBeenCalled();
    unmount();
  });

  it('lands focus on Cancel, never on the confirm', () => {
    const { unmount } = setup();
    expect(document.activeElement).toBe(buttonByText(document.body, 'Cancel'));
    expect(document.activeElement).not.toBe(buttonByText(document.body, 'Yes — write to slot B'));
    unmount();
  });

  it('backs out on Escape and on Cancel without writing', () => {
    const first = setup();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(first.onCancel).toHaveBeenCalledTimes(1);
    expect(first.onConfirm).not.toHaveBeenCalled();
    first.unmount();

    const second = setup();
    act(() => {
      buttonByText(document.body, 'Cancel').click();
    });
    expect(second.onCancel).toHaveBeenCalledTimes(1);
    expect(second.onConfirm).not.toHaveBeenCalled();
    second.unmount();
  });

  it('asks for the tick when the camera names no booted bank, and says why', () => {
    const { onConfirm, unmount } = setup({
      risk: { booted: false, recovery: false, bootUnnamed: true },
    });
    expect(checkbox()).not.toBeNull();
    expect(dialog().textContent).toContain('does not say which bank it boots');
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);

    act(() => {
      checkbox()?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('keeps the confirm off until the booted-bank checkbox is ticked', () => {
    const { onConfirm, unmount } = setup({
      risk: { booted: true, recovery: false, bootUnnamed: false },
    });
    const confirm = buttonByText(document.body, 'Yes — write to slot B');
    expect(confirm.disabled).toBe(true);
    expect(dialog().textContent).toContain('slot B is the bank the camera boots now.');

    act(() => {
      checkbox()?.click();
    });
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(false);

    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('asks the same tick for the recovery bank, with its own words', () => {
    const { unmount } = setup({ risk: { booted: false, recovery: true, bootUnnamed: false } });
    expect(dialog().textContent).toContain('the last-resort copy the bootloader falls back to');
    expect(checkbox()).not.toBeNull();
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    unmount();
  });

  it('says the 1.3.0.8 FF image is stored under Key B and that its boot is untested, and still asks for the tick', () => {
    const { onConfirm, unmount } = setup({
      risk: { booted: false, recovery: true, bootUnnamed: false },
      ffImage: true,
    });
    const text = dialog().textContent;
    expect(text).toContain('This is the 1.3.0.8 FF (16 Hz) image,');
    expect(text).toContain('the camera stores it under Key B');
    expect(text).toContain('UNTESTED');
    expect(text).toContain('XOR Key A');
    expect(checkbox()).not.toBeNull();
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    act(() => {
      checkbox()?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('keeps the FF explanation out of every other write', () => {
    const { unmount } = setup({ risk: { booted: false, recovery: true, bootUnnamed: false } });
    expect(dialog().textContent).not.toContain('1.3.0.8 FF');
    unmount();
  });

  it('clears the tick on the way out, so the next write asks again', () => {
    /* The page keeps this dialog mounted and only toggles `open`, so the tick
     * has to be reset by the dialog itself, not by a fresh mount. */
    const onConfirm = vi.fn();
    function Harness(): ReturnType<typeof SlotWriteConfirm> {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            reopen
          </button>
          <SlotWriteConfirm
            open={open}
            fileName="fw_decrypted.bin"
            slotName="slot B"
            slotAddress="0x14060000"
            risk={{ booted: true, recovery: false, bootUnnamed: false }}
            onConfirm={(acknowledged) => {
              onConfirm(acknowledged);
              setOpen(false);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </>
      );
    }
    const { container, unmount } = render(<Harness />);
    act(() => {
      checkbox()?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);

    act(() => {
      buttonByText(container, 'reopen').click();
    });
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    expect(checkbox()?.checked).toBe(false);
    unmount();
  });

  it('stays out of the document until it is opened', () => {
    const { unmount } = setup({ open: false });
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
    unmount();
  });
});

describe('the key line of the confirmation', () => {
  it('says which key the image is written under, and from which booted bank, when the plan is derived', () => {
    const handle = render(
      <SlotWriteConfirm
        open
        fileName="fw_decrypted.bin"
        slotName="slot B"
        slotAddress="0x14050000"
        risk={{ booted: false, recovery: false, bootUnnamed: false }}
        keyLine="The image is written under Key B, derived from the booted bank A. Every other bank is written the same way."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(dialog().textContent).toContain('derived from the booted bank A');
    expect(dialog().textContent).toContain('Every other bank is written the same way.');
    handle.unmount();
  });

  it('says nothing about a key when the plan carries none', () => {
    const handle = render(
      <SlotWriteConfirm
        open
        fileName="raw.bin"
        slotName="slot B"
        slotAddress="0x14050000"
        risk={{ booted: false, recovery: false, bootUnnamed: false }}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(dialog().textContent).not.toContain('derived from the booted bank');
    handle.unmount();
  });
});
