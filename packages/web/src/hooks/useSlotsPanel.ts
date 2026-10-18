/**
 * The slot page's state: read the three banks, dump one, flash one from a
 * decrypted image or from raw bytes.
 *
 * Four rules this hook holds. Three are the flash view's, for one camera;
 * the fourth is specific to banks.
 *
 *  - A report is ONE camera's. It is dropped whenever the device changes, so a
 *    write planned against one unit can never reach another.
 *  - A prepared write is only sent while the report it was built from is still
 *    the current one: the payload was checked against what that bank held.
 *  - After a write starts, the report is dropped. The bank may have changed, so
 *    the read is no longer a picture of it.
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
  dumpSlot,
  errorMessage,
  findEmbeddedKeyTable,
  flashSlot,
  fpsPlanOfBank,
  hexUp,
  inspectSlots,
  keyFilenameSuffix,
  patchBankFps,
  prepareSlotFlash,
  type PrepareSlotFlashOptions,
  type FpsPatchResult,
  type FpsPlan,
  type FpsPreDump,
  type KeyPair,
  type DumpedSlot,
  type FirmwareProfile,
  type FlashSlotOptions,
  type FlashSlotResult,
  type InspectFirmware,
  type LogLevel,
  type Reporter,
  type SlotEntry,
  type SlotFlashInput,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotPlan,
  type SlotView,
  type SlotsReport,
  type Support,
  type WorkflowContext,
} from '@seek-fw/core';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { downloadBytes } from '../lib/download';
import { saveFpsDumpInBrowser } from '../lib/fps-save';
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
    options: {
      readonly acknowledgeRisk: boolean;
      readonly verify?: boolean;
      readonly saveDump: (dump: FpsPreDump) => Promise<boolean>;
    },
  ) => Promise<FpsPatchResult>;
  /** Saves the pre-patch dump in the browser. Resolves true only once it is saved. */
  readonly saveDump?: (dump: FpsPreDump) => Promise<boolean>;
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
  readonly prepare: (
    report: SlotsReport,
    key: SlotKey,
    input: SlotFlashInput,
    options?: PrepareSlotFlashOptions,
  ) => SlotFlashPlan;
  readonly flash: (
    ctx: WorkflowContext,
    report: SlotsReport,
    plan: SlotFlashPlan,
    options: FlashSlotOptions,
  ) => Promise<FlashSlotResult>;
}

