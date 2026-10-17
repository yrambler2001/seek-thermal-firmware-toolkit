/**
 * The firmware-slot page: the camera's three banks, A, B and the recovery bank
 * R, what each holds, whether the camera boots it, and what this build allows
 * the page to do to it.
 *
 * Reading and dumping change nothing in the camera. A flash button prepares a
 * write, shows exactly what it would do, and asks before it sends a byte.
 */

import { useState, type ReactElement } from 'react';
import { CircleStop, Layers, ScanSearch, Send, ShieldAlert } from 'lucide-react';
import {
  derivedKeyLine,
  hexUp,
  type SlotInputKind,
  type SlotKey,
  type SlotsReport,
} from '@seek-fw/core';
import { KeyValue, type KeyValueRow } from '@/components/KeyValue';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { SlotFlashPreview } from '@/components/SlotFlashPreview';
import { SlotTable } from '@/components/SlotTable';
import { SlotWriteConfirm } from '@/components/SlotWriteConfirm';
import { SlotWriteKeys, writeKeysVerdictOf } from '@/components/SlotWriteKeys';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/ui/toolbar';
import { writeRisk, type SlotFlashOutcome, type SlotsPanelApi } from '@/hooks/useSlotsPanel';
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

function OutcomePanel({ outcome }: { readonly outcome: SlotFlashOutcome }): ReactElement {
  const { key, fileName, result } = outcome;
  const tone = result.verified === true ? 'ok' : result.verified === false ? 'err' : 'warn';
  return (
    <Alert tone={tone} className="mt-3">
      <p>
        <strong>{`Slot ${key.toUpperCase()} — ${fileName}: ${verdict(result.verified)}`}</strong>
      </p>
      <p>{`The camera's commit returned status ${hexUp(result.commitStatus, 4)}.`}</p>
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
  const { plan, report, refusal, pending, outcome, reading, writing } = slots;
  const unsupported =
    plan !== null && !plan.supportedBuild.supported ? plan.supportedBuild.reason : null;
  const active = report === null ? null : (report.slots.find((view) => view.active) ?? null);
  const pendingView = pending === null ? null : viewOf(pending.report, pending.key);

  const summary: readonly KeyValueRow[] =
    report === null
      ? []
      : [
          ['Running build', report.state.version],
          ['Profile', report.state.profile.name],
          ['Booted now', active?.entry.name ?? 'none the bootloader can name'],
        ];

  return (
    <>
      <Section
        id="slots"
        step="2"
        title="Firmware slots"
        icon={<Layers />}
        aside={
          <Badge tone="err">
            <ShieldAlert />
            Writes to flash
          </Badge>
        }
        description="Reads the camera's three firmware banks — A, B and the recovery bank R — and shows what each holds. Reading and dumping change nothing. A flash button asks before any byte is sent."
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
            <KeyValue rows={summary} />
            <SlotWriteKeys verdict={writeKeysVerdictOf(report)} />
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

        {outcome !== null && <OutcomePanel outcome={outcome} />}
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
