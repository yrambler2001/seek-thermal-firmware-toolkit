/**
 * Argument parsing and command dispatch.
 *
 * Parsing is `node:util`'s `parseArgs` and nothing else — a CLI with five
 * commands and a couple of dozen flags does not need a framework. `parseCli` is
 * pure and exported so the tests can assert the whole flag surface without
 * running anything; `run` owns the process-shaped parts: streams, the abort
 * signal and the exit code.
 *
 * The commands mirror the web app's tabs, one each:
 *
 *   info        Info
 *   preserve    Dump & decrypt 0.x/1.x 2014/2016
 *   dump        Dump & decrypt 4.x/Nano
 *   decrypt     Decrypt File/Slot   (decrypt file <dump> | decrypt slot <file>)
 *   slots       Work with firmware slots
 *
 * A flag that a command does not use is refused for that command, not ignored:
 * `seek-fw dump --profile x` is a usage error, because a flag that silently does
 * nothing is how a person ends up believing they chose a family they did not.
 */

import { parseArgs } from 'node:util';
import {
  PRESERVE_BANK_CHOICES,
  getProfile,
  isPreserveBankChoice,
  type PreserveBankChoice,
  type ProfileId,
  type RecipientPreference,
  type UsbBackend,
} from '@seek-fw/core';
import type { BackendOptions } from './backend.js';
import { shouldColor } from './ansi.js';
import {
  CliError,
  describeError,
  EXIT_CANCELLED,
  EXIT_OK,
  EXIT_STOPPED,
  EXIT_USAGE,
  UsageError,
} from './errors.js';
import { TerminalReporter } from './reporter.js';
import type { Sink } from './sink.js';
import { isCommandName, usageFor, type CommandName } from './usage.js';
import { infoCommand } from './commands/info.js';
import { dumpCommand } from './commands/dump.js';
import { decryptCommand } from './commands/decrypt.js';
import { preserveCommand } from './commands/preserve.js';
import { slotsCommand } from './commands/slots.js';

/* ==================================================================== *
 * Options
 * ==================================================================== */

export interface GlobalOptions {
  readonly out: string | null;
  readonly zip: string | null;
  /** `--profile <id>`: a family named by hand. Read by `info`, `decrypt` and `slots`. */
  readonly profile: ProfileId | null;
  /**
   * Ask the camera which protocol it speaks before choosing a profile.
   *
   * On by default, and `--no-probe` turns it off. The probe is four read-only
   * transfers and it is the difference between choosing a family from a USB
   * product string and choosing it from the camera's own answers — see
   * `probeSelectorChannel`. Off is for a bench session that wants nothing sent
   * but the dump itself.
   */
  readonly probe: boolean;
  /** null means "core's default", which is the value the README documents. */
  readonly chunk: number | null;
  readonly gapFill: number | null;
  readonly retries: number | null;
  readonly retryDelayMs: number | null;
  readonly recipient: RecipientPreference;
  readonly serial: string | null;
  /** False when `--no-decrypt` was passed: dump the flash but skip decryption. */
  readonly decrypt: boolean;
  readonly json: boolean;
  readonly quiet: boolean;
  readonly verbose: boolean;
  /** False when `--no-color` was passed. The environment is consulted later. */
  readonly colorFlag: boolean;
  readonly yes: boolean;
  /* ---- info only -------------------------------------------------------- */
  /** `--devices`: list the connected cameras and open none. */
  readonly devices: boolean;
  /** `--profiles`: list the firmware families this build knows and open no camera. */
  readonly profiles: boolean;
  /* ---- dump only -------------------------------------------------------- */
  /** `--all-selectors`: probe every BeginFirmwareUpgrade selector instead of reading the map. */
  readonly allSelectors: boolean;
  /* ---- preserve only ---------------------------------------------------- */
  /** `--resume <dir>`: continue the run whose state lives in that directory. */
  readonly resume: string | null;
  /** `--from-step <id>`: with --resume, start at a chosen step. */
  readonly fromStep: string | null;
  /** `--print-state <dir>`: print a run's state and next step; touch no device. */
  readonly printState: string | null;
  /** `--backup-only`: run the read-only first step and stop. Nothing is written to the camera. */
  readonly backupOnly: boolean;
  /** `--bank <choice>`: which banks the run writes (default: the bank the next start enters). */
  readonly bank: PreserveBankChoice | null;
}

/**
 * The flags only `slots` reads. Parsed for every command, read by none but `slots`, the same way
 * the preserve-only options are.
 */
