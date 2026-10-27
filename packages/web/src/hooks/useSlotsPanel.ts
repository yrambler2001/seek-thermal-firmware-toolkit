/**
 * The slot page's state: read the three banks, dump one, and write one: a decrypted image or raw bytes from
 * a file, another bank's image (copy), the bank as a full flash backup holds it (restore), or the frame-rate
 * patch of one bank or of every bank.
 *
 * Five rules this hook holds. Three are the flash view's, for one camera; the other two are specific to banks.
 *
 *  - A report is ONE camera's. It is dropped whenever the device changes, so a
 *    write planned against one unit can never reach another.
 *  - A prepared write is only sent while the report it was built from is still
 *    the current one: the payload was checked against what that bank held.
 *  - Once a write or a patch is committed the report is dropped: the bank may have
 *    changed. The banks are read again after the read-back, so the table is a fresh
 *    picture of the camera, never the read from before the commit. A write that stops
 *    before its commit was sent changed nothing, and keeps the read (TESTING.md 42.91 C).
 *  - Every write saves its target bank first, as one zip download (core's backup, owner 2026-10-26):
 *    core refuses the write before anything is sent unless the download was started.
 *  - A build the slot plan does not support is never read. The plan comes from
 *    the camera's own version answer, and a build older than 0.8.0.0 is
 *    reported and left alone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CancelledError,
  SeekDevice,
  SeekError,
  buildSlotPlan,
  copySourceRefusal,
  dumpSlot,
  errorMessage,
  flashSlotWithBackup,
  fpsEveryBankPlan,
  fpsPlanOfBank,
  fullFlashOf,
  hexUp,
  inspectSlots,
  patchBankFps,
  patchEveryBankFps,
  planSlotCopy,
  planSlotRestore,
  prepareSlotFlash,
  restoreReadBack,
  restoreReadBackText,
  slotDumpNames,
  stagingPhrase,
  type FpsEveryBankPlan,
  type FpsEveryBankResult,
  type FpsPatchOptions,
  type FpsPatchResult,
  type FpsPlan,
  type DumpedSlot,
  type FirmwareProfile,
  type InspectFirmware,
  type LogLevel,
  type Reporter,
  type RestoreReadBack,
  type SaveBackup,
  type SlotCopyPlan,
  type SlotEntry,
  type SlotFlashInput,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotPlan,
  type SlotRestorePlan,
  type SlotView,
  type SlotWriteOptions,
  type SlotWriteResult,
  type SlotsReport,
  type Support,
  type WorkflowContext,
  type WriteAction,
  type WriteBackup,
} from '@seek-fw/core';
import { backupDownloadLines, saveBackupAsDownload } from '../lib/backup-save';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { downloadBytes } from '../lib/download';
import { logHint } from '../lib/hints';
import { chooseActingProfile, refusalOf, type ActingProfile, type Refusal } from '../lib/identify';
import {
  asOptionsFailure,
  readOptions,
  type OptionsFailure,
  type OptionsForm,
} from '../lib/options';
import { useReporter, type ReporterHandle } from './useReporter';
import type { DeviceHandle } from './useDevice';
import type { Runner } from './useRunner';

export const SLOTS_READ_PANEL_ID = 'slots-read';
export const SLOTS_DUMP_PANEL_ID = 'slots-dump';
export const SLOTS_PREPARE_PANEL_ID = 'slots-prepare';
export const SLOTS_FLASH_PANEL_ID = 'slots-flash';
export const SLOTS_FPS_PANEL_ID = 'slots-fps';

/**
 * Everything the page asks of the slot workflows, so a test can answer each
 * question without a camera. The defaults are core's own functions.
 */
export interface SlotsBackend {
  /** The frame-rate plan for one bank, from its own image. Pure. Core's by default. */
  readonly fpsPlan?: (report: SlotsReport, key: SlotKey) => FpsPlan;
  /** Patches one bank (core `patchBankFps`). Core's by default. */
  readonly patchFps?: (
    ctx: WorkflowContext,
    report: SlotsReport,
    key: SlotKey,
    options: FpsPatchOptions,
  ) => Promise<FpsPatchResult>;
  /** Patches every bank that offers it (core `patchEveryBankFps`). Core's by default. */
  readonly patchEveryFps?: (
    ctx: WorkflowContext,
    report: SlotsReport,
    options: FpsPatchOptions,
  ) => Promise<FpsEveryBankResult>;
  /** Saves the backup zip a write saves first. Resolves true once the download was started. */
  readonly saveBackup?: SaveBackup;
  /** Plans a copy of one bank's image into another (core `planSlotCopy`). Pure. Core's by default. */
  readonly copy?: (report: SlotsReport, from: SlotKey, to: SlotKey) => SlotCopyPlan;
  /** Plans a restore of one bank from a full flash backup file (core `fullFlashOf` + `planSlotRestore`). */
  readonly restore?: (
    report: SlotsReport,
    key: SlotKey,
    file: { readonly bytes: Uint8Array; readonly name: string },
  ) => Promise<SlotRestorePlan>;
  /** Asks the camera which build it runs and which family to act under. Read-only. */
  readonly identify: (
    device: SeekDevice,
    log: (text: string, level: LogLevel) => void,
  ) => Promise<ActingProfile>;
  readonly plan: (profile: FirmwareProfile, firmwareVersion: string | null) => SlotPlan;
  /**
   * Reads the banks. `firmware` is the build the identify step has just read on
   * this camera, so the reader does not ask for it a second time.
   */
  readonly inspect: (ctx: WorkflowContext, firmware?: InspectFirmware) => Promise<SlotsReport>;
  readonly dump: (ctx: WorkflowContext, report: SlotsReport, key: SlotKey) => Promise<DumpedSlot>;
  /** Pure: builds the payload and sends nothing. */
  readonly prepare: (report: SlotsReport, key: SlotKey, input: SlotFlashInput) => SlotFlashPlan;
  /** Saves the target bank first, then writes it and reads it back (core `flashSlotWithBackup`). */
  readonly write: (
    ctx: WorkflowContext,
    report: SlotsReport,
    plan: SlotFlashPlan,
    options: SlotWriteOptions,
  ) => Promise<SlotWriteResult>;
}

