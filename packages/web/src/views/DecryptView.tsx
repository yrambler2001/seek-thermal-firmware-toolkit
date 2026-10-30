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
import type { SlotFileDecryption } from '@seek-fw/core';
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
import { t, useT } from '@/i18n';
import { ROUTE_LABEL } from '@/lib/routing';

const DUMP_FILE_ACCEPT = '.bin,.img,.rom,application/octet-stream';

export interface DecryptViewProps {
  readonly offline: OfflineDecryptApi;
  readonly slotFile: SlotFileApi;
  /** A camera run is going on in another tab section; the pickers wait for it. */
  readonly busy: boolean;
}

/** The key, in words: which way it was obtained, and the form it takes. */
function keyRows(result: SlotFileDecryption): readonly KeyValueRow[] {
  const { key } = result;
  if (key === null) return [];
  if (key.method === 'stored-plain') {
    return [[t('decrypt:slot.key'), t('decrypt:slot.keyPlain')]];
  }
  if (key.method === 'ff-key-b') {
    return [
      [t('decrypt:slot.key'), key.named ?? t('decrypt:slot.keyFfB')],
      [t('decrypt:slot.storedAs'), t('decrypt:slot.storedAsFfB')],
    ];
  }
  return [
    [
      t('decrypt:slot.key'),
      key.named === null
        ? (key.key ?? t('decrypt:slot.keyNone'))
        : t('decrypt:slot.keyNamed', {
            key: key.key ?? t('decrypt:slot.keyNone'),
            name: key.named,
          }),
    ],
    [
      t('decrypt:slot.keyForm'),
      t(
        key.whiteningEvidence === 'plaintext'
          ? 'decrypt:slot.keyFormOnce'
          : 'decrypt:slot.keyFormDefault',
        {
          k: `K=${key.whiteningK === null ? '' : `0x${key.whiteningK.toString(16).padStart(8, '0')}`}`,
        },
      ),
    ],
  ];
}

/** The family row: its name, then what the image says about it. */
function familyText(result: SlotFileDecryption): string {
  const name = result.profile.name;
  const named = result.profile.detected ? t('decrypt:slot.familyDetected', { name }) : name;
  return result.key?.matchesFamily === false
    ? t('decrypt:slot.familyMismatch', { name: named })
    : named;
}

function SlotResult({ slotFile }: { readonly slotFile: SlotFileApi }): ReactElement | null {
  const { file, result, refusal, inputSha256, readError, busy } = slotFile;
  if (file === null) return null;
  if (busy) {
    return (
      <Prose>
        <p>{t('decrypt:slot.decrypting', { file: file.name })}</p>
      </Prose>
    );
  }
  if (readError !== null) {
    return (
      <Alert tone="err">
        <p>
          <strong>{t('decrypt:slot.unreadable')}</strong>
        </p>
        {/* The browser's own message. */}
        <p>{readError}</p>
      </Alert>
    );
  }
  if (refusal !== null) {
    return (
      <Alert tone="err">
        <p>
          <strong>{t('decrypt:slot.notDecrypted', { file: file.name })}</strong>
        </p>
        {/* i18n: core message */}
        <p>{refusal}</p>
        <p>{t('decrypt:slot.nothingWritten')}</p>
      </Alert>
    );
  }
  if (result === null) return null;

  if (result.status !== 'decrypted' && result.status !== 'empty') {
    return (
      <Alert tone="err">
        <p>
          <strong>{t('decrypt:slot.notDecrypted', { file: file.name })}</strong>
        </p>
        {/* i18n: core message */}
        <p>{result.notes.join(' ')}</p>
        <p>{t('decrypt:slot.nothingWritten')}</p>
      </Alert>
    );
  }
  if (result.status === 'empty') {
    return (
      <Alert tone="warn">
        <p>
          <strong>{t('decrypt:slot.erased', { file: file.name })}</strong>
        </p>
        {/* i18n: core message */}
        <p>{result.notes.join(' ')}</p>
      </Alert>
    );
  }

  const plain = result.plain ?? new Uint8Array(0);
  const rows: readonly KeyValueRow[] = [
    [t('decrypt:slot.file'), file.name],
    [t('decrypt:slot.fileSize'), t('decrypt:slot.bytes', { size: file.size.toLocaleString() })],
    [t('decrypt:slot.fileSha'), inputSha256 ?? ''],
    [t('decrypt:slot.imageVersion'), result.header?.version ?? t('decrypt:slot.unknown')],
    [t('decrypt:slot.imageSize'), t('decrypt:slot.bytes', { size: plain.length.toLocaleString() })],
    [t('decrypt:slot.imageSha'), result.plainSha256 ?? ''],
    [
      t('decrypt:slot.acceptanceSum'),
      result.key?.acceptanceSum == null
        ? t('decrypt:slot.notComputed')
        : `0x${result.key.acceptanceSum.toString(16).padStart(8, '0')}`,
    ],
    [t('decrypt:slot.family'), familyText(result)],
    ...keyRows(result),
  ];

  return (
    <Panel>
      <PanelTitle icon={<FileKey2 />}>{t('decrypt:slot.resultTitle')}</PanelTitle>
      <KeyValue rows={rows} />
      {result.notes.length > 0 && (
        <Prose className="mt-3">
          <ul>
            {/* i18n: core message */}
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Prose>
      )}
      <Toolbar label={t('decrypt:slot.resultActions')} className="mt-3">
        <Button
          variant="default"
          onClick={() => {
            slotFile.download();
          }}
        >
          <Download />
          {t('decrypt:slot.download', {
            file: slotFile.downloadName ?? t('decrypt:slot.downloadFallback'),
          })}
        </Button>
      </Toolbar>
    </Panel>
  );
}

