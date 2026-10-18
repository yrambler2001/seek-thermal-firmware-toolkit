/**
 * The firmware-slot page: the camera's three banks, A, B and the recovery bank
 * R, what each holds, whether the camera boots it, and what this build allows
 * the page to do to it.
 *
 * Reading and dumping change nothing in the camera. A flash button prepares a
 * write, shows exactly what it would do, and asks before it sends a byte.
 */

import { useMemo, useState, type ReactElement } from 'react';
import { CircleStop, Layers, ScanSearch, Send, ShieldAlert } from 'lucide-react';
import {
  derivedKeyLine,
  fpsBootWarningOf,
  hexUp,
  onPlaintextChain,
  type FpsPatchResult,
  type SlotInputKind,
  type SlotKey,
  type SlotsReport,
} from '@seek-fw/core';
import { DeviceInfoPanel } from '@/components/DeviceInfoPanel';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { SlotFlashPreview } from '@/components/SlotFlashPreview';
import { SlotFpsConfirm, type FpsOffer } from '@/components/SlotFpsConfirm';
import { SlotTable } from '@/components/SlotTable';
import { SlotWriteConfirm } from '@/components/SlotWriteConfirm';
import { SlotWriteKeys, writeKeysVerdictOf } from '@/components/SlotWriteKeys';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/ui/toolbar';
import { writeRisk, type SlotFlashOutcome, type SlotsPanelApi } from '@/hooks/useSlotsPanel';
import { fpsSaveMode } from '@/lib/fps-save';
import type { Refusal } from '@/lib/identify';

export interface SlotsViewProps {
  readonly slots: SlotsPanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
}

function viewOf(report: SlotsReport, key: SlotKey) {
  return report.slots.find((view) => view.entry.key === key) ?? null;
}

function verdict(verified: boolean | null): string {
  if (verified === true) return 'the bank reads back as written.';
  if (verified === false) return 'the read-back does NOT match what was written.';
  /* The page always asks for the read-back. Null means core took it but had no
   * expected image to compare it with (a bank the device re-encrypts), which is
   * not the same as verification being switched off. Its notes say why. */
  return 'the read-back was taken but not compared, so this write is not verified here.';
}

/**
 * What a frame-rate patch did, on screen until the next run. The rate it claims is the table's, and the
 * read-back is the check that only the planned bytes changed. It says what was NOT proven: the rate.
 */
function FpsOutcomePanel({ result }: { readonly result: FpsPatchResult }): ReactElement {
  const { key, fromHz, toHz, pre, readBack } = result;
  const tone = readBack.ok === true && result.written.verified !== false ? 'ok' : 'err';
  return (
    <Alert tone={tone} className="mt-3">
      <p>
        <strong>
          {`Slot ${key.toUpperCase()} — patched from ${String(fromHz)} Hz to ${String(toHz)} Hz (${result.patch.id}).`}
        </strong>
      </p>
      <p>
        {readBack.checked
          ? readBack.ok === true
            ? `The read-back differs from the saved dump only at the ${String(result.changed.length)} planned byte(s), the sites and the sum word.`
            : `The read-back does NOT differ only as planned: ${String(readBack.unexpected.length)} unexpected and ${String(readBack.missing.length)} missing byte(s).`
          : 'The read-back was not taken, so the patch is not checked here.'}
      </p>
      <p>
        {`The dump saved before the write: ${pre.rawName} and ${pre.plainName}. The saved decrypted file is the only way back.`}
      </p>
      <p>
        <strong>NOW UNPLUG AND REPLUG THE CAMERA.</strong> No reset was sent. Then read the slots
        again.
      </p>
    </Alert>
  );
}

