/**
 * The page's one unlock flag for the connected camera (TESTING.md 42.59).
 *
 * Once a session on the page sends the unlock token, the camera stays unlocked until its next power cycle (42.41,
 * 42.55). Every panel that talks to the camera shows the note, so the flag is held with the device seat in
 * `useDevice`, and these are its rules, kept apart from React so they can be tested directly.
 *
 * What the page can tell, and what it cannot. A camera that leaves the bus and comes back is seen through the USB
 * connect and disconnect events, and those events do not say why it left. A power cycle, a replug and the wizard's
 * own reset (a command that re-enumerates the same unit) all look like a disconnect and a connect with the same
 * vid/pid, and this camera has no serial string. So the rules below do not guess the cause. They use what the page
 * knows about its own actions:
 *  - the wizard's reset window: the wizard sends the reset itself and expects the re-enumeration, so the camera
 *    leaving inside that window keeps the flag;
 *  - anywhere else, a camera leaving the bus clears it, because it is a power cycle or a replug;
 *  - a swap (a second camera while one is held, another model, or a forgotten device) clears it;
 *  - a session counts only on the connection it was opened on, so a session that outlived its camera cannot mark
 *    the next one.
 * The blind spot: inside the wizard's reset window a physical unplug cannot be told from the reset, so the flag
 * stays. The replug the wizard asks for comes after its reset window has closed, so that one clears.
 */
export class UnlockSeat {
  /** Bumped whenever the connection changes for good, so a session from an earlier one no longer counts. */
  private epoch = 0;
  /** The epoch in which a session sent the token, or null. */
  private unlockedIn: number | null = null;
  /** The epoch each session's transport was opened in. */
  private readonly openedIn = new WeakMap<object, number>();
  private resetWindow = false;
  private readonly onChange: () => void;

  constructor(onChange: () => void = () => undefined) {
    this.onChange = onChange;
  }

  /** True once a session on this connection sent the token, until the camera is swapped or power-cycled. */
  get unlocked(): boolean {
    return this.unlockedIn === this.epoch;
  }

  /** A session was opened on `transport`, on the connection that is current now. */
  opened(transport: object): void {
    this.openedIn.set(transport, this.epoch);
  }

  /**
   * The session on `transport` sent the token. Counted only when that session was opened on the connection that is
   * still current: a session from before a power cycle or a swap says nothing about the camera now.
   */
  markUnlocked(transport: object): void {
    if (this.openedIn.get(transport) !== this.epoch) return;
    if (this.unlockedIn === this.epoch) return;
    this.unlockedIn = this.epoch;
    this.onChange();
  }

  /** The camera left the bus: a power cycle or a replug, unless the wizard's own reset is expected. */
  left(): void {
    if (this.resetWindow) return;
    this.changed();
  }

  /** The connection changed for good: a swap, another model, or a forgotten device. The flag clears. */
  changed(): void {
    this.epoch += 1;
    this.onChange();
  }

  /** Opens or closes the wizard's reset window (see the note at the top). */
  setResetWindow(open: boolean): void {
    this.resetWindow = open;
  }
}