export interface SlotFlags {
  /** `--raw`: the file is prepared bytes, sent verbatim, not a decrypted image. */
  readonly raw: boolean;
  /** `--acknowledge-risk`: allows a write to the booted bank or to recovery. */
  readonly acknowledgeRisk: boolean;
  /** False when `--no-verify` was passed: skip the read-back after the commit. */
  readonly verify: boolean;
  /** `--dry-run`: build and print the flash plan, send nothing to the bank. */
  readonly dryRun: boolean;
  /**
   * `--running-16hz`: say the camera runs the 16 Hz FF 1.3.0.8 build. Read only when the camera's own
   * answers cannot say which build it runs; a wrong choice is refused by the camera before programming.
   */
  readonly running16Hz: boolean;
  /** `--write` (`slots patch-fps` only): send the patch. Without it the command is a dry run. */
  readonly write?: boolean;
  /** `--dump-dir <dir>` (`slots patch-fps`): where the pre-patch dump is saved before a write. */
  readonly dumpDir?: string | null;
}

export type ParsedCli =
  /* `json` rides along on all three: `--json` means "stdout is a JSON
   * document", and help and version are no exception. */
  | { readonly kind: 'help'; readonly command: CommandName | null; readonly json: boolean }
  | { readonly kind: 'version'; readonly json: boolean }
  | {
      readonly kind: 'run';
      readonly command: CommandName;
      /**
       * Every positional after the command word. `decrypt` reads its form (`file` or `slot`) and
       * its path from here; `slots` reads its subcommand, bank and file. The others take none.
       */
      readonly args: readonly string[];
      readonly slotFlags: SlotFlags;
      readonly options: GlobalOptions;
    };

const RECIPIENTS: readonly RecipientPreference[] = ['interface', 'device', 'auto'];

/**
 * Which commands each flag belongs to. A flag not listed for a command is refused there.
 * `--json`, `--quiet`, `--verbose`, `--no-color`, `--help` and `--version` are on every command and
 * so are not listed.
 */
const FLAG_COMMANDS: Readonly<Record<string, readonly CommandName[]>> = {
  out: ['preserve', 'dump', 'decrypt', 'slots'],
  zip: ['preserve', 'dump', 'decrypt', 'slots'],
  profile: ['info', 'decrypt', 'slots'],
  probe: ['info', 'dump', 'slots'],
  chunk: ['info', 'preserve', 'dump'],
  'gap-fill': ['info', 'dump'],
  retries: ['info', 'dump'],
  'retry-delay': ['info', 'dump'],
  recipient: ['info', 'preserve', 'dump', 'slots'],
  serial: ['info', 'preserve', 'dump', 'slots'],
  decrypt: ['dump'],
  yes: ['preserve', 'slots'],
  devices: ['info'],
  profiles: ['info'],
  'all-selectors': ['dump'],
  resume: ['preserve'],
  'from-step': ['preserve'],
  'print-state': ['preserve'],
  'backup-only': ['preserve'],
  bank: ['preserve'],
  raw: ['slots'],
  'acknowledge-risk': ['slots'],
  verify: ['slots'],
  'dry-run': ['slots'],
  'running-16hz': ['slots'],
  write: ['slots'],
  'dump-dir': ['slots'],
};

/** The commands that take no positional argument at all. */
const NO_POSITIONALS: ReadonlySet<CommandName> = new Set<CommandName>(['info', 'dump', 'preserve']);

/** The forms `decrypt` takes. */
const DECRYPT_FORMS: readonly string[] = ['file', 'slot'];

function parseInteger(name: string, text: string): number {
  if (!/^(0[xX][0-9a-fA-F]+|[0-9]+)$/.test(text.trim())) {
    throw new UsageError(`--${name} expects a number, got '${text}'`);
  }
  const value = Number(text.trim());
  if (!Number.isInteger(value)) throw new UsageError(`--${name} expects a whole number`);
  return value;
}

function bounded(name: string, value: number, min: number, max: number): number {
  if (value < min || value > max) {
    throw new UsageError(
      `--${name} must be between ${String(min)} and ${String(max)}, got ${String(value)}`,
    );
  }
  return value;
}

function validBankChoice(text: string): PreserveBankChoice {
  if (isPreserveBankChoice(text)) return text;
  throw new UsageError(
    `--bank takes ${PRESERVE_BANK_CHOICES.join(', ')}, got '${text}'`,
    'next-start is the bank the next start enters (the default); a, b and r name one bank; all ' +
      'is every bank that holds an image.',
  );
}

