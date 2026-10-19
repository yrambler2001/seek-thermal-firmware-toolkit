/**
 * Dump & decrypt 4.x/Nano: the read-only tab for the 2018-and-later cameras.
 *
 * It runs under one firmware family, the modern 4.x/Nano one, and nothing else:
 * the family selector the page used to have is gone. The camera is still asked
 * which family it is before anything is read (camera detection), and a camera
 * the answers place under another family is refused, with the tab that covers
 * it. "Dump all selectors" lives in the Options spoiler, beside the read settings.
 */

import type { ReactElement } from 'react';
import { CircleStop, FolderArchive, ListFilter, Play, Radar, ShieldCheck } from 'lucide-react';
import { CameraIdentity } from '@/components/CameraIdentity';
import { OpcodeTable, READ_ONLY_OPCODES } from '@/components/OpcodeTable';
import { OptionsDetails } from '@/components/OptionsDetails';
import { PlatformNotes } from '@/components/PlatformNotes';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { UnlockNote } from '@/components/UnlockNote';
import { Button } from '@/components/ui/button';
import { Disclosure } from '@/components/ui/disclosure';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from '@/components/ui/table';
import { Toolbar } from '@/components/ui/toolbar';
import type { DumpPanelApi } from '@/hooks/useDumpPanel';
import type { OptionField, OptionsForm } from '@/lib/options';

const ARCHIVE: readonly (readonly [string, string])[] = [
  ['flash_4m_usb_partial_gap_ff.bin', 'the assembled 4 MiB flash image'],
  ['windows/*.bin', 'each 64 KiB block exactly as it came off the wire'],
  ['decrypted/*.bin', 'every firmware image slot, decrypted (if a key was found)'],
  ['decrypted/*.txt', 'per-slot report: key, key location, cipher profile, SP, entry, SHA-256'],
  ['manifest.json', 'exact read/gap/decryption metadata'],
  ['README.md', 'what the capture is and what its limits are'],
];

export interface V4ViewProps {
  readonly dump: DumpPanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly options: OptionsForm;
  readonly onOptionsChange: (next: OptionsForm) => void;
  readonly optionsInvalidField: OptionField | null;
  readonly optionsErrorMessage: string | null;
}