export const CORE_SLOTS_BACKEND: SlotsBackend = {
  identify: (device, log) => chooseActingProfile(device, 'read the device info', log),
  plan: (profile, firmwareVersion) => buildSlotPlan(profile, firmwareVersion),
  inspect: (ctx, firmware) => inspectSlots(ctx, firmware === undefined ? {} : { firmware }),
  dump: (ctx, report, key) => dumpSlot(ctx, report, key),
  prepare: (report, key, input) => prepareSlotFlash(report, key, input),
  write: (ctx, report, plan, options) => flashSlotWithBackup(ctx, report, plan, options),
  fpsPlan: (report, key) => fpsPlanOfBank(report, key),
  patchFps: (ctx, report, key, options) => patchBankFps(ctx, report, key, options),
  patchEveryFps: (ctx, report, options) => patchEveryBankFps(ctx, report, options),
  saveBackup: (backup) => saveBackupAsDownload(backup),
  copy: (report, from, to) => planSlotCopy(report, from, to),
  restore: async (report, key, file) =>
    planSlotRestore(report, key, await fullFlashOf(file.bytes, file.name)),
};

/* ---- pure helpers, exported for the tests ----------------------------- */

/**
 * Why writing a bank needs an explicit acknowledgement: it is the bank the
 * camera boots now, or it is recovery, or the camera does not say which bank it
 * boots (then every bank counts as the booted one: the core refuses the write
 * without the acknowledgement, `write.ts` ackNeeded). Each one is a bank whose
 * loss the camera cannot route around, so the page asks for the extra tick.
 */
export interface WriteRisk {
  readonly booted: boolean;
  readonly recovery: boolean;
  /** The camera names no booted bank, so this bank is treated as the booted one. */
  readonly bootUnnamed: boolean;
}

export function writeRisk(report: SlotsReport, key: SlotKey): WriteRisk {
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  return {
    booted: view?.active === true,
    recovery: key === 'r',
    bootUnnamed: report.state.boot === null,
  };
}

export function needsRiskAck(risk: WriteRisk): boolean {
  return risk.booted || risk.recovery || risk.bootUnnamed;
}

/**
 * The run log's one record of the replug a write or a patch owes. The result panel under the table gives the
 * instruction, in capitals, and the status line says how the write ended without repeating it: after one
 * patch on a Compact PRO 1.0.3.0 the request was on the page three times (TESTING.md 42.85 O1, 42.86). The
 * log keeps this one line, because a pasted log is the record of the run.
 */
export function replugRecord(what: 'write' | 'patch'): string {
  return (
    `Unplug and replug the camera: no reset was sent, so the ${what} takes effect only at the next ` +
    'start. Then read the slots again: the version and the booted bank the camera reports settle it.'
  );
}

/** The status line after a write: how it ended. The result panel says what to do next. */
export function writtenStatus(verified: boolean | null): string {
  if (verified === false) return 'Written, but the read-back does not match — see the result.';
  if (verified === true) return 'Written. The bank reads back as written.';
  return 'Written. The read-back was not compared — see the result.';
}

/** The status line after a frame-rate patch: how it ended. The result panel says what to do next. */
export function patchedStatus(readBackOk: boolean | null): string {
  if (readBackOk === false) {
    return 'Patched, but the read-back does not differ only as planned — see the result.';
  }
  if (readBackOk === true) return 'Patched. The bank reads back as planned.';
  return 'Patched. The read-back was not checked — see the result.';
}

/** The status line after an every-bank patch: how it ended. The result panel says each bank's. */
export function everyPatchedStatus(done: FpsEveryBankResult): string {
  const n = done.results.length;
  const banks = `${String(n)} bank${n === 1 ? '' : 's'}`;
  if (done.stopped !== null) {
    return `Stopped at slot ${done.stopped.key.toUpperCase()} — ${banks} patched; see the result.`;
  }
  if (done.results.some((one) => one.readBack.ok !== true)) {
    return `Patched ${banks}, but a read-back was not checked as planned — see the result.`;
  }
  return `Patched ${banks}. Each reads back as planned.`;
}

/**
 * The status line after a cancel. It says a bank may be partly written only once that bank's commit was sent
 * (`committed`, from core's `onCommit`); a cancel before any commit wrote nothing (TESTING.md 42.82, 42.91 C).
 */
export function cancelledStatus(committed: readonly SlotKey[], report: SlotsReport | null): string {
  if (committed.length === 0) return 'Cancelled — nothing was written.';
  const name = (key: SlotKey): string =>
    report?.slots.find((view) => view.entry.key === key)?.entry.name ?? `Bank ${key.toUpperCase()}`;
  if (committed.length === 1) {
    return `Cancelled after the commit to ${name(committed[0] ?? 'a')} was sent — the bank may be partly written. Read it before relying on it.`;
  }
  return (
    `Cancelled after the commits to ${committed.map(name).join(' and ')} were sent — each may be partly ` +
    'written. Read them before relying on them.'
  );
}

/** The three things a bank row can do. */
export type SlotAction = 'dump' | 'flash-plain' | 'flash-raw';

export function slotActionSupport(entry: SlotEntry, action: SlotAction): Support {
  if (action === 'dump') return entry.dump;
  return action === 'flash-plain' ? entry.flashPlain : entry.flashRaw;
}

export interface ActionGate {
  readonly enabled: boolean;
  /** Said in words beside the control when it is off. Null when it is on. */
  readonly reason: string | null;
}

/**
 * Whether one action on one bank may be pressed, and if not, the reason in the
 * page's own words. The build's support is the first word, because a build the
 * plan does not support has no action whatever the camera is doing.
 */
