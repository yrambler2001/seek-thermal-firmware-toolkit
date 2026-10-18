/**
 * Decrypt File/Slot: the tab that needs no camera at all.
 *
 * Two offline jobs, each a file the person picks and nothing else:
 *  - a whole dump you already have (from an earlier run, J-Link or an SPI
 *    programmer), decrypted slot by slot;
 *  - ONE 64 KiB firmware slot (a bank), decrypted to the plain image, with the
 *    key it was solved under, its size and its SHA-256 shown.
 *
 * Nothing here reads USB. The page must work in a browser with no WebUSB, and
 * with no camera plugged in at all.
 */

import type { ReactElement } from 'react';
import { CircleStop, FileKey2, FileSearch, Download } from 'lucide-react';
import type { SlotFileResult } from '@seek-fw/core';
import { DetectionBox } from '@/components/DetectionBox';
import { FilePickerButton } from '@/components/FilePickerButton';
import { KeyValue, type KeyValueRow } from '@/components/KeyValue';
import { Panel, PanelTitle } from '@/components/Panel';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/ui/toolbar';
import type { OfflineDecryptApi } from '@/hooks/useOfflineDecrypt';
import type { SlotFileApi } from '@/hooks/useSlotFileDecrypt';

const DUMP_FILE_ACCEPT = '.bin,.img,.rom,application/octet-stream';

export interface DecryptViewProps {
  readonly offline: OfflineDecryptApi;
  readonly slotFile: SlotFileApi;
  /** A camera run is going on in another tab section; the pickers wait for it. */
  readonly busy: boolean;
}

/** The key, in words: which way it was obtained, and the form it takes. */
function keyRows(result: Extract<SlotFileResult, { kind: 'decrypted' }>): readonly KeyValueRow[] {
  const { key } = result;
  if (key.method === 'stored-plain') {
    return [['Key', 'none: the bank holds the image in the clear (the 2014 plaintext chain)']];
  }
  if (key.method === 'ff-key-b') {
    return [
      ['Key', `${key.keyHex ?? ''} — Key B of the 1.3.0.8 FF pair`],
      ['Stored as', 'the image XOR the Key B keystream, header window verbatim'],
    ];
  }
  return [
    ['Key', key.keyHex ?? 'none'],
    [
      'Key form',
      `K=${key.whiteningK === null ? '' : `0x${key.whiteningK.toString(16).padStart(8, '0')}`} — ${
        key.evidence === 'plaintext'
          ? 'the image itself holds this form once, which names it'
          : 'no form occurs once in the image, so the family default is shown'
      }`,
    ],
  ];
}

function SlotResult({ slotFile }: { readonly slotFile: SlotFileApi }): ReactElement | null {
  const { file, result, inputSha256, readError, busy } = slotFile;
  if (file === null) return null;
  if (busy) {
    return (
      <Prose>
        <p>{`Decrypting ${file.name} …`}</p>
      </Prose>
    );
  }
  if (readError !== null) {
    return (
      <Alert tone="err">
        <p>
          <strong>The file could not be read.</strong>
        </p>
        <p>{readError}</p>
      </Alert>
    );
  }
  if (result === null) return null;

  if (result.kind === 'refused') {
    return (
      <Alert tone="err">
        <p>
          <strong>Not decrypted: {file.name} is not a firmware slot this page can decrypt.</strong>
        </p>
        <p>{result.reason}</p>
        <p>
          Nothing was written anywhere. Pick a 64 KiB bank file, or a whole dump in the section
          above.
        </p>
      </Alert>
    );
  }
  if (result.kind === 'empty') {
    return (
      <Alert tone="warn">
        <p>
          <strong>{file.name} is an erased bank.</strong>
        </p>
        <p>{result.reason}</p>
      </Alert>
    );
  }

  const rows: readonly KeyValueRow[] = [
    ['File', file.name],
    ['File size', `${file.size.toLocaleString()} B`],
    ['SHA-256 of the file', inputSha256 ?? ''],
    ['Image version', result.header.versionStr],
    ['Image size', `${result.plain.length.toLocaleString()} B`],
    ['Image SHA-256', result.plainSha256],
    ['Acceptance sum', `0x${result.acceptanceSum.toString(16).padStart(8, '0')}`],
    [
      'Family',
      result.families.length === 0
        ? 'none: no registered family accepts this sum, so the bootloader would not take it as it stands'
        : result.families.join(', '),
    ],
    ...keyRows(result),
  ];

  return (
    <Panel>
      <PanelTitle icon={<FileKey2 />}>Decrypted firmware slot</PanelTitle>
      <KeyValue rows={rows} />
      {result.notes.length > 0 && (
        <Prose className="mt-3">
          <ul>
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Prose>
      )}
      <Toolbar label="Decrypted image actions" className="mt-3">
        <Button
          variant="default"
          onClick={() => {
            slotFile.download();
          }}
        >
          <Download />
          {`Download ${slotFile.downloadName ?? 'the decrypted image'}`}
        </Button>
      </Toolbar>
    </Panel>
  );
}