function OutcomePanel({ outcome }: { readonly outcome: SlotFlashOutcome }): ReactElement {
  const { key, fileName, result } = outcome;
  const tone = result.verified === true ? 'ok' : result.verified === false ? 'err' : 'warn';
  return (
    <Alert tone={tone} className="mt-3">
      <p>
        <strong>{`Slot ${key.toUpperCase()} — ${fileName}: ${verdict(result.verified)}`}</strong>
      </p>
      <p>{`The camera's commit returned status ${hexUp(result.commitStatus, 4)}.`}</p>
      {outcome.targetEmpty === true && (
        <p>{`Slot ${key.toUpperCase()} was empty before this write, so no firmware was overwritten.`}</p>
      )}
      <p>
        Proven so far: the payload was streamed and committed
        {result.verified === true ? ', and the bank reads back as written' : ''}. NOT proven: that
        the bootloader will select this bank, or that the image runs.
      </p>
      <p>
        <strong>NOW UNPLUG AND REPLUG THE CAMERA.</strong> No reset was sent, so the bank only takes
        effect after a real power cycle. Then read the slots again: the version and the active bank
        the camera reports are the only thing that settles it.
      </p>
      {result.notes.length > 0 && (
        <ul>
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}

/**
 * The refusal the page shows. A camera that does not give a usable firmware
 * version is not a refused write: the page cannot tell which build it runs, and
 * it says so, and says what it covers. It does not say the camera "did not
 * report its version" and send the user to unplug it, which is the advice for a
 * camera that is still starting up, so that advice is kept only as the secondary
 * hint. The toolkit's own sentence stays in the run log, where its detail is.
 */
function RefusalAlert({ refusal }: { readonly refusal: Refusal }): ReactElement {
  if (refusal.code === 'device/version-unknown') {
    return (
      <Alert tone="err">
        <p>
          <strong>Not identified: this page cannot tell which build the camera runs.</strong>
        </p>
        <p>
          The camera gave no usable firmware version, so no bank was read and nothing was armed.
          This page covers builds 0.8.0.0 and newer. Builds before 0.8.0.0 are outside what the
          slots page supports, so a camera on one of them is never read here.
        </p>
        {refusal.hint !== null && (
          <p>If the camera runs a supported build, it may only be starting up. {refusal.hint}</p>
        )}
      </Alert>
    );
  }
  return (
    <Alert tone="err">
      <p>
        <strong>Refused — nothing was armed.</strong>
      </p>
      <p>{refusal.message}</p>
      {refusal.hint !== null && <p>{refusal.hint}</p>}
    </Alert>
  );
}

export function SlotsView({ slots, connected, busy }: SlotsViewProps): ReactElement {
  const [confirming, setConfirming] = useState(false);
  /* The bank whose frame-rate patch the person is confirming, or null when no dialog is open. */
  const [fpsKey, setFpsKey] = useState<SlotKey | null>(null);
  const { plan, report, refusal, pending, outcome, fpsOutcome, reading, writing } = slots;
  const fpsPlan = fpsKey === null ? null : slots.planFps(fpsKey);
  const fpsOffer: FpsOffer | null = fpsPlan !== null && fpsPlan.status === 'offer' ? fpsPlan : null;
  const fpsView = fpsKey === null || report === null ? null : viewOf(report, fpsKey);
  /* The boot warning on the page: a patched bank the camera does not run. Core decides it (boot-choice.ts). */
  const bootWarning = useMemo(() => (report === null ? null : fpsBootWarningOf(report)), [report]);
  /* The same warning for the bank the person is about to patch, which then counts as holding the patch. */
  const dialogBootWarning = useMemo(
    () =>
      report === null || fpsKey === null ? null : fpsBootWarningOf(report, { target: fpsKey }),
    [report, fpsKey],
  );
  const unsupported =
    plan !== null && !plan.supportedBuild.supported ? plan.supportedBuild.reason : null;
  const pendingView = pending === null ? null : viewOf(pending.report, pending.key);

  return (
    <>
      <Section
        id="slots"
        step="2"
        title="Work with firmware slots"
        icon={<Layers />}
        aside={
          <Badge tone="err">
            <ShieldAlert />
            Writes to flash
          </Badge>
        }
        description="Read slots asks the camera what it runs and reads its three firmware banks — A, B and the recovery bank R — and shows what each holds. Reading and dumping change nothing. A flash button asks before any byte is sent."
      >
        <Alert tone="err">
          <p>
            <strong>This page can write to the camera&apos;s flash.</strong> A write erases one 64
            KiB bank and programs it. An image that is structurally valid but does not run leaves
            the camera unbootable, and the bootloader has no USB — only SWD/J-Link or an SPI
            programmer can recover it. Dump the bank first and keep the file.
          </p>
        </Alert>

        <Toolbar label="Slot actions">
          <Button
            variant="default"
            disabled={!connected || busy}
            onClick={() => {
              void slots.readSlots();
            }}
          >
            <ScanSearch />
            Read slots
          </Button>
          <Button variant="ghost" disabled={!reading && !writing} onClick={slots.cancel}>
            <CircleStop />
            Cancel
          </Button>
        </Toolbar>

        <RunPanel
          id="slotsrun"
          label="Slots"
          tone={writing ? 'danger' : 'default'}
          progress={slots.reporter.progress}
          lines={slots.reporter.lines}
          trimmed={slots.reporter.trimmed}
        />

        {refusal !== null && <RefusalAlert refusal={refusal} />}

        {unsupported !== null && (
          <Alert tone="err">
            <p>
              <strong>
                This build is not supported here, so no bank was read and none can be written.
              </strong>
            </p>
            <p>{unsupported}</p>
          </Alert>
        )}

        {plan !== null && plan.notes.length > 0 && (
          <Prose>
            <ul>
              {plan.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Prose>
        )}

        {report !== null && (
          <>
            <DeviceInfoPanel state={report.state} />
            <SlotWriteKeys verdict={writeKeysVerdictOf(report)} />
            {report.state.version === '1.3.0.8' && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={slots.running16Hz}
                  onChange={(event) => {
                    slots.setRunning16Hz(event.target.checked);
                  }}
                />
                <span>
                  This camera runs the 16 Hz build. It is used only for the 1.3.0.8 FF image, and
                  only when the camera&apos;s own answers cannot say which build it runs. If the
                  choice is wrong, the camera refuses the image with 0x00070100 before it programs
                  anything.
                </span>
              </label>
            )}
            {bootWarning !== null && (
              <Alert tone="warn">
                {bootWarning.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Alert>
            )}
            <SlotTable
              report={report}
              connected={connected}
              busy={busy}
              onDump={(key) => {
                void slots.dump(key);
              }}
              onPickFile={(key: SlotKey, kind: SlotInputKind, file: File) => {
                setConfirming(false);
                void slots.pickFile(key, kind, file);
              }}
              onFillWithBankImage={(key: SlotKey) => {
                setConfirming(false);
                void slots.fillWithBankImage(key);
              }}
              planFps={slots.planFps}
              onPatchFps={(key: SlotKey) => {
                setConfirming(false);
                setFpsKey(key);
              }}
            />
          </>
        )}

        {report === null && unsupported === null && refusal === null && (
          <Prose>
            <p>
              {connected
                ? 'Press Read slots. The camera is asked which build it runs first, and nothing is armed on a build this page does not support.'
                : 'Connect the camera, then press Read slots.'}
            </p>
          </Prose>
        )}

        {pending !== null && pendingView !== null && (
          <SlotFlashPreview
            slotName={pendingView.entry.name}
            address={pendingView.entry.address}
            fileName={pending.fileName}
            kind={pending.kind}
            plan={pending.plan}
            busy={busy}
            targetEmpty={pending.plan.targetEmpty === true}
            source={pending.source}
            onWrite={() => {
              setConfirming(true);
            }}
            onDiscard={slots.discardPending}
          />
        )}

        {pending !== null && pendingView !== null && (
          <SlotWriteConfirm
            open={confirming}
            fileName={pending.fileName}
            slotName={pendingView.entry.name}
            slotAddress={hexUp(pendingView.entry.address)}
            risk={writeRisk(pending.report, pending.key)}
            ffImage={pending.plan.staging === 'key-a-keystream'}
            namedByWord={onPlaintextChain(
              pending.report.state.profile,
              pending.report.state.version,
            )}
            targetEmpty={pending.plan.targetEmpty === true}
            keyLine={
              pending.plan.derivedFrom
                ? `The image is written under ${derivedKeyLine(pending.plan.derivedFrom, `bank ${pending.plan.derivedFrom.bank.toUpperCase()}`)}. Every other bank is written the same way.`
                : null
            }
            onCancel={() => {
              setConfirming(false);
            }}
            onConfirm={(acknowledged) => {
              setConfirming(false);
              void slots.write(acknowledged);
            }}
          />
        )}

        {fpsKey !== null && fpsView !== null && (
          <SlotFpsConfirm
            open={fpsOffer !== null}
            slotName={fpsView.entry.name}
            offer={fpsOffer}
            version={report?.state.version ?? null}
            risk={
              report === null
                ? { booted: false, recovery: false, bootUnnamed: false }
                : writeRisk(report, fpsKey)
            }
            namedByWord={
              report === null ? false : onPlaintextChain(report.state.profile, report.state.version)
            }
            bootWarning={dialogBootWarning}
            saveMode={fpsSaveMode()}
            onConfirm={(acknowledged) => {
              const key = fpsKey;
              setFpsKey(null);
              void slots.patchFps(key, acknowledged);
            }}
            onCancel={() => {
              setFpsKey(null);
            }}
          />
        )}

        {outcome !== null && <OutcomePanel outcome={outcome} />}
        {fpsOutcome !== null && <FpsOutcomePanel result={fpsOutcome} />}
      </Section>

      <Section id="slots-how" title="What these buttons do" icon={<Send />}>
        <Prose>
          <p>
            <strong>Read slots</strong> and <strong>Dump</strong> change nothing in the camera. The
            camera is asked which build it runs before anything else; a build older than 0.8.0.0 is
            reported, and its banks are not read.
          </p>
          <p>
            <strong>Flash decrypted image</strong> takes a plaintext image, encrypts it the way that
            bank&apos;s firmware needs before it is staged, and shows the plan.{' '}
            <strong>Flash raw bytes</strong> stages the file exactly as given. Neither sends
            anything until you confirm.
          </p>
          <p>
            A Compact on 1.3.0.8 can be the 8 Hz build or the 16 Hz FF build, and both report the
            same version. The camera tells them apart itself: its own answer for each bank says
            whether the application that answers takes it, and each build predicts its answers. The
            8 Hz image goes to any bank. The FF image is staged the way the vendor app stages it
            (the image XOR Key A), and the camera stores it under Key B, to any bank. The page
            refuses it while the camera runs the 8 Hz build, and when the camera&apos;s answers
            cannot say which build runs, it refuses unless you tick the 16 Hz box above. Whether the
            FF image boots is UNTESTED: no genuine bootloader for this build is in the corpus.
            Writing R asks for the extra confirmation like any recovery write. An{' '}
            <strong>empty</strong> bank (its header window reads as all 0xFF, as on many 2014
            cameras&apos; bank B) is a state, not a fault. It dumps as the raw 64 KiB of 0xFF with
            nothing to decrypt, and it is written exactly like any other bank; the plan and the
            confirmation say that no firmware is overwritten. When another bank holds a decrypted
            image, <strong>Use the booted bank&apos;s image</strong> prepares a copy of the firmware
            the camera runs now, so a second slot with the same firmware exists. You still review
            the plan and confirm.
          </p>
          <p>
            <strong>Make N FPS</strong> on a bank row edits that bank&apos;s image to a higher frame
            rate. The bank is saved first, as stored and decrypted, and the write waits for the
            saved files. There is no restore button: flash the saved decrypted file to go back. A
            bank that cannot be offered it says why.
          </p>
          <p>
            A write erases one 64 KiB bank and programs it. The bootloader at{' '}
            <code>0x14000000</code> and the boot config are never written here, and there is no
            control for choosing the active bank. The bank takes effect only after the camera is
            unplugged and replugged.
          </p>
        </Prose>
      </Section>
    </>
  );
}