export function slotActionGate(args: {
  readonly entry: SlotEntry;
  readonly view: SlotView | null;
  readonly action: SlotAction;
  readonly connected: boolean;
  readonly busy: boolean;
  /**
   * The camera-wide refusal the page's banner shows (core's `writeBannerOf`), or null. A write that the
   * banner refuses is off on every bank, so the row's control must be off too: a row that offers an action
   * the banner says cannot be written is a contradiction on the page.
   */
  readonly cameraRefusal?: string | null;
}): ActionGate {
  const support = slotActionSupport(args.entry, args.action);
  if (!support.supported) return { enabled: false, reason: support.reason };
  if (!args.connected) return { enabled: false, reason: 'Connect the camera first.' };
  if (args.busy) {
    return { enabled: false, reason: 'Another operation is running — wait for it to finish.' };
  }
  if (args.view === null) return { enabled: false, reason: 'Read the slots first.' };
  if (args.action !== 'dump' && (args.cameraRefusal ?? null) !== null) {
    return {
      enabled: false,
      reason:
        'This camera cannot be written from here, for the reason in the banner above. Nothing is sent.',
    };
  }
  if (args.action !== 'dump' && args.view.state === null) {
    return {
      enabled: false,
      reason: `Not read: ${args.view.unreadReason ?? 'this bank was not read'}. Read the slots again before writing it.`,
    };
  }
  /* An empty bank is writable where the plan says so; where it does not, the write is off
   * with the plan's own reason (a dump is still a read, and stays allowed). */
  if (
    args.action !== 'dump' &&
    args.view.content === 'empty' &&
    !args.entry.emptyBank.writable.supported
  ) {
    return {
      enabled: false,
      reason: `This bank is empty and cannot be written on this build: ${args.entry.emptyBank.writable.reason}`,
    };
  }
  return { enabled: true, reason: null };
}

/** The version a bank's own image header carries, when it could be read. */
export function slotVersion(report: SlotsReport, key: SlotKey): string | null {
  const state = report.slots.find((view) => view.entry.key === key)?.state ?? null;
  return state?.plainHeader?.versionStr ?? state?.header?.versionStr ?? null;
}

/**
 * Whether "Copy to <target>" on the `from` row may be pressed, and if not, why: the target's own rules for a
 * decrypted image (`slotActionGate`, the same as its "Flash decrypted image"), then the source's (an empty bank,
 * one not read, one no recovered key opens: core's `copySourceRefusal`). The target may hold anything, an
 * image or nothing.
 */
export function slotCopyGate(args: {
  readonly report: SlotsReport;
  readonly from: SlotKey;
  readonly to: SlotKey;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly cameraRefusal?: string | null;
}): ActionGate {
  const target = args.report.slots.find((view) => view.entry.key === args.to) ?? null;
  if (target === null) return { enabled: false, reason: 'This build has no such bank.' };
  const gate = slotActionGate({
    entry: target.entry,
    view: target,
    action: 'flash-plain',
    connected: args.connected,
    busy: args.busy,
    cameraRefusal: args.cameraRefusal ?? null,
  });
  if (!gate.enabled) return gate;
  const source = copySourceRefusal(args.report, args.from);
  if (source !== null) return { enabled: false, reason: `${capitalised(source)}.` };
  return { enabled: true, reason: null };
}

function capitalised(text: string): string {
  return text.length === 0 ? text : `${(text[0] ?? '').toUpperCase()}${text.slice(1)}`;
}

/** The button's words for a copy target: "Copy to slot A", "Copy to slot B", "Copy to recovery slot R". */
export function copyLabel(to: SlotKey): string {
  return to === 'r' ? 'Copy to recovery slot R' : `Copy to slot ${to.toUpperCase()}`;
}

function contextOf(
  report: SlotsReport,
  client: SeekDevice,
  reporter: Reporter,
  signal: AbortSignal,
): WorkflowContext {
  return {
    device: client,
    profile: report.state.profile,
    detection: report.state.detection,
    reporter,
    signal,
  };
}

function summarise(report: SlotsReport): string {
  const read = report.slots.filter((view) => view.state !== null).length;
  return `${String(read)}/${String(report.slots.length)} banks read.`;
}

/* ---- the hook ---------------------------------------------------------- */

/** A bank's name as the page shows it ("Bank A"). */
function bankNameOf(report: SlotsReport, key: SlotKey): string {
  return (
    report.slots.find((view) => view.entry.key === key)?.entry.name ?? `Bank ${key.toUpperCase()}`
  );
}

/** A prepared write, held until it is confirmed or discarded. */
export interface PendingSlotFlash {
  readonly key: SlotKey;
  readonly kind: SlotInputKind;
  /**
   * What is written, in words: the picked file's name, or for a copy and a restore the image's source
   * ("Bank A's image", "Bank B of <backup file>"), never a file name the person does not have.
   */
  readonly what: string;
  readonly plan: SlotFlashPlan;
  /** The report the plan was checked against. Only that report may send it. */
  readonly report: SlotsReport;
  /**
   * Where the image came from when it is not a file the person picked: another bank (a copy), or a
   * bank of a full flash backup (a restore). Null for a file. Shown beside the plan so the source is
   * never a surprise.
   */
  readonly source: string | null;
  /** What the write is: it names the backup zip saved first. */
  readonly action: WriteAction;
  /** For a restore: the backup's bank, whose stored bytes the read-back is compared with. */
  readonly restore: SlotRestorePlan | null;
}

/** What the last write did, kept on screen until the next run starts. */
export interface SlotFlashOutcome {
  readonly key: SlotKey;
  /** What was written, in words (`PendingSlotFlash.what`). */
  readonly what: string;
  readonly result: SlotWriteResult['written'];
  /** The bank held no image before this write, so no firmware was overwritten. */
  readonly targetEmpty?: boolean;
  /** The zip saved before the write. */
  readonly backup: WriteBackup;
  readonly action: WriteAction;
  /** For a restore: the read-back against the backup's stored bank bytes. */
  readonly restore: RestoreReadBack | null;
}

export interface SlotsPanelParams {
  readonly runner: Runner;
  readonly device: DeviceHandle;
  readonly form: OptionsForm;
  readonly onOptionsFailure: (failure: OptionsFailure | null) => void;
  /** Injectable so the tests can answer every question the camera can. */
  readonly backend?: SlotsBackend;
}