function validProfileId(id: string): ProfileId {
  try {
    return getProfile(id).id;
  } catch {
    throw new UsageError(`unknown profile '${id}'`, 'Run `seek-fw info --profiles` for the list.');
  }
}

/**
 * Refuses a flag the command does not use. Reads the flag names from argv itself, because
 * `parseArgs` cannot say which options were typed and which took their default.
 */
function refuseFlagsOutOfScope(command: CommandName, argv: readonly string[]): void {
  for (const token of argv) {
    if (token === '--') break;
    if (!token.startsWith('--')) continue;
    const typed = token.slice(2).split('=')[0] ?? '';
    const base = typed.startsWith('no-') ? typed.slice(3) : typed;
    const owners = FLAG_COMMANDS[base];
    if (owners === undefined || owners.includes(command)) continue;
    throw new UsageError(
      `--${typed} does not apply to '${command}'`,
      `Run \`seek-fw ${command} --help\` for the options '${command}' takes.`,
    );
  }
}

/**
 * Parses argv (WITHOUT the node and script entries).
 *
 * Every failure here is a `UsageError`, which the caller renders with the
 * usage text and exits 2 for — a malformed command line is never a silent
 * fallback to a default.
 */
export function parseCli(argv: readonly string[]): ParsedCli {
  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv],
      allowPositionals: true,
      allowNegative: true,
      strict: true,
      options: {
        out: { type: 'string' },
        zip: { type: 'string' },
        profile: { type: 'string' },
        chunk: { type: 'string' },
        'gap-fill': { type: 'string' },
        retries: { type: 'string' },
        'retry-delay': { type: 'string' },
        recipient: { type: 'string' },
        serial: { type: 'string' },
        decrypt: { type: 'boolean', default: true },
        json: { type: 'boolean', default: false },
        quiet: { type: 'boolean', default: false },
        verbose: { type: 'boolean', default: false },
        color: { type: 'boolean', default: true },
        yes: { type: 'boolean', default: false },
        probe: { type: 'boolean', default: true },
        devices: { type: 'boolean', default: false },
        profiles: { type: 'boolean', default: false },
        'all-selectors': { type: 'boolean', default: false },
        resume: { type: 'string' },
        'from-step': { type: 'string' },
        'print-state': { type: 'string' },
        'backup-only': { type: 'boolean', default: false },
        bank: { type: 'string' },
        raw: { type: 'boolean', default: false },
        'acknowledge-risk': { type: 'boolean', default: false },
        verify: { type: 'boolean', default: true },
        'dry-run': { type: 'boolean', default: false },
        'running-16hz': { type: 'boolean', default: false },
        write: { type: 'boolean', default: false },
        'dump-dir': { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'V', default: false },
      },
    });
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }

  const values = parsed.values;
  const positionals = parsed.positionals;
  const [commandWord, ...rest] = positionals;

  if (values.version) return { kind: 'version', json: values.json };

  if (commandWord === undefined) {
    if (values.help) return { kind: 'help', command: null, json: values.json };
    throw new UsageError('no command given');
  }
  if (!isCommandName(commandWord)) {
    throw new UsageError(`unknown command '${commandWord}'`);
  }
  if (values.help) return { kind: 'help', command: commandWord, json: values.json };

  refuseFlagsOutOfScope(commandWord, argv);

  if (NO_POSITIONALS.has(commandWord) && rest.length > 0) {
    throw new UsageError(`unexpected argument '${rest[0] ?? ''}' after '${commandWord}'`);
  }
  if (commandWord === 'decrypt') {
    const [form, path, ...extra] = rest;
    if (form === undefined) {
      throw new UsageError(
        'decrypt needs a form: file or slot',
        'seek-fw decrypt file <dump>  |  seek-fw decrypt slot <64 KiB bank file>',
      );
    }
    if (!DECRYPT_FORMS.includes(form)) {
      throw new UsageError(
        `decrypt takes 'file' or 'slot', got '${form}'`,
        `seek-fw decrypt file ${form}  decrypts a dump; seek-fw decrypt slot ${form}  decrypts one bank.`,
      );
    }
    if (path === undefined) throw new UsageError(`decrypt ${form} needs a file argument`);
    if (extra.length > 0) {
      throw new UsageError(`unexpected argument '${extra[0] ?? ''}' after 'decrypt ${form}'`);
    }
  }
  if (commandWord === 'info' && values.devices && values.profiles) {
    throw new UsageError('--devices and --profiles each list something; pass one of them');
  }

  const recipient = values.recipient ?? 'auto';
  if (!(RECIPIENTS as readonly string[]).includes(recipient)) {
    throw new UsageError(`--recipient must be one of ${RECIPIENTS.join(', ')}, got '${recipient}'`);
  }

  const options: GlobalOptions = {
    out: values.out ?? null,
    zip: values.zip ?? null,
    profile: values.profile === undefined ? null : validProfileId(values.profile),
    chunk:
      values.chunk === undefined
        ? null
        : bounded('chunk', parseInteger('chunk', values.chunk), 1, 0x10000),
    gapFill:
      values['gap-fill'] === undefined
        ? null
        : bounded('gap-fill', parseInteger('gap-fill', values['gap-fill']), 0, 0xff),
    retries:
      values.retries === undefined
        ? null
        : bounded('retries', parseInteger('retries', values.retries), 0, 100),
    retryDelayMs:
      values['retry-delay'] === undefined
        ? null
        : bounded('retry-delay', parseInteger('retry-delay', values['retry-delay']), 0, 600_000),
    recipient: recipient as RecipientPreference,
    serial: values.serial ?? null,
    decrypt: values.decrypt,
    json: values.json,
    quiet: values.quiet,
    verbose: values.verbose,
    probe: values.probe,
    /* `--no-color` and `--no-probe` come through parseArgs' own negation support, so each arrives
     * here already resolved. */
    colorFlag: values.color,
    yes: values.yes,
    devices: values.devices,
    profiles: values.profiles,
    allSelectors: values['all-selectors'],
    resume: values.resume ?? null,
    fromStep: values['from-step'] ?? null,
    printState: values['print-state'] ?? null,
    backupOnly: values['backup-only'],
    bank: values.bank === undefined ? null : validBankChoice(values.bank),
  };

  if (options.quiet && options.verbose) {
    throw new UsageError('--quiet and --verbose contradict each other');
  }

  return {
    kind: 'run',
    command: commandWord,
    args: rest,
    slotFlags: {
      raw: values.raw,
      acknowledgeRisk: values['acknowledge-risk'],
      verify: values.verify,
      dryRun: values['dry-run'],
      running16Hz: values['running-16hz'],
      write: values.write,
      dumpDir: values['dump-dir'] ?? null,
    },
    options,
  };
}

