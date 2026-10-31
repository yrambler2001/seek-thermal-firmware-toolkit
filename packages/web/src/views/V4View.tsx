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
import { CircleStop, FolderArchive, ListFilter, Play, Radar } from 'lucide-react';
import { FLASH_DUMP_ORIGINAL_FILE } from '@seek-fw/core';
import { CameraIdentity } from '@/components/CameraIdentity';
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
import { t, useT } from '@/i18n';

/** The archive's files (names as written) and what each is, translated at render. */
function archiveRows(): readonly (readonly [string, string])[] {
  return [
    [FLASH_DUMP_ORIGINAL_FILE, t('v4:output.flash')],
    ['windows/*.bin', t('v4:output.windows')],
    ['decrypted/*.bin', t('v4:output.decrypted')],
    ['decrypted/*.txt', t('v4:output.reports')],
    ['manifest.json', t('v4:output.manifest')],
    ['README.md', t('v4:output.readme')],
  ];
}

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
  const { rich } = useT();
  const startDisabled = !connected || busy;

  return (
    <>
      <Section id="dump" step="2" title={t('v4:dump.title')} icon={<Radar />}>
        <Toolbar label={t('v4:dump.actions')}>
          <Button
            variant="default"
            disabled={startDisabled}
            onClick={() => {
              void dump.start('dump');
            }}
          >
            <Play />
            {t('v4:dump.start')}
          </Button>
          <Button variant="ghost" disabled={!dump.running} onClick={dump.cancel}>
            <CircleStop />
            {t('common:cancel')}
          </Button>
        </Toolbar>

        <Prose>
          <p>
            {rich('v4:dump.how', {
              params: { getInfo: 'GetFirmwareInfo', begin: 'BeginFirmwareUpgrade' },
            })}
          </p>
          <p>
            {rich('v4:dump.modes', {
              params: { begin: 'BeginFirmwareUpgrade', first: '0x00', last: '0xFF' },
            })}
          </p>
        </Prose>

        <CameraIdentity acting={dump.acting} refusal={dump.refusal} />

        <RunPanel
          id="dump"
          label={t('v4:dump.panel')}
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
                {t('v4:dump.sweep', { first: '0x00', last: '0xFF' })}
              </Button>
              <p className="text-[0.85rem] text-muted-foreground">{t('v4:dump.sweepNote')}</p>
            </>
          }
        />
      </Section>

      <Section id="output" title={t('v4:output.title')} icon={<FolderArchive />}>
        <Prose>
          <p>{rich('v4:output.intro', { params: { ext: '.zip' } })}</p>
        </Prose>

        <Table>
          <TableCaption>{t('v4:output.caption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[19rem]">{t('v4:output.file')}</TableHead>
              <TableHead>{t('v4:output.what')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archiveRows().map(([file, what]) => (
              <TableRow key={file}>
                <TableRowHeader className="font-mono text-[0.8rem] font-normal">
                  {file}
                </TableRowHeader>
                <TableCell label={t('v4:output.what')} className="text-muted-foreground">
                  {what}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Prose>
          <p>{t('v4:output.keyFromDump')}</p>
          <p>{t('v4:output.bestEffort')}</p>
        </Prose>

        <Disclosure summary={t('v4:gap.summary', { address: '0x14060000' })}>
          <p>
            {rich('v4:gap.where', {
              params: { range: '0x14060000..0x1406ffff', fill: '0xff', manifest: 'manifest.json' },
            })}
          </p>
          <p>{rich('v4:gap.costs', { params: { fill: '0xff' } })}</p>
          <p>
            {rich('v4:gap.redundant', {
              params: { address: '0x14060000', before: '0x14050000', after: '0x14070000' },
            })}
          </p>
          <p>{rich('v4:gap.fine', { params: { address: '0x14060000', fill: '0xff' } })}</p>
          <p>{t('v4:gap.complete')}</p>
        </Disclosure>
      </Section>

      <PlatformNotes />
    </>
  );
}