export function DecryptView({ offline, slotFile, busy }: DecryptViewProps): ReactElement {
  const { rich } = useT();
  return (
    <>
      <Section
        id="offline"
        title={t('decrypt:offline.title')}
        icon={<FileSearch />}
        description={t('decrypt:offline.description')}
      >
        <Prose>
          <p>{rich('decrypt:offline.intro')}</p>
        </Prose>

        <Toolbar label={t('decrypt:offline.actions')}>
          <FilePickerButton
            id="filePick"
            variant="default"
            icon={<FileSearch />}
            label={t('decrypt:offline.choose')}
            accept={DUMP_FILE_ACCEPT}
            disabled={busy}
            onPick={(file) => {
              void offline.decryptFile(file);
            }}
          />
          <Button variant="ghost" disabled={!offline.running} onClick={offline.cancel}>
            <CircleStop />
            {t('common:cancel')}
          </Button>
        </Toolbar>

        <RunPanel
          id="offline"
          label={t('decrypt:offline.panel')}
          progress={offline.reporter.progress}
          lines={offline.reporter.lines}
          trimmed={offline.reporter.trimmed}
        />

        {offline.detection !== null && (
          <Panel>
            <PanelTitle icon={<FileSearch />}>{t('decrypt:offline.detectedTitle')}</PanelTitle>
            <Prose className="mb-3">
              <p>{t('decrypt:offline.detectedIntro')}</p>
            </Prose>
            <DetectionBox
              detection={offline.detection}
              scoreBasis={t('decrypt:offline.scoreBasis')}
            />
          </Panel>
        )}
      </Section>

      <Section
        id="slotfile"
        title={t('decrypt:slot.title')}
        icon={<FileKey2 />}
        description={t('decrypt:slot.description')}
      >
        <Prose>
          <p>
            {rich('decrypt:slot.intro', {
              params: { tab: ROUTE_LABEL.slots },
              slots: { link: (text) => <a href="#/slots">{text}</a> },
            })}
          </p>
          <p>{t('decrypt:slot.refusedIntro')}</p>
        </Prose>

        <Toolbar label={t('decrypt:slot.actions')}>
          <FilePickerButton
            id="slotFilePick"
            variant="default"
            icon={<FileSearch />}
            label={t('decrypt:slot.choose')}
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