/* ==================================================================== *
 * Dispatch
 * ==================================================================== */

/** Everything a command may touch, so tests can drive one without a process. */
export interface Io {
  readonly stdout: Sink;
  readonly stderr: Sink;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly stdinIsTty: boolean;
  readonly platform: string;
  readonly version: string;
  /** Asks a yes/no question. Rejecting is up to the caller; false means no. */
  confirm(question: string): Promise<boolean>;
  now?(): Date;
  /**
   * Replaces USB discovery. Only the tests set it — they hand back core's own
   * fake camera, which is how every command below this line is exercised
   * without hardware.
   */
  backend?(options: BackendOptions): UsbBackend;
}

export interface CommandContext {
  readonly options: GlobalOptions;
  /**
   * Every positional after the command word: `decrypt`'s form and path, `slots`' subcommand,
   * bank and file. Optional, so a context built by hand for a command that takes none need not
   * carry it.
   */
  readonly args?: readonly string[];
  /** The `slots` flags. Optional for the same reason; absent means none was given. */
  readonly slotFlags?: SlotFlags;
  readonly reporter: TerminalReporter;
  readonly io: Io;
  readonly signal: AbortSignal;
  /** False under `--json`, where stdout belongs to the JSON document. */
  readonly human: boolean;
  /** Writes a line of result text (not a log line): never suppressed by --quiet. */
  out(text: string): void;
  /** Colours text, honouring --no-color / NO_COLOR / a non-tty stdout. */
  readonly color: boolean;
}

/**
 * A command returns the object that `--json` prints.
 *
 * One key is a contract rather than data: `cancelled: true` means the run was
 * interrupted and what it produced is PARTIAL. The output is still written and
 * still printed — core stops a dump where it is and hands back everything it
 * read — but the process exits 130, so no script mistakes a partial archive
 * for a finished one.
 */
export type CommandResult = Record<string, unknown>;

export type Command = (ctx: CommandContext) => Promise<CommandResult>;

const COMMANDS: Record<CommandName, Command> = {
  info: infoCommand,
  preserve: preserveCommand,
  dump: dumpCommand,
  decrypt: decryptCommand,
  slots: slotsCommand,
};