export function V4View({
  dump,
  connected,
  busy,
  options,
  onOptionsChange,
  optionsInvalidField,
  optionsErrorMessage,
}: V4ViewProps): ReactElement {
  const startDisabled = !connected || busy;

  return (
    <>
      <Section id="dump" step="2" title="Dump" icon={<Radar />}>
        <Toolbar label="Dump actions">
          <Button
            variant="default"
            disabled={startDisabled}
            onClick={() => {
              void dump.start('dump');
            }}
          >
            <Play />
            Start dump
          </Button>
          <Button variant="ghost" disabled={!dump.running} onClick={dump.cancel}>
            <CircleStop />
            Cancel
          </Button>
        </Toolbar>

        <Prose>
          <p>
            Both first ask the camera which firmware it runs: its version, with{' '}
            <code>GetFirmwareInfo</code> — the one read every Seek build answers the same way — and,
            only if that build can be read over USB, one plain and one token-carrying{' '}
            <code>BeginFirmwareUpgrade</code> and a single read. That is how the page tells which
            family the camera is. This tab reads the 4.x and Nano family only. A camera the answers
            place anywhere else is refused before anything is read, and the page names the tab for
            it. A camera that does not report its version, or runs a build older than 0.8.0.0, is
            not read at all, and the page says why.
          </p>
          <p>
            <strong>Start dump</strong> reads every block the build&apos;s own selector table
            reaches. <strong>Dump all selectors</strong>, in <em>Options</em> below, probes every{' '}
            <code>BeginFirmwareUpgrade</code> selector <code>0x00</code>–<code>0xFF</code> and saves
            whatever each one returns — slower, but it also captures blocks the curated map skips.
          </p>
        </Prose>

        <CameraIdentity acting={dump.acting} refusal={dump.refusal} />

        <RunPanel
          id="dump"
          label="Dump"
          progress={dump.reporter.progress}
          lines={dump.reporter.lines}
          trimmed={dump.reporter.trimmed}
        />
        {dump.unlockNote && <UnlockNote />}

        <OptionsDetails
          value={options}
          onChange={onOptionsChange}
          disabled={busy}
          invalidField={optionsInvalidField}
          errorMessage={optionsErrorMessage}
          actions={
            <>
              <Button
                disabled={startDisabled}
                onClick={() => {
                  void dump.start('sweep');
                }}
              >
                <ListFilter />
                Dump all selectors (0x00–0xFF)
              </Button>
              <p className="text-[0.85rem] text-muted-foreground">
                Probes every selector and saves whatever each one returns. Slower than Start dump.
              </p>
            </>
          }
        />
      </Section>

      <Section id="output" title="What you get" icon={<FolderArchive />}>
        <Prose>
          <p>
            A single <code>.zip</code> download containing:
          </p>
        </Prose>

        <Table>
          <TableCaption>Files inside the downloaded archive</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[19rem]">File</TableHead>
              <TableHead>What it is</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ARCHIVE.map(([file, what]) => (
              <TableRow key={file}>
                <TableRowHeader className="font-mono text-[0.8rem] font-normal">
                  {file}
                </TableRowHeader>
                <TableCell label="What it is" className="text-muted-foreground">
                  {what}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Prose>
          <p>
            The key is recovered from the dump itself, so no key file or device secret is needed.
          </p>
          <p>
            Decryption is still best-effort. If no key is found — for example on a unit whose
            bootloader derives the key from chip OTP, which is not present in a flash dump — that
            slot is simply skipped and the rest of the archive is unaffected.
          </p>
        </Prose>
      </Section>

      <PlatformNotes />

      <Section id="readonly" tone="ok" title="Read-only guarantee" icon={<ShieldCheck />}>
        <Prose>
          <p>
            This page can issue exactly six vendor commands. That is its entire vocabulary — there
            is no code path to anything else:
          </p>
        </Prose>

        <OpcodeTable caption="The six read-only vendor commands" rows={READ_ONLY_OPCODES} />

        <Prose>
          <p>
            <code>SetFeaturedFirmwareData</code>, <code>CompleteMemoryUpgrade</code>,{' '}
            <code>ResetDevice</code> and every upload, commit and erase command are absent from this
            view. <code>USBDevice.reset()</code> is never called either; the retry path just closes
            and reopens the handle. Decryption happens entirely in memory on the copy in your
            browser and never touches the device.
          </p>
          <p>
            Writing to the camera lives on another tab,{' '}
            <a href="#/slots">Work with firmware slots</a>, which writes one bank at a time and asks
            before every write. Nothing on <em>this</em> tab can reach those commands.
          </p>
          <p>
            Until the camera has reported its firmware version, only three of the six are sent, and
            only as reads: <code>GetFirmwareInfo</code>, <code>GetOperationMode</code> and{' '}
            <code>GetErrorCode</code>. They are the reads that sit at the same command number, with
            the same meaning, in all 36 firmware images examined; a command number does not mean the
            same thing on every build, so nothing else goes out until the build is known.
          </p>
        </Prose>

        <Disclosure summary="The 0x14060000 gap">
          <p>
            The USB command set exposes a read-window selector for every 64 KiB block of the 4 MiB
            flash except <code>0x14060000..0x1406ffff</code>. That block is filled with{' '}
            <code>0xff</code> in the combined image and recorded in <code>manifest.json</code>.
          </p>
          <p>
            <strong>In practice this costs you nothing.</strong> On most cameras that block is
            simply erased flash, which reads as <code>0xff</code> anyway — so the filler matches
            what is really there and the image is complete.
          </p>
          <p>
            And when the block <em>is</em> in use, what it holds is a redundant copy. These cameras
            keep the same firmware image in several 64 KiB slots: across every multi-slot dump
            checked while building this page, all slots decrypted to byte-identical firmware — in
            one case across four slots that had been written with two different keys. On the one
            unit seen with a real image at <code>0x14060000</code>, it was byte-for-byte the same as
            the copies at <code>0x14050000</code> and <code>0x14070000</code>, so the archive still
            contains that firmware, just read from a different address.
          </p>
          <p>
            That redundancy is also why a camera whose <code>0x14060000</code> reads back as{' '}
            <code>0xff</code> is fine: the bootable firmware still exists in the other slots.
            Nothing on this page writes to the device in any case — the gap affects only the file
            you download.
          </p>
          <p>
            If you do want a strictly complete byte-for-byte image — to diff flash against a
            reference, say — read it over SWD/J-Link or with an SPI programmer.
          </p>
        </Disclosure>
      </Section>
    </>
  );
}
