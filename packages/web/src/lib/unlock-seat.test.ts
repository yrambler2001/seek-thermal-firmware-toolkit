/* The unlock flag's rules, without React (TESTING.md 42.59). The hook-level tests are in
 * hooks/usePreservePanel.adoption.test.tsx, against the real useDevice. */
import { describe, expect, it } from 'vitest';
import { UnlockSeat } from './unlock-seat';

describe('UnlockSeat: one flag for the connected camera', () => {
  it('is not set until a session on this connection sends the token', () => {
    const seat = new UnlockSeat();
    const session = {};
    seat.opened(session);
    expect(seat.unlocked).toBe(false);
    seat.markUnlocked(session);
    expect(seat.unlocked).toBe(true);
  });

  it('is shared: any session on the connection sets it, and it reads the same for every panel', () => {
    const seat = new UnlockSeat();
    const slots = {};
    const dump = {};
    seat.opened(slots);
    seat.opened(dump);
    seat.markUnlocked(dump);
    /* the flag is one value: a later read from another panel's handle sees the same thing */
    expect(seat.unlocked).toBe(true);
    seat.markUnlocked(slots);
    expect(seat.unlocked).toBe(true);
  });

  it('calls onChange once when the flag is set, and not again for a second mark', () => {
    let changes = 0;
    const seat = new UnlockSeat(() => {
      changes += 1;
    });
    const a = {};
    const b = {};
    seat.opened(a);
    seat.opened(b);
    seat.markUnlocked(a);
    seat.markUnlocked(b);
    expect(changes).toBe(1);
  });

  it('a session that was never marked does not set it', () => {
    const seat = new UnlockSeat();
    seat.opened({});
    expect(seat.unlocked).toBe(false);
  });

  it('a power cycle (the camera leaves outside the reset window) clears it', () => {
    const seat = new UnlockSeat();
    const session = {};
    seat.opened(session);
    seat.markUnlocked(session);
    seat.left();
    expect(seat.unlocked).toBe(false);
  });

  it('a swap or a forget clears it (changed)', () => {
    const seat = new UnlockSeat();
    const session = {};
    seat.opened(session);
    seat.markUnlocked(session);
    seat.changed();
    expect(seat.unlocked).toBe(false);
  });

  it("inside the wizard's reset window the camera leaving keeps the flag, and a session opened in the window still counts", () => {
    const seat = new UnlockSeat();
    const before = {};
    seat.opened(before);
    seat.setResetWindow(true);
    seat.markUnlocked(before);
    seat.left(); /* the reset: the camera drops off the bus */
    expect(seat.unlocked).toBe(true);

    /* the re-enumerated camera: the ladder opens a session on the same connection */
    const after = {};
    seat.opened(after);
    seat.markUnlocked(after);
    seat.setResetWindow(false);
    expect(seat.unlocked).toBe(true);
  });

  it('after the window closes, the same drop is a power cycle and clears the flag', () => {
    const seat = new UnlockSeat();
    const session = {};
    seat.opened(session);
    seat.setResetWindow(true);
    seat.markUnlocked(session);
    seat.setResetWindow(false);
    seat.left(); /* the replug the drain asks for, after its reset window */
    expect(seat.unlocked).toBe(false);
  });

  it('a session opened before a power cycle cannot set the flag on the next connection', () => {
    const seat = new UnlockSeat();
    const stale = {};
    seat.opened(stale);
    seat.left(); /* the camera was power-cycled while this session was still open */
    seat.markUnlocked(stale);
    expect(seat.unlocked).toBe(false);
    /* a session on the new connection sets it, as usual */
    const fresh = {};
    seat.opened(fresh);
    seat.markUnlocked(fresh);
    expect(seat.unlocked).toBe(true);
  });

  it('a session opened before a swap cannot set the flag on the camera that replaced it', () => {
    const seat = new UnlockSeat();
    const old = {};
    seat.opened(old);
    seat.changed(); /* a different camera is now held */
    seat.markUnlocked(old);
    expect(seat.unlocked).toBe(false);
  });
});