export const CORE_SLOTS_BACKEND: SlotsBackend = {
  identify: (device, log) => chooseActingProfile(device, 'auto', 'read the device info', log),
  plan: (profile, firmwareVersion) => buildSlotPlan(profile, firmwareVersion),
  inspect: (ctx, firmware) => inspectSlots(ctx, firmware === undefined ? {} : { firmware }),
  dump: (ctx, report, key) => dumpSlot(ctx, report, key),
  prepare: (report, key, input, options) => prepareSlotFlash(report, key, input, options),
  flash: (ctx, report, plan, options) => flashSlot(ctx, report, plan, options),
  fpsPlan: (report, key) => fpsPlanOfBank(report, key),
  patchFps: (ctx, report, key, options) => patchBankFps(ctx, report, key, options),
  saveDump: (dump) => saveFpsDumpInBrowser(dump),
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
}): ActionGate {
  const support = slotActionSupport(args.entry, args.action);
  if (!support.supported) return { enabled: false, reason: support.reason };
  if (!args.connected) return { enabled: false, reason: 'Connect the camera first.' };
  if (args.busy) {
    return { enabled: false, reason: 'Another operation is running — wait for it to finish.' };
  }
  if (args.view === null) return { enabled: false, reason: 'Read the slots first.' };
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
 * The name a dump is saved under: the slot, the version the bank reports, and
 * a short hash so two dumps of the same slot never overwrite each other.
 *
 * A decrypted image may end in its key pair (`-KeyA-<hex>-KeyB-<hex>`), which is
 * how the flash path learns which keys the image was built for. `keys` is that
 * pair when the image really holds it (see `keyPairToName`); null leaves the name
 * bare, and the flash path then refuses the file rather than guessing.
 */
export function slotDumpFileName(
  key: SlotKey,
  version: string | null,
  kind: 'raw' | 'decrypted',
  sha256: string,
  keys: KeyPair | null = null,
  empty = false,
): string {
  /* An empty bank has no version to name it by; it says what it is instead. */
  if (empty) return `seek-slot-${key.toUpperCase()}-empty-${kind}-${sha256.slice(0, 8)}.bin`;
  const label = (version ?? 'unknown').replace(/[^0-9A-Za-z.]+/g, '-');
  const suffix = keys === null ? '' : keyFilenameSuffix(keys.keyA, keys.keyB);
  return `seek-slot-${key.toUpperCase()}-v${label}-${kind}-${sha256.slice(0, 8)}${suffix}.bin`;
}

/**
 * The key pair to name a decrypted dump with: the camera's own table, but only
 * when both keys are found, exactly once each, inside the decrypted image. The
 * same rule `decrypt.ts` applies to a dump's file names, so a name never claims
 * keys the bytes do not hold. Null when the table is unknown or not in the image.
 */
export function keyPairToName(plain: Uint8Array, table: KeyPair | null): KeyPair | null {
  if (table === null) return null;
  return findEmbeddedKeyTable(plain, table.keyA, table.keyB) === null ? null : table;
}

/**
 * A decrypted image an empty bank could be filled from, taken from the read the page
 * already made: no second read, nothing asked of the camera.
 */
export interface BankImageSource {
  readonly key: SlotKey;
  readonly name: string;
  readonly version: string | null;
  readonly bytes: Uint8Array;
  /**
   * The name the image is prepared under. It carries the camera's key pair when the image
   * holds it, exactly as a dump's decrypted file is named: a write on the Key A line reads
   * the pair from the name and refuses an image whose name has none.
   */
  readonly fileName: string;
  /** The camera names this bank as the one it boots; false when it is only a bank that holds an image. */
  readonly booted: boolean;
}

/**
 * The running firmware's decrypted image, for an empty bank: the bank the camera boots
 * when it holds an image this read decrypted, else a bank the bootloader can key, else
 * any other bank that holds one. Never the target itself. Null when no bank qualifies.
 */
export function bankImageSource(report: SlotsReport, target: SlotKey): BankImageSource | null {
  const holds = (candidate: SlotView): boolean =>
    candidate.entry.key !== target &&
    candidate.content === 'image' &&
    candidate.state?.plain != null;
  const view =
    report.slots.find((candidate) => candidate.active && holds(candidate)) ??
    report.slots.find((candidate) => candidate.state?.bootable === true && holds(candidate)) ??
    report.slots.find(holds) ??
    null;
  const state = view?.state ?? null;
  const plain = state?.plain ?? null;
  if (view === null || state === null || plain === null) return null;
  const version = slotVersion(report, view.entry.key);
  const keys = keyPairToName(plain, report.state.keyTable);
  return {
    key: view.entry.key,
    name: view.entry.name,
    version,
    bytes: plain,
    fileName: slotDumpFileName(
      view.entry.key,
      version,
      'decrypted',
      state.sha256 ?? 'unknown',
      keys,
    ),
    booted: view.active,
  };
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

/** A prepared write, held until it is confirmed or discarded. */
export interface PendingSlotFlash {
  readonly key: SlotKey;
  readonly kind: SlotInputKind;
  readonly fileName: string;
  readonly plan: SlotFlashPlan;
  /** The report the plan was checked against. Only that report may send it. */
  readonly report: SlotsReport;
  /**
   * Where the image came from when it is not a file the person picked: "the booted bank's
   * image". Null for a file. Shown beside the plan so the source is never a surprise.
   */
  readonly source: string | null;
}

/** What the last write did, kept on screen until the next run starts. */
export interface SlotFlashOutcome {
  readonly key: SlotKey;
  readonly fileName: string;
  readonly result: FlashSlotResult;
  /** The bank held no image before this write, so no firmware was overwritten. */
  readonly targetEmpty?: boolean;
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
  /** Patches one bank: saves its dump first, then writes the patched image and reads it back. */
  readonly patchFps: (key: SlotKey, acknowledged: boolean) => Promise<void>;
  /**
   * The person says the camera runs the 16 Hz FF 1.3.0.8 build. Used only when the camera's own
   * answers cannot say which build runs; it applies to the next image prepared.
   */
  readonly running16Hz: boolean;
  setRunning16Hz: (value: boolean) => void;
  readonly reading: boolean;
  readonly writing: boolean;
  readSlots: () => Promise<void>;
  dump: (key: SlotKey) => Promise<void>;
  pickFile: (key: SlotKey, kind: SlotInputKind, file: File) => Promise<void>;
  /**
   * Prepares a write of the running firmware's own decrypted image (`bankImageSource`) into
   * an empty bank, as if its file had been picked. Sends nothing.
   */
  fillWithBankImage: (key: SlotKey) => Promise<void>;
  write: (acknowledged: boolean) => Promise<void>;
  discardPending: () => void;
  cancel: () => void;
}

export function useSlotsPanel(params: SlotsPanelParams): SlotsPanelApi {
  const { runner, device, form, onOptionsFailure, backend = CORE_SLOTS_BACKEND } = params;
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
  const [running16Hz, setRunning16Hz] = useState(false);

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
    setStatus(
      device.device === null
        ? 'Device disconnected — read the slots again.'
        : 'New device selected — read the slots again.',
    );
  }, [device.generation, device.device, forgetReport, setStatus]);

  /* ---- read the banks ------------------------------------------------- */

  const readSlots = useCallback(async (): Promise<void> => {
    const result = await runner.start(SLOTS_READ_PANEL_ID, async (signal) => {
      reset('Reading ...');
      forgetReport();
      setPlan(null);
      setRefusal(null);
      setOutcome(null);
      setFpsOutcome(null);
      onOptionsFailure(null);
      let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
      try {
        const options = readOptions(form);
        transport = device.makeTransport({
          recipient: options.recipient,
          onWarning: (message) => {
            workflow.log(message, 'warn');
          },
        });
        const client = new SeekDevice(transport, { reporter: workflow, signal });
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
          await transport.open();
          const dumped = await backend.dump(
            contextOf(current, client, workflow, signal),
            current,
            key,
          );
          const version = slotVersion(current, key);
          downloadBytes(
            dumped.raw,
            slotDumpFileName(key, version, 'raw', dumped.sha256, null, dumped.empty),
          );
          log(
            dumped.empty
              ? `slot ${name} is empty — nothing to decrypt: ${String(dumped.raw.length)} B of 0xFF, ` +
                  `sha256 ${dumped.sha256}`
              : `slot ${name} as stored — ${String(dumped.raw.length)} B, sha256 ${dumped.sha256}`,
            'ok',
          );
          if (dumped.empty) {
            /* No decrypted file: there is nothing in the bank to decrypt. */
          } else if (dumped.plain !== null && dumped.plainSha256 !== null) {
            /* Named with the camera's key pair when the image holds it: the flash
             * path reads the pair from the name and refuses a file without one. */
            const keys = keyPairToName(dumped.plain, current.state.keyTable);
            downloadBytes(
              dumped.plain,
              slotDumpFileName(key, version, 'decrypted', dumped.plainSha256, keys),
            );
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
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [backend, device, flush, form, log, reset, runner, setStatus, workflow],
  );

  /* ---- prepare a file (sends nothing) -------------------------------- */

  /**
   * Builds the plan for one input and holds it. `load` yields the bytes, the name and where
   * they came from, given the current report; whatever it throws is shown as a rejection.
   * Nothing here touches the camera.
   */
  const prepareFrom = useCallback(
    async (
      key: SlotKey,
      kind: SlotInputKind,
      load: (current: SlotsReport) => Promise<{
        readonly bytes: Uint8Array;
        readonly fileName: string;
        readonly source: string | null;
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
            log(`${input.fileName} — ${input.bytes.length.toLocaleString()} bytes`, 'detail');
            if (input.source !== null) log(`image taken from ${input.source}`, 'detail');
            const prepared = backend.prepare(
              current,
              key,
              { kind, bytes: input.bytes, fileName: input.fileName },
              { running16Hz },
            );
            setCurrentPending({
              key,
              kind,
              fileName: input.fileName,
              plan: prepared,
              report: current,
              source: input.source,
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
    [backend, flush, log, reset, runner, setCurrentPending, setStatus, running16Hz],
  );

  const pickFile = useCallback(
    (key: SlotKey, kind: SlotInputKind, file: File): Promise<void> =>
      prepareFrom(
        key,
        kind,
        async () => ({
          bytes: new Uint8Array(await file.arrayBuffer()),
          fileName: file.name,
          source: null,
        }),
        'pick the file again',
      ),
    [prepareFrom],
  );

  /* The running firmware's own image, offered for an empty bank. The bytes are the decrypted
   * image this read already holds (the bank's `plain`); the name carries the camera's key pair
   * when the image holds it, as a dump's file would, so every check the file path makes is made. */
  const fillWithBankImage = useCallback(
    (key: SlotKey): Promise<void> =>
      prepareFrom(
        key,
        'plain',
        (current) => {
          const view = current.slots.find((candidate) => candidate.entry.key === key);
          if (view?.content !== 'empty') {
            throw new SeekError(
              'slots/refused',
              `slot ${key.toUpperCase()} is not empty, so there is no empty bank to fill. Pick a ` +
                'file to replace what it holds.',
            );
          }
          const source = bankImageSource(current, key);
          if (source === null) {
            throw new SeekError(
              'slots/refused',
              'no other bank holds a decrypted image to copy — pick an image file instead',
            );
          }
          return Promise.resolve({
            bytes: source.bytes,
            fileName: source.fileName,
            source: source.booted
              ? `${source.name}, the bank the camera boots now${source.version === null ? '' : ` (${source.version})`}`
              : `${source.name}, the first bank that holds an image${source.version === null ? '' : ` (${source.version})`}`,
          });
        },
        'press the button again',
      ),
    [prepareFrom],
  );

  /* ---- write ---------------------------------------------------------- */

  const write = useCallback(
    async (acknowledged: boolean): Promise<void> => {
      const result = await runner.start(SLOTS_FLASH_PANEL_ID, async (signal) => {
        reset('Writing ...');
        setOutcome(null);
        const ready = pendingRef.current;
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        /* Set once the write is handed to the camera. From then on the bank
         * may have changed, whatever happens next. */
        let committing = false;
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
          await transport.open();

          /* The record of what was written: it names the file and the bank. */
          const view = current.slots.find((candidate) => candidate.entry.key === ready.key);
          log(
            `slot ${ready.key.toUpperCase()} at ${hexUp(view?.entry.address ?? 0)} <- ${ready.fileName}` +
              (ready.plan.targetEmpty === true ? ' (an empty bank: nothing is overwritten)' : ''),
            'ok',
          );
          log(
            `  ${String(ready.plan.payload.length)} B payload, staging ${ready.plan.staging}, ` +
              `transfer checksum ${hexUp(ready.plan.sum16, 4)}`,
            'detail',
          );

          committing = true;
          const written = await backend.flash(
            contextOf(current, client, workflow, signal),
            current,
            ready.plan,
            { verify: true, acknowledgeRisk: acknowledged },
          );
          setOutcome({
            key: ready.key,
            fileName: ready.fileName,
            result: written,
            targetEmpty: ready.plan.targetEmpty === true,
          });
          for (const note of written.notes) log(note, 'detail');
          log('NOW UNPLUG AND REPLUG THE CAMERA.', 'warn');
          log(
            'No reset was sent, so the bank only takes effect after a real power cycle. Read the ' +
              'slots again after replugging: the version and the active bank the camera reports ' +
              'are the only thing that settles it.',
            'detail',
          );
          workflow.progress(
            1,
            1,
            written.verified === false
              ? 'Written, but the read-back does not match — see the result.'
              : 'Written. Unplug and replug, then read the slots again.',
          );
        } catch (error) {
          if (error instanceof CancelledError) {
            log(`cancelled: ${error.message}`, 'warn');
            setStatus(
              committing
                ? 'Cancelled — the bank may be partly written. Read it before relying on it.'
                : 'Cancelled — nothing was written.',
            );
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          if (committing) forgetReport();
          if (transport !== null) await transport.close();
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [backend, device, flush, form, forgetReport, log, reset, runner, setStatus, workflow],
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

  /**
   * Patches one bank. The core saves the bank's dump first (`saveDump`) and refuses the write if that did
   * not happen; then it writes the patched image through the page's own plain-chain path and reads it back.
   * Like `write`, a failure after the analysis is used drops the report: the bank may have changed.
   */
  const patchFps = useCallback(
    async (key: SlotKey, acknowledged: boolean): Promise<void> => {
      const name = key.toUpperCase();
      const result = await runner.start(SLOTS_FPS_PANEL_ID, async (signal) => {
        reset(`Patching slot ${name} ...`);
        setFpsOutcome(null);
        const current = reportRef.current;
        let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
        let used = false;
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
          await transport.open();
          used = true;
          const patch = backend.patchFps ?? patchBankFps;
          const save = backend.saveDump ?? saveFpsDumpInBrowser;
          const done = await patch(contextOf(current, client, workflow, signal), current, key, {
            acknowledgeRisk: acknowledged,
            verify: true,
            saveDump: save,
          });
          setFpsOutcome(done);
          log(
            `slot ${name}: patched from ${String(done.fromHz)} Hz to ${String(done.toHz)} Hz ` +
              `(${done.patch.id}); the dump was saved first as ${done.pre.rawName} and ${done.pre.plainName}`,
            'ok',
          );
          for (const note of done.notes) log(note, 'detail');
          log('NOW UNPLUG AND REPLUG THE CAMERA.', 'warn');
          workflow.progress(
            1,
            1,
            done.readBack.ok === false
              ? 'Patched, but the read-back does not differ only as planned — see the result.'
              : 'Patched. Unplug and replug, then read the slots again.',
          );
        } catch (error) {
          if (error instanceof CancelledError) {
            log(`cancelled: ${error.message}`, 'warn');
            setStatus(
              used
                ? 'Cancelled — the bank may be partly written. Read it before relying on it.'
                : 'Cancelled — nothing was written.',
            );
          } else {
            log(`ERROR: ${errorMessage(error)}`, 'error');
            logHint(log, error);
            setStatus('Failed — see the log above.');
          }
        } finally {
          /* Once the camera was used the analysis is no longer a picture of the bank: read again. */
          if (used) forgetReport();
          if (transport !== null) await transport.close();
          flush();
        }
      });
      if (result === 'in-use-elsewhere') reportInUseElsewhere({ log, setStatus });
    },
    [backend, device, flush, form, forgetReport, log, reset, runner, setStatus, workflow],
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
      planFps,
      patchFps,
      running16Hz,
      setRunning16Hz,
      reading: runner.active === SLOTS_READ_PANEL_ID,
      writing: runner.active === SLOTS_FLASH_PANEL_ID || runner.active === SLOTS_FPS_PANEL_ID,
      readSlots,
      dump,
      pickFile,
      fillWithBankImage,
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
      planFps,
      patchFps,
      running16Hz,
      runner.active,
      readSlots,
      dump,
      pickFile,
      fillWithBankImage,
      write,
      discardPending,
      cancel,
    ],
  );
}