export function DecryptView({ offline, slotFile, busy }: DecryptViewProps): ReactElement {
  return (
    <>
      <Section
        id="offline"
        title="Decrypt a dump you already have"
        icon={<FileSearch />}
        description="A whole flash dump, decrypted slot by slot."
      >
        <Prose>
          <p>
            Step 2 of the 4.x/Nano tab already decrypts everything it reads, so you only need this
            if your flash image came from somewhere else — an earlier run, J-Link, or an SPI
            programmer. The file is read locally and never uploaded.{' '}
            <strong>This part works in every browser</strong>, including Safari and iOS, because it
            needs no USB access.
          </p>
        </Prose>

        <Toolbar label="Offline decrypt actions">
          <FilePickerButton
            id="filePick"
            variant="default"
            icon={<FileSearch />}
            label="Choose dump file…"
            accept={DUMP_FILE_ACCEPT}
            disabled={busy}
            onPick={(file) => {
              void offline.decryptFile(file);
            }}
          />
          <Button variant="ghost" disabled={!offline.running} onClick={offline.cancel}>
            <CircleStop />
            Cancel
          </Button>
        </Toolbar>

        <RunPanel
          id="offline"
          label="Offline decrypt"
          progress={offline.reporter.progress}
          lines={offline.reporter.lines}
          trimmed={offline.reporter.trimmed}
        />

        {offline.detection !== null && (
          <Panel>
            <PanelTitle icon={<FileSearch />}>Detected firmware profile</PanelTitle>
            <Prose className="mb-3">
              <p>
                No camera is attached, so the family is scored from the images in the file itself.
                The key is solved out of each slot&apos;s ciphertext either way; this is what names
                the cipher profile in the report.
              </p>
            </Prose>
            <DetectionBox detection={offline.detection} />
          </Panel>
        )}
      </Section>

      <Section
        id="slotfile"
        title="Decrypt a firmware slot"
        icon={<FileKey2 />}
        description="One bank, from a file: 64 KiB, as the camera stores it."
      >
        <Prose>
          <p>
            Pick a file that holds one firmware slot — a bank, 65,536 bytes, the way a slot dump on
            the <a href="#/slots">Work with firmware slots</a> tab saves it, or the 64 KiB at a
            bank&apos;s address in a whole-flash dump. The page finds the key from the bank&apos;s
            own bytes, decrypts the image, and offers it for download with the key, the size and the
            SHA-256 shown. No camera is used, so this works with nothing plugged in.
          </p>
          <p>
            A file that is not one bank, holds no firmware image, or does not decrypt is refused
            with the reason. An erased bank says so and has nothing to decrypt.
          </p>
        </Prose>

        <Toolbar label="Slot file actions">
          <FilePickerButton
            id="slotFilePick"
            variant="default"
            icon={<FileSearch />}
            label="Choose slot file…"
            accept={DUMP_FILE_ACCEPT}
            disabled={busy}
            onPick={(file) => {
              void slotFile.decrypt(file);
            }}
          />
        </Toolbar>

        <SlotResult slotFile={slotFile} />
      </Section>
    </>
  );
}