export interface SlotsPanelApi {
  readonly reporter: ReporterHandle;
  /** The build's plan, once the camera has said what it runs. Null before that. */
  readonly plan: SlotPlan | null;
  /** The last read of the three banks, or null when there is none for this camera. */
  readonly report: SlotsReport | null;
  /** Why the camera's build was refused before anything was read, or null. */
  readonly refusal: Refusal | null;
  readonly pending: PendingSlotFlash | null;
  readonly outcome: SlotFlashOutcome | null;
  /** The last frame-rate patch, kept on screen until the next run starts. */
  readonly fpsOutcome: FpsPatchResult | null;
  /**
   * The frame-rate plan for one bank, from the bank's own image in the last read. Pure: nothing is
   * sent. Refused (with the reason) when there is no read.
   */
  readonly planFps: (key: SlotKey) => FpsPlan;
  /** Patches one bank: saves it first (the backup zip), then writes the patched image and reads it back. */
  readonly patchFps: (key: SlotKey, acknowledged: boolean) => Promise<void>;
  /** What "Make N FPS in every bank" would patch, from the last read. Pure. Null before a read. */
  readonly planEveryFps: () => FpsEveryBankPlan | null;
  /** Patches every bank that offers it, in one confirmation: one zip of all of them first, then each in turn. */
  readonly patchEveryFps: (acknowledged: boolean) => Promise<void>;
  /** The last every-bank patch, kept on screen until the next run starts. */
  readonly fpsEveryOutcome: FpsEveryBankResult | null;
  /**
   * True once any panel's session on this camera sent the unlock token: the camera then stays unlocked until it is
   * swapped or power-cycled. The flag is the device's, shared by every panel (TESTING.md 42.59). The page says so;
   * nothing is gated on it.
   */
  readonly unlockNote: boolean;
  readonly reading: boolean;
  readonly writing: boolean;
  readSlots: () => Promise<void>;
  dump: (key: SlotKey) => Promise<void>;
  pickFile: (key: SlotKey, kind: SlotInputKind, file: File) => Promise<void>;
  /**
   * Prepares a copy of bank `from`'s image, as the slots read decrypted it, into bank `to`, staged as any
   * decrypted image is (core `planSlotCopy`). Sends nothing.
   */
  copyBank: (from: SlotKey, to: SlotKey) => Promise<void>;
  /**
   * Prepares the restore of bank `key` from a full flash backup file (a 4 MiB flash image, or a Preserve run
   * file holding one): the bank cut at its address, decrypted, and staged (core `planSlotRestore`). Sends nothing.
   */
  pickRestore: (key: SlotKey, file: File) => Promise<void>;
  write: (acknowledged: boolean) => Promise<void>;
  discardPending: () => void;
  cancel: () => void;
}