/**
 * The one JSON document `--json` is allowed to put on stdout.
 *
 * Every `--json` path goes through here, so "exactly one document per run" is
 * a property of the code and not of a convention four call sites remember.
 */
function emitJson(stdout: Sink, document: Record<string, unknown>): void {
  stdout.write(`${JSON.stringify(document, null, 2)}\n`);
}

/**
 * Runs one command line and returns the process exit code.
 *
 * Stream policy, which the `--json` contract depends on: under `--json`
 * stdout carries exactly one JSON document and every human line goes to
 * stderr; otherwise human output goes to stdout. The progress bar is always on
 * stderr, so `seek-fw dump --json > run.json` still shows progress.
 */
export async function run(argv: readonly string[], io: Io, signal: AbortSignal): Promise<number> {
  let parsed: ParsedCli;
  try {
    parsed = parseCli(argv);
  } catch (error) {
    const described = describeError(error, io.platform);
    /* `--json` is read straight off argv here because parsing is what failed.
     * Without this, a usage error was the one outcome that wrote nothing to
     * stdout, so `seek-fw … --json | jq` broke on a typo'd flag while every
     * other failure produced a readable error document. */
    if (argv.includes('--json')) {
      emitJson(io.stdout, {
        command: null,
        ok: false,
        error: {
          code: 'cli/usage',
          message: described.message,
          ...(described.hint === undefined ? {} : { hint: described.hint }),
        },
      });
    }
    io.stderr.write(`${usageFor(null)}\n`);
    io.stderr.write(`error: ${described.message}\n`);
    if (described.hint !== undefined) io.stderr.write(`${described.hint}\n`);
    return EXIT_USAGE;
  }

  /* `--help` and `--version` are documents under `--json` like everything
   * else. The alternative — two commands whose stdout is prose no matter what
   * was asked for — is the one exception that makes `seek-fw ... --json | jq`
   * unsafe to write in a script. */
  if (parsed.kind === 'version') {
    if (parsed.json) emitJson(io.stdout, { command: null, ok: true, version: io.version });
    else io.stdout.write(`${io.version}\n`);
    return EXIT_OK;
  }
  if (parsed.kind === 'help') {
    if (parsed.json) {
      emitJson(io.stdout, { command: parsed.command, ok: true, help: usageFor(parsed.command) });
    } else {
      io.stdout.write(usageFor(parsed.command));
    }
    return EXIT_OK;
  }

  const { options, command, args, slotFlags } = parsed;
  const logSink = options.json ? io.stderr : io.stdout;
  const color = shouldColor({
    noColorFlag: !options.colorFlag,
    isTty: logSink.isTty,
    env: io.env,
  });
  const reporter = new TerminalReporter({
    log: logSink,
    progress: io.stderr,
    color,
    quiet: options.quiet,
    verbose: options.verbose,
  });

  const ctx: CommandContext = {
    options,
    args,
    slotFlags,
    reporter,
    io,
    signal,
    human: !options.json,
    color,
    out(text: string): void {
      /* --quiet means quiet: the exit code and, with --json, the document are
       * what a script reads. */
      if (!options.quiet) reporter.write(text);
    },
  };

  try {
    const result = await COMMANDS[command](ctx);
    reporter.finish();
    const cancelled = result.cancelled === true;
    if (options.json) emitJson(io.stdout, { command, ok: !cancelled, ...result });
    if (cancelled) {
      io.stderr.write('\ninterrupted — what had been read was saved; the result is partial\n');
      return EXIT_CANCELLED;
    }
    /* A planned stop is said by the command itself, once; its status tells it from a failure. */
    if (result.stopped !== undefined && result.stopped !== null) return EXIT_STOPPED;
    return EXIT_OK;
  } catch (error) {
    reporter.finish();
    const described = describeError(error, io.platform);
    if (options.json) {
      emitJson(io.stdout, {
        command,
        ok: false,
        error: {
          code: described.code,
          message: described.message,
          ...(described.hint === undefined ? {} : { hint: described.hint }),
        },
      });
    }
    if (described.cancelled) {
      io.stderr.write('\ninterrupted\n');
      return described.exitCode;
    }
    io.stderr.write(`error: ${described.message}\n`);
    if (described.hint !== undefined) io.stderr.write(`\n${described.hint}\n`);
    if (options.verbose && error instanceof Error && error.stack !== undefined) {
      io.stderr.write(`\n${error.stack}\n`);
    }
    if (error instanceof CliError && error.code === 'cli/usage') {
      io.stderr.write(`\n${usageFor(command)}`);
    }
    return described.exitCode;
  }
}
