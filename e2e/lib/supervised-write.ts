/**
 * The gate every flash-writing flow on the REAL camera must pass. On the
 * emulator target there is nothing to gate — writing is the point — so it waves
 * through. On the camera target it is deliberately hard to pass, and impossible
 * to pass by accident or in CI:
 *
 *   1. the env switch `SEEK_E2E_WRITE=i-understand` must be set;
 *   2. the session must be interactive — a real TTY to ask on;
 *   3. `CI` must not be set;
 *   4. a human must type back the challenge shown (the camera's firmware
 *      version and the sha256 of the image read THIS run), within a timeout.
 *
 * WHICH TTY. A spec runs in a vitest worker, and vitest 5 forks its workers
 * with `stdio: 'pipe'`: their stdin and stdout are pipes to the main process,
 * never a TTY, even for a person typing at one. Asked there, the gate refused
 * everyone, the person included. It asks on the controlling terminal instead
 * (`/dev/tty`), the one `npm run e2e:write` was typed into, which a worker
 * shares with its parent. A process started without one (CI, a scheduler, an
 * agent's shell) cannot open it, and the gate refuses as before.
 *
 * `SEEK_E2E_WRITE=dry-run` is the third state: everything up to the first write
 * runs, and the gate then stops the flow (`approved: false, dry: true`) before
 * a single write RPC — the way the camera target's write flow is proven without
 * writing. Any other value, or none, is a hard refusal.
 *
 * This module decides ONLY whether a write may proceed. The other guards (the
 * vendor-id device pick, the page-side write guard, the expected RPC sequence)
 * live where they always do and are never relaxed here.
 */

import { closeSync, openSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { isatty, ReadStream, WriteStream } from 'node:tty';

import { say } from './browser.js';

export interface WriteApproval {
  readonly approved: boolean;
  /** True when the flow should run right up to, and stop before, the first write. */
  readonly dry: boolean;
  readonly reason: string;
}

export interface WriteChallenge {
  /** What the operator must type back, e.g. `1.3.0.0:40447c7e`. */
  readonly token: string;
  /** Shown to the operator in full. */
  readonly describe: string;
}

const APPROVED_SAFE: WriteApproval = { approved: true, dry: false, reason: 'emulator target' };

/** A terminal to ask on: what the person reads, and what they type. */
export interface Terminal {
  readonly input: NodeJS.ReadableStream;
  readonly output: NodeJS.WritableStream;
  close(): void;
}

/**
 * The person's terminal: the controlling terminal, opened directly, or null
 * when this process has none or it is not a TTY.
 */
export function controllingTerminal(): Terminal | null {
  let inFd: number;
  try {
    inFd = openSync('/dev/tty', 'r');
  } catch {
    return null; /* ENXIO: no controlling terminal */
  }
  if (!isatty(inFd)) {
    closeSync(inFd);
    return null;
  }
  const input = new ReadStream(inFd);
  const output = new WriteStream(openSync('/dev/tty', 'w'));
  return {
    input,
    output,
    close: () => {
      input.destroy();
      output.destroy();
    },
  };
}

/**
 * The gate for a write flow on `target`. `challenge()` is called only once the
 * static checks pass, so it can read the camera first (version, image sha).
 */
export async function approveWrite(
  targetName: 'emu' | 'camera',
  challenge: () => Promise<WriteChallenge>,
  options: {
    readonly timeoutMs?: number;
    /** Where to ask: the controlling terminal. The gate's own tests pass
     *  another (none, or a scripted one); a run never does. */
    readonly terminal?: () => Terminal | null;
  } = {},
): Promise<WriteApproval> {
  if (targetName === 'emu') return APPROVED_SAFE;

  const mode = process.env.SEEK_E2E_WRITE ?? '';
  if (mode !== 'i-understand' && mode !== 'dry-run') {
    return {
      approved: false,
      dry: false,
      reason:
        'a camera write needs SEEK_E2E_WRITE=i-understand (or =dry-run to rehearse) — refusing',
    };
  }
  /* A dry run never writes, so it needs neither a TTY nor a non-CI session: it
   * is exactly the non-interactive rehearsal, and it runs the whole flow up to
   * the first write before stopping. */
  if (mode === 'dry-run') {
    const c = await challenge();
    return {
      approved: false,
      dry: true,
      reason: `dry run: everything up to the first write ran; ${c.describe}`,
    };
  }

  if (process.env.CI !== undefined && process.env.CI !== '') {
    return { approved: false, dry: false, reason: 'CI is set — a camera write never runs in CI' };
  }
  const terminal = (options.terminal ?? controllingTerminal)();
  if (terminal === null) {
    return {
      approved: false,
      dry: false,
      reason:
        'there is no terminal to ask on: this process has no controlling TTY, and a vitest ' +
        "worker's stdin/stdout is not a TTY — a camera write needs an interactive confirmation",
    };
  }
  try {
    const c = await challenge();
    say(`\nABOUT TO WRITE THE REAL CAMERA'S FLASH.\n${c.describe}`);
    terminal.output.write(`\nABOUT TO WRITE THE REAL CAMERA'S FLASH.\n${c.describe}\n`);
    const typed = await prompt(
      terminal,
      `Type exactly "${c.token}" to proceed (anything else cancels): `,
      options.timeoutMs ?? 120_000,
    );
    if (typed !== c.token) {
      return {
        approved: false,
        dry: false,
        reason: `confirmation did not match (${JSON.stringify(typed)})`,
      };
    }
    return { approved: true, dry: false, reason: 'confirmed at the terminal' };
  } finally {
    terminal.close();
  }
}

function prompt(terminal: Terminal, question: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: terminal.input, output: terminal.output });
    const timer = setTimeout(() => {
      rl.close();
      resolve('');
    }, timeoutMs);
    rl.question(question, (answer) => {
      clearTimeout(timer);
      rl.close();
      resolve(answer.trim());
    });
  });
}