export function useSlotsPanel(params: SlotsPanelParams): SlotsPanelApi {
  const { runner, device, form, onOptionsFailure, backend = CORE_SLOTS_BACKEND } = params;
  /* The camera's unlock flag is the device's, shared with every panel (TESTING.md 42.59); a session that sent the token
   * marks it through `device.markUnlocked`. Information only. */
  const unlockNote = device.unlocked;
  const handle = useReporter('Idle.');
  /* Destructured because the handle is a new object on every log line, and
   * the callbacks below must keep their identity. The `Reporter` and these
   * functions are stable. */
  const { reporter: workflow, reset, log, setStatus, flush } = handle;

  const [plan, setPlan] = useState<SlotPlan | null>(null);
  const [report, setReport] = useState<SlotsReport | null>(null);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [pending, setPending] = useState<PendingSlotFlash | null>(null);
  const [outcome, setOutcome] = useState<SlotFlashOutcome | null>(null);
  const [fpsOutcome, setFpsOutcome] = useState<FpsPatchResult | null>(null);
  const [fpsEveryOutcome, setFpsEveryOutcome] = useState<FpsEveryBankResult | null>(null);

  /* A running task reads these, not the render's copy: it captures its inputs
   * when it starts, and a state value captured then is stale by the time a
   * write is actually sent. */
  const reportRef = useRef<SlotsReport | null>(null);
  const pendingRef = useRef<PendingSlotFlash | null>(null);

  const setCurrentReport = useCallback((next: SlotsReport | null): void => {
    reportRef.current = next;
    setReport(next);
  }, []);

  const setCurrentPending = useCallback((next: PendingSlotFlash | null): void => {
    pendingRef.current = next;
    setPending(next);
  }, []);

  /** Drops the report and the prepared write built on it. */
  const forgetReport = useCallback((): void => {
    reportRef.current = null;
    pendingRef.current = null;
    setReport(null);
    setPending(null);
  }, []);

  /* The whole point of `generation`: a new or vanished camera invalidates
   * everything read from the previous one, the build's plan included. */
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    forgetReport();
    setPlan(null);
    setRefusal(null);
    setOutcome(null);
    setFpsOutcome(null);
    setFpsEveryOutcome(null);
    setStatus(
      device.device === null
        ? 'Device disconnected — read the slots again.'
        : 'New device selected — read the slots again.',
    );
  }, [device.generation, device.device, forgetReport, setStatus]);

  /* ---- read the banks ------------------------------------------------- */

  /**
   * The banks, read again once a write or a patch has been committed and read back, so the table shows what
   * the camera holds now. It reads under the profile and build the commit was sent under (the report's own),
   * and takes no identify probe: that probe arms windows, and nothing after a commit should arm more than the
   * read of the banks does. This is not the read the page asks for after the replug (the version and the
   * active bank settle only then, and the log says so). A failure or a cancel here leaves the commit's result.
   */
  const readAfterWrite = useCallback(
    async (
      written: SlotsReport,
      client: SeekDevice,
      signal: AbortSignal,
      what: 'write' | 'patch',
    ): Promise<void> => {
      /* Over core's own end-of-write status, which names the Info tab's read, not this one. */
      workflow.progress(1, 1, 'Reading the banks again ...');
      try {
        const version = written.state.version;
        const again = await backend.inspect(
          contextOf(written, client, workflow, signal),
          version === null ? undefined : { version },
        );
        setCurrentReport(again);
        log(
          `banks read again after the ${what}: ${summarise(again)} The version and the active bank ` +
            'settle only after the replug.',
          'detail',
        );
      } catch (error) {
        const why = error instanceof CancelledError ? 'cancelled' : errorMessage(error);
        log(
          `the banks were not read again after the ${what} (${why}). The ${what} above stands; read the ` +
            'slots again after the replug.',
          'warn',
        );
      }
    },
    [backend, log, setCurrentReport, workflow],
  );

  const readSlots = useCallback(async (): Promise<void> => {
    const result = await runner.start(SLOTS_READ_PANEL_ID, async (signal) => {
      reset('Reading ...');
      forgetReport();
      setPlan(null);
      setRefusal(null);
      setOutcome(null);
      setFpsOutcome(null);
      setFpsEveryOutcome(null);
      onOptionsFailure(null);
      let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
      let usedClient: SeekDevice | null = null;
      try {
        const options = readOptions(form);
        transport = device.makeTransport({
          recipient: options.recipient,
          onWarning: (message) => {
            workflow.log(message, 'warn');
          },
        });
        const client = new SeekDevice(transport, { reporter: workflow, signal });
        usedClient = client;
        await transport.open();
        /* The camera is asked first, and only its answer decides what is
         * asked next. Nothing here arms a window. */
        const acting = await backend.identify(client, (text, level) => {
          log(text, level);
        });
        const built = backend.plan(acting.profile, acting.firmwareVersion);
        setPlan(built);
        if (!built.supportedBuild.supported) {
          /* Reported, never read: an unsupported build's banks are not tried. */
          log(`not read: ${built.supportedBuild.reason}`, 'warn');
          setStatus('Not supported on this build — no bank was read.');
          return;
        }
        const ctx: WorkflowContext = {
          device: client,
          profile: acting.profile,
          detection: acting.detection,
          reporter: workflow,
          signal,
        };
        /* The build the identify step read a moment ago, on this same client, is
         * handed on rather than read again: one version read fewer per Read. The
         * reader still checks it against the version the read reports. */
        const identified: InspectFirmware | undefined =
          acting.firmwareVersion === null ? undefined : { version: acting.firmwareVersion };
        const next = await backend.inspect(ctx, identified);
        setCurrentReport(next);
        workflow.progress(1, 1, `Read. ${summarise(next)}`);
      } catch (error) {
        const failure = asOptionsFailure(error);
        if (failure !== null) onOptionsFailure(failure);
        if (error instanceof CancelledError) {
          log('cancelled', 'warn');
          setStatus('Cancelled.');
        } else {
          const refused = refusalOf(error);
          if (refused !== null) setRefusal(refused);
          log(`ERROR: ${errorMessage(error)}`, 'error');
          logHint(log, error);
          setStatus(
            refused === null
              ? 'Failed — see the log above.'
              : 'Refused — nothing was armed. See the message below the log.',
          );
        }
      } finally {
        if (transport !== null) await transport.close();
        if (usedClient?.unlockTokenAccepted === true) device.markUnlocked(usedClient.transport);
        flush();
      }
    });
    if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
  }, [
    backend,
    device,
    flush,
    form,
    forgetReport,
    log,
    onOptionsFailure,
    reset,
    runner,
    setCurrentReport,
    setStatus,
    workflow,
  ]);

  /* ---- dump one bank ------------------------------------------------- */

  const dump = useCallback(
    async (key: SlotKey): Promise<void> => {
      const name = key.toUpperCase();
      const result = await runner.start(SLOTS_DUMP_PANEL_ID, async (signal) => {
        reset(`Dumping slot ${name} ...`);
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        let usedClient: SeekDevice | null = null;
        try {
          if (current === null) {
            throw new SeekError(
              'slots/refused',
              'read the slots first — there is nothing to dump yet',
            );
          }
          const options = readOptions(form);
          transport = device.makeTransport({
            recipient: options.recipient,
            onWarning: (message) => {
              workflow.log(message, 'warn');
            },
          });
          const client = new SeekDevice(transport, { reporter: workflow, signal });
          usedClient = client;
          await transport.open();
          const dumped = await backend.dump(
            contextOf(current, client, workflow, signal),
            current,
            key,
          );
          const version = slotVersion(current, key);
          /* The same names the CLI's `slots dump` writes (core's slotDumpNames). */
          const names = slotDumpNames(dumped, version, current.state.keyTable);
          downloadBytes(dumped.raw, names.raw);
          log(
            dumped.empty
              ? `slot ${name} is empty — nothing to decrypt: ${String(dumped.raw.length)} B of 0xFF, ` +
                  `sha256 ${dumped.sha256}`
              : `slot ${name} as stored — ${String(dumped.raw.length)} B, sha256 ${dumped.sha256}`,
            'ok',
          );
          if (dumped.empty) {
            /* No decrypted file: there is nothing in the bank to decrypt. */
          } else if (
            dumped.plain !== null &&
            dumped.plainSha256 !== null &&
            names.decrypted !== null
          ) {
            downloadBytes(dumped.plain, names.decrypted);
            log(
              `slot ${name} decrypted — ${String(dumped.plain.length)} B, sha256 ${dumped.plainSha256}`,
              'ok',
            );
          } else {
            log(
              `slot ${name} has no decrypted image: no key this page recovered opens it`,
              'detail',
            );
          }
          for (const note of dumped.notes) log(note, 'detail');
          workflow.progress(1, 1, `Dumped slot ${name}.`);
        } catch (error) {
          if (error instanceof CancelledError) {
            log('cancelled', 'warn');
            setStatus('Cancelled.');
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          if (transport !== null) await transport.close();
          if (usedClient?.unlockTokenAccepted === true) device.markUnlocked(usedClient.transport);
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [backend, device, flush, form, log, reset, runner, setStatus, workflow],
  );

  /* ---- prepare a write (sends nothing) ------------------------------- */

  /**
   * Builds the plan for one write and holds it. `load` yields the plan, the name, where the image came from
   * and what the write is, given the current report; whatever it throws is shown as a rejection. Nothing
   * here touches the camera.
   */
  const prepareFrom = useCallback(
    async (
      key: SlotKey,
      kind: SlotInputKind,
      load: (current: SlotsReport) => Promise<{
        readonly plan: SlotFlashPlan;
        readonly what: string;
        readonly bytes: number;
        readonly source: string | null;
        readonly action: WriteAction;
        readonly restore: SlotRestorePlan | null;
      }>,
      retry: string,
    ): Promise<void> => {
      const result = await runner.start(
        SLOTS_PREPARE_PANEL_ID,
        async () => {
          reset('Reading image ...');
          setCurrentPending(null);
          const current = reportRef.current;
          try {
            if (current === null) {
              throw new SeekError(
                'slots/refused',
                'read the slots first — the image is checked against what the bank holds',
              );
            }
            /* A bank that was not read is not a picture of anything: nothing
             * may be prepared against it, as the button gate also says. */
            const view = current.slots.find((candidate) => candidate.entry.key === key);
            if (view?.state == null) {
              throw new SeekError(
                'slots/refused',
                `slot ${key.toUpperCase()} was not read (${view?.unreadReason ?? 'no read'}) — ` +
                  'read the slots again before preparing a write to it.',
              );
            }
            const input = await load(current);
            log(`${input.what} — ${input.bytes.toLocaleString()} bytes`, 'detail');
            if (input.source !== null) log(`image taken from ${input.source}`, 'detail');
            const prepared = input.plan;
            setCurrentPending({
              key,
              kind,
              what: input.what,
              plan: prepared,
              report: current,
              source: input.source,
              action: input.action,
              restore: input.restore,
            });
            log(
              `prepared ${String(prepared.payload.length)} B for slot ${key.toUpperCase()}, ` +
                `transfer checksum ${hexUp(prepared.sum16, 4)}`,
              'ok',
            );
            log('nothing sent to the camera yet', 'detail');
            setStatus('Ready — review the plan, then write it.');
          } catch (error) {
            log(`cannot use this file: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Rejected — see the log above.');
          } finally {
            flush();
          }
        },
        { camera: false },
      );
      if (result === 'busy') {
        log(`another operation is running — wait for it, then ${retry}`, 'warn');
      }
    },
    [flush, log, reset, runner, setCurrentPending, setStatus],
  );

  const pickFile = useCallback(
    (key: SlotKey, kind: SlotInputKind, file: File): Promise<void> =>
      prepareFrom(
        key,
        kind,
        async (current) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          return {
            plan: backend.prepare(current, key, { kind, bytes, fileName: file.name }),
            what: file.name,
            bytes: bytes.length,
            source: null,
            action: { kind: 'flash', input: kind, fileName: file.name },
            restore: null,
          };
        },
        'pick the file again',
      ),
    [backend, prepareFrom],
  );

  /* A copy: the source bank's image as this read decrypted it, staged for the target as any decrypted image
   * is (core's planSlotCopy). The name carries the camera's key pair when the image holds it, as a dump's
   * decrypted file would, so every check the file path makes is made. */
  const copyBank = useCallback(
    (from: SlotKey, to: SlotKey): Promise<void> =>
      prepareFrom(
        to,
        'plain',
        (current) => {
          const copy = (backend.copy ?? planSlotCopy)(current, from, to);
          return Promise.resolve({
            plan: copy.plan,
            what: `${bankNameOf(current, from)}'s image`,
            bytes: copy.plan.expectedPlain?.length ?? copy.plan.payload.length,
            source: copy.source,
            action: { kind: 'copy', from } as const,
            restore: null,
          });
        },
        'press the button again',
      ),
    [backend, prepareFrom],
  );

  /* A restore: the bank cut out of a full flash backup at its address, decrypted and staged (core's
   * planSlotRestore). A Preserve run file is read for the whole flash it holds. */
  const pickRestore = useCallback(
    (key: SlotKey, file: File): Promise<void> =>
      prepareFrom(
        key,
        'plain',
        async (current) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const restore = await (
            backend.restore ??
            (async (report, bank, picked) =>
              planSlotRestore(report, bank, await fullFlashOf(picked.bytes, picked.name)))
          )(current, key, { bytes, name: file.name });
          log(
            `${file.name}: a full flash backup (${restore.backup.from === 'preserve-run' ? `the whole flash in a Preserve run file, ${restore.backup.entry ?? ''}` : '4 MiB'}), sha256 ${restore.backup.sha256}; ` +
              `its identity block names ${restore.backup.identity.serial ?? 'no serial'}`,
            'detail',
          );
          return {
            plan: restore.plan,
            what: `${bankNameOf(current, key)} of ${file.name}`,
            bytes: restore.decryption.plain?.length ?? 0,
            source: restore.source,
            action: { kind: 'restore', fileName: file.name } as const,
            restore,
          };
        },
        'pick the file again',
      ),
    [backend, log, prepareFrom],
  );

  /* ---- write ---------------------------------------------------------- */

  /**
   * The save every write waits for: the zip's download, and the log lines that say it was started and what to
   * check. Answers what the save answers, so core refuses the write when it did not happen.
   */
  const saveFirst = useCallback(
    async (backup: WriteBackup): Promise<boolean> => {
      const saved = await (backend.saveBackup ?? saveBackupAsDownload)(backup);
      if (saved) {
        const [line, check] = backupDownloadLines(backup);
        if (line !== undefined) log(line, 'ok');
        if (check !== undefined) log(check, 'detail');
      }
      return saved;
    },
    [backend, log],
  );

  const write = useCallback(
    async (acknowledged: boolean): Promise<void> => {
      const result = await runner.start(SLOTS_FLASH_PANEL_ID, async (signal) => {
        reset('Writing ...');
        setOutcome(null);
        const ready = pendingRef.current;
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        let usedClient: SeekDevice | null = null;
        /* Set when core is about to send the commit. Before it nothing the write sent can have changed the
         * bank (arming and staging do not touch flash); from it on the bank may be partly written. */
        const commit = { sent: false };
        try {
          if (ready === null || current === null || ready.report !== current) {
            throw new SeekError(
              'slots/refused',
              'the bank analysis went stale before the write — read the slots again and pick the ' +
                'image again. Nothing was written.',
            );
          }
          const risk = writeRisk(current, ready.key);
          if (needsRiskAck(risk) && !acknowledged) {
            throw new SeekError(
              'slots/refused',
              `slot ${ready.key.toUpperCase()} needs the risk acknowledgement before it can be ` +
                'written. Nothing was written.',
            );
          }
          const options = readOptions(form);
          transport = device.makeTransport({
            recipient: options.recipient,
            onWarning: (message) => {
              workflow.log(message, 'warn');
            },
          });
          const client = new SeekDevice(transport, { reporter: workflow, signal });
          usedClient = client;
          await transport.open();

          /* The record of what was written: it names the file and the bank. */
          const view = current.slots.find((candidate) => candidate.entry.key === ready.key);
          log(
            `slot ${ready.key.toUpperCase()} at ${hexUp(view?.entry.address ?? 0)} <- ${ready.what}` +
              (ready.plan.targetEmpty === true ? ' (an empty bank: nothing is overwritten)' : ''),
            'ok',
          );
          log(
            `  ${String(ready.plan.payload.length)} B payload, ${stagingPhrase(ready.plan.staging)}, ` +
              `transfer checksum ${hexUp(ready.plan.sum16, 4)}`,
            'detail',
          );

          /* The read the write was planned from is dropped before anything is sent, and the banks are read
           * again once the write is read back, below. A write that stops before its commit gives it back. */
          forgetReport();
          const done = await backend.write(
            contextOf(current, client, workflow, signal),
            current,
            ready.plan,
            {
              verify: true,
              acknowledgeRisk: acknowledged,
              action: ready.action,
              saveBackup: saveFirst,
              onCommit: () => {
                commit.sent = true;
              },
            },
          );
          const written = done.written;
          const restore =
            ready.restore === null ? null : restoreReadBack(ready.restore.stored, written.after);
          setOutcome({
            key: ready.key,
            what: ready.what,
            result: written,
            targetEmpty: ready.plan.targetEmpty === true,
            backup: done.backup,
            action: ready.action,
            restore,
          });
          for (const note of written.notes) log(note, 'detail');
          if (restore !== null) {
            log(
              restoreReadBackText(restore, view?.entry.name ?? `Bank ${ready.key.toUpperCase()}`),
              restore.equal === true ? 'ok' : 'warn',
            );
          }
          log(replugRecord('write'), 'warn');
          await readAfterWrite(current, client, signal, 'write');
          workflow.progress(1, 1, writtenStatus(written.verified));
        } catch (error) {
          /* Nothing was committed: the bank is as the read found it, so the read is the table again. */
          if (!commit.sent && current !== null && reportRef.current === null) {
            setCurrentReport(current);
          }
          if (error instanceof CancelledError) {
            /* The log says what the status says, not the error's own word ("cancelled: cancelled", TESTING.md 42.96). */
            const said = cancelledStatus(commit.sent ? [ready?.key ?? 'a'] : [], current);
            log(said, 'warn');
            setStatus(said);
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          if (transport !== null) await transport.close();
          if (usedClient?.unlockTokenAccepted === true) device.markUnlocked(usedClient.transport);
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [
      backend,
      device,
      flush,
      form,
      forgetReport,
      log,
      readAfterWrite,
      reset,
      runner,
      saveFirst,
      setCurrentReport,
      setStatus,
      workflow,
    ],
  );

  /* ---- frame-rate patch ---------------------------------------------- */

  const planFps = useCallback(
    (key: SlotKey): FpsPlan => {
      if (report === null) {
        return {
          status: 'refused',
          reason: 'read the slots first — the patch is planned from the bank’s own image',
        };
      }
      return (backend.fpsPlan ?? fpsPlanOfBank)(report, key);
    },
    [backend, report],
  );

  const planEveryFps = useCallback(
    (): FpsEveryBankPlan | null =>
      report === null ? null : fpsEveryBankPlan(report, backend.fpsPlan ?? fpsPlanOfBank),
    [backend, report],
  );

  /**
   * Patches one bank. The core saves the bank first (the backup zip, `saveBackup`) and refuses the write if
   * that did not happen; then it writes the patched image and reads it back. Like `write`, the read is dropped
   * before anything is sent and given back when nothing was committed. The banks are read again after the
   * read-back.
   */
  const patchFps = useCallback(
    async (key: SlotKey, acknowledged: boolean): Promise<void> => {
      const name = key.toUpperCase();
      const result = await runner.start(SLOTS_FPS_PANEL_ID, async (signal) => {
        reset(`Patching slot ${name} ...`);
        setFpsOutcome(null);
        setFpsEveryOutcome(null);
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        let usedClient: SeekDevice | null = null;
        /* Set when core is about to send the commit (see `write`). */
        const commit = { sent: false };
        try {
          if (current === null) {
            throw new SeekError(
              'slots/refused',
              'read the slots first — the patch is planned from the bank the analysis read',
            );
          }
          const risk = writeRisk(current, key);
          if (needsRiskAck(risk) && !acknowledged) {
            throw new SeekError(
              'slots/refused',
              `slot ${name} needs the risk acknowledgement before it can be patched. Nothing was written.`,
            );
          }
          const options = readOptions(form);
          transport = device.makeTransport({
            recipient: options.recipient,
            onWarning: (message) => {
              workflow.log(message, 'warn');
            },
          });
          const client = new SeekDevice(transport, { reporter: workflow, signal });
          usedClient = client;
          await transport.open();

          forgetReport();
          const patch = backend.patchFps ?? patchBankFps;
          const done = await patch(contextOf(current, client, workflow, signal), current, key, {
            acknowledgeRisk: acknowledged,
            verify: true,
            saveBackup: saveFirst,
            onCommit: () => {
              commit.sent = true;
            },
          });
          setFpsOutcome(done);
          log(
            `slot ${name}: patched from ${String(done.fromHz)} Hz to ${String(done.toHz)} Hz ` +
              `(firmware ${done.patch.version})`,
            'ok',
          );
          for (const note of done.notes) log(note, 'detail');
          log(replugRecord('patch'), 'warn');
          await readAfterWrite(current, client, signal, 'patch');
          workflow.progress(1, 1, patchedStatus(done.readBack.ok));
        } catch (error) {
          if (!commit.sent && current !== null && reportRef.current === null) {
            setCurrentReport(current);
          }
          if (error instanceof CancelledError) {
            /* The log says what the status says, not the error's own word ("cancelled: cancelled", TESTING.md 42.96). */
            const said = cancelledStatus(commit.sent ? [key] : [], current);
            log(said, 'warn');
            setStatus(said);
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          if (transport !== null) await transport.close();
          if (usedClient?.unlockTokenAccepted === true) device.markUnlocked(usedClient.transport);
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [
      backend,
      device,
      flush,
      form,
      forgetReport,
      log,
      readAfterWrite,
      reset,
      runner,
      saveFirst,
      setCurrentReport,
      setStatus,
      workflow,
    ],
  );

  /**
   * "Make N FPS in every bank": core plans every bank that offers the patch from a fresh read, saves one zip
   * of all of them, then writes and reads each back in turn, the booted bank last; the first failure stops
   * the rest (core `patchEveryBankFps`). One acknowledgement covers the booted bank and recovery R.
   */
  const patchEveryFps = useCallback(
    async (acknowledged: boolean): Promise<void> => {
      const result = await runner.start(SLOTS_FPS_PANEL_ID, async (signal) => {
        reset('Patching every bank ...');
        setFpsOutcome(null);
        setFpsEveryOutcome(null);
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        let usedClient: SeekDevice | null = null;
        const committed: SlotKey[] = [];
        try {
          if (current === null) {
            throw new SeekError(
              'slots/refused',
              'read the slots first — the patch is planned from the banks the analysis read',
            );
          }
          const plan = fpsEveryBankPlan(current, backend.fpsPlan ?? fpsPlanOfBank);
          if (plan.order.length === 0) {
            throw new SeekError(
              'slots/refused',
              'no bank offers the frame-rate patch. Nothing was written.',
            );
          }
          const needs = plan.order.filter((key) => needsRiskAck(writeRisk(current, key)));
          if (needs.length > 0 && !acknowledged) {
            throw new SeekError(
              'slots/refused',
              `${needs.map((key) => `slot ${key.toUpperCase()}`).join(' and ')} need the risk ` +
                'acknowledgement before they can be patched. Nothing was written.',
            );
          }
          const options = readOptions(form);
          transport = device.makeTransport({
            recipient: options.recipient,
            onWarning: (message) => {
              workflow.log(message, 'warn');
            },
          });
          const client = new SeekDevice(transport, { reporter: workflow, signal });
          usedClient = client;
          await transport.open();

          forgetReport();
          const every = backend.patchEveryFps ?? patchEveryBankFps;
          const done = await every(contextOf(current, client, workflow, signal), current, {
            acknowledgeRisk: acknowledged,
            verify: true,
            saveBackup: saveFirst,
            onCommit: (key) => {
              committed.push(key);
            },
          });
          setFpsEveryOutcome(done);
          for (const one of done.results) {
            log(
              `slot ${one.key.toUpperCase()}: patched from ${String(one.fromHz)} Hz to ${String(one.toHz)} Hz ` +
                `(firmware ${one.patch.version})`,
              'ok',
            );
            for (const note of one.notes) log(note, 'detail');
          }
          if (done.stopped !== null) log(`stopped: ${done.stopped.reason}`, 'warn');
          if (done.unwritten.length > 0) {
            log(
              `not written: ${done.unwritten.map((key) => `slot ${key.toUpperCase()}`).join(', ')}`,
              'warn',
            );
          }
          if (committed.length > 0) {
            log(replugRecord('patch'), 'warn');
            await readAfterWrite(current, client, signal, 'patch');
          }
          workflow.progress(1, 1, everyPatchedStatus(done));
        } catch (error) {
          if (committed.length === 0 && current !== null && reportRef.current === null) {
            setCurrentReport(current);
          }
          if (error instanceof CancelledError) {
            /* The log says what the status says, not the error's own word ("cancelled: cancelled", TESTING.md 42.96). */
            const said = cancelledStatus(committed, current);
            log(said, 'warn');
            setStatus(said);
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          if (transport !== null) await transport.close();
          if (usedClient?.unlockTokenAccepted === true) device.markUnlocked(usedClient.transport);
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [
      backend,
      device,
      flush,
      form,
      forgetReport,
      log,
      readAfterWrite,
      reset,
      runner,
      saveFirst,
      setCurrentReport,
      setStatus,
      workflow,
    ],
  );

  const cancel = useCallback((): void => {
    runner.cancel();
    setStatus('Cancelling ...');
  }, [runner, setStatus]);

  const discardPending = useCallback((): void => {
    setCurrentPending(null);
    log('prepared image discarded — nothing was sent', 'detail');
  }, [log, setCurrentPending]);

  return useMemo(
    () => ({
      reporter: handle,
      plan,
      report,
      refusal,
      pending,
      outcome,
      fpsOutcome,
      fpsEveryOutcome,
      planFps,
      patchFps,
      planEveryFps,
      patchEveryFps,
      unlockNote,
      reading: runner.active === SLOTS_READ_PANEL_ID,
      writing: runner.active === SLOTS_FLASH_PANEL_ID || runner.active === SLOTS_FPS_PANEL_ID,
      readSlots,
      dump,
      pickFile,
      copyBank,
      pickRestore,
      write,
      discardPending,
      cancel,
    }),
    [
      handle,
      plan,
      report,
      refusal,
      pending,
      outcome,
      fpsOutcome,
      fpsEveryOutcome,
      planFps,
      patchFps,
      planEveryFps,
      patchEveryFps,
      unlockNote,
      runner.active,
      readSlots,
      dump,
      pickFile,
      copyBank,
      pickRestore,
      write,
      discardPending,
      cancel,
    ],
  );
}
