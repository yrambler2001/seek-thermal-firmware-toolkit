/**
 * What a prepared slot write would do, shown before anything is sent.
 *
 * The compare rows, the warnings and the payload sizes are all core's
 * `SlotFlashPlan`, shown as it gives them. Nothing here recomputes them. The
 * button only opens the confirmation; the write itself is the next step.
 */

import type { ReactElement } from 'react';
import { FileUp, Flame } from 'lucide-react';
import {
  hexUp,
  type SlotFlashPlan,
  type SlotInputKind,
  bankParam,
  derivedKeyLineMessage,
  stagingDetailMessage,
} from '@seek-fw/core';
import { coreText, coreTexts } from '@/lib/core-text';
import { t } from '@/i18n';
import { KeyValue, type KeyValueRow } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from './ui/table';
import { Toolbar } from './ui/toolbar';

/** One 0x50 command carries at most this many bytes (the EP0 buffer). */
const CHUNK = 64;

/** What the Stored afterwards row says, by what the plan predicts and how it relates to the payload. */
function storedText(plan: SlotFlashPlan): string {
  if (plan.expectedStored === null) return t('slots:preview.storedNotPredicted');
  const size = plan.expectedStored.length.toLocaleString();
  return plan.storedForm === 'key-b-ciphertext'
    ? t('slots:preview.storedKeyB', { size })
    : t('slots:preview.storedPredicted', { size });
}

export interface SlotFlashPreviewProps {
  readonly slotName: string;
  readonly address: number;
  /** What is written, in words (`PendingSlotFlash.what`): shown as the File row when the person picked a file. */
  readonly what: string;
  readonly kind: SlotInputKind;
  readonly plan: SlotFlashPlan;
  readonly busy: boolean;
  /** The bank holds no image (its header window reads as all 0xFF): the write overwrites no firmware. */
  readonly targetEmpty?: boolean;
  /** Where the image came from when it is not a picked file: another bank, or a bank of a full flash backup. */
  readonly source?: string | null;
  /** What is saved before the write (core's `backupPlanText` and the page's download note). */
  readonly backupText: string;
  readonly onWrite: () => void;
  readonly onDiscard: () => void;
}

export function SlotFlashPreview({
  slotName,
  address,
  what,
  kind,
  plan,
  busy,
  targetEmpty = false,
  source = null,
  backupText,
  onWrite,
  onDiscard,
}: SlotFlashPreviewProps): ReactElement {
  const chunks = Math.ceil(plan.payload.length / CHUNK);
  /* Only this write's own notes join the warnings: the camera's notes are above the device panel and the
   * bank's own are on its row, both in this section already (TESTING.md 42.88). */
  const writeNotes = plan.notes.filter((note) => note.source === 'write');
  const readFirst = [
    ...coreTexts(plan.warningMessages, plan.warnings),
    ...writeNotes.map((note) =>
      t('slots:preview.note', { note: coreText(note.message ?? note.text) }),
    ),
  ];
  const rows: readonly KeyValueRow[] = [
    /* A copy or a restore names its source instead of a file the person does not have (TESTING.md 42.96). */
    /* i18n: core message (the source) */
    source === null ? [t('slots:preview.file'), what] : [t('slots:preview.source'), source],
    ...(targetEmpty
      ? [
          [
            t('slots:preview.target'),
            t('slots:preview.targetEmpty', { bank: slotName }),
          ] satisfies KeyValueRow,
        ]
      : []),
    [
      /* What the file is; the Staging row says how it is sent (core's `stagingDetail`), so the two rows do
       * not say it twice (TESTING.md 42.87). */
      t('slots:preview.readAs'),
      kind === 'plain'
        ? plan.staging === 'key-a-keystream'
          ? t('slots:preview.readAs.ff', { version: '1.3.0.8' })
          : t('slots:preview.readAs.plain')
        : t('slots:preview.readAs.raw'),
    ],
    [t('slots:preview.staging'), coreText(stagingDetailMessage(plan.staging))],
    ...(plan.derivedFrom
      ? ([
          [
            t('slots:preview.key'),
            coreText(derivedKeyLineMessage(plan.derivedFrom, bankParam(plan.derivedFrom.bank))),
          ],
        ] as const satisfies readonly KeyValueRow[])
      : []),
    [
      t('slots:preview.payload'),
      t('slots:preview.payloadValue', {
        size: plan.payload.length.toLocaleString(),
        count: chunks,
        chunk: CHUNK,
      }),
    ],
    [t('slots:preview.checksum'), hexUp(plan.sum16, 4)],
    [t('slots:preview.stored'), storedText(plan)],
    [t('slots:preview.savedFirst'), backupText],
  ];

  return (
    <Panel>
      <PanelTitle icon={<FileUp />}>
        {t('slots:preview.title', { bank: slotName, address: hexUp(address) })}
      </PanelTitle>
      <KeyValue rows={rows} />

      {plan.compare.length > 0 && (
        <div className="mt-3">
          <Table>
            <TableCaption>{t('slots:preview.compareCaption', { bank: slotName })}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('slots:preview.col.field')}</TableHead>
                <TableHead>{t('slots:preview.col.now')}</TableHead>
                <TableHead>{t('slots:preview.col.after')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* i18n: core message (the compare rows' field names) */}
              {plan.compare.map((row) => (
                <TableRow key={row.field}>
                  <TableRowHeader>{row.field}</TableRowHeader>
                  <TableCell
                    label={t('slots:preview.col.now')}
                    className="font-mono text-[0.8rem] [overflow-wrap:anywhere]"
                  >
                    {row.before}
                  </TableCell>
                  <TableCell
                    label={t('slots:preview.col.after')}
                    className="font-mono text-[0.8rem] [overflow-wrap:anywhere]"
                  >
                    {row.after}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {readFirst.length > 0 && (
        <Alert tone="warn" className="mt-3">
          <p>
            <strong>{t('slots:preview.readFirst')}</strong>
          </p>
          <ul>
            {readFirst.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Prose className="mt-3">
        <p>{t('slots:preview.nothingSent', { bank: slotName })}</p>
      </Prose>

      <Toolbar label={t('slots:preview.toolbar', { bank: slotName })} className="mt-3">
        <Button
          variant="destructive"
          disabled={busy}
          onClick={() => {
            /* Only ever a step towards the write: the confirmation decides. */
            onWrite();
          }}
        >
          <Flame />
          {t('slots:preview.write', { bank: slotName })}
        </Button>
        <Button variant="ghost" onClick={onDiscard}>
          {t('slots:preview.discard')}
        </Button>
      </Toolbar>
    </Panel>
  );
}
