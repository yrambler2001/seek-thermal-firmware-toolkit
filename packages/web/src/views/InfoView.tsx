/**
 * Info: the landing tab. It reads the connected camera the way `seek-fw info` does (TESTING.md 42.64):
 * the firmware version, the family the camera answers as, the boot state, the keys and every bank. It
 * writes nothing. It says which firmware line the version belongs to, and tells the person in plain words
 * what each tab is for and which cameras it covers.
 */

import { useState, type ReactElement } from 'react';
import { CircleStop, Info as InfoIcon, ListChecks, ScanSearch } from 'lucide-react';
import { KeyValue, type KeyValueRow } from '@/components/KeyValue';
import { Panel, PanelTitle } from '@/components/Panel';
import { Prose } from '@/components/Prose';
import { CameraReport } from '@/components/CameraReport';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { UnlockNote } from '@/components/UnlockNote';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import type { InfoPanelApi } from '@/hooks/useInfoPanel';
import { coreText } from '@/lib/core-text';
import { firmwareLineOf } from '@/lib/family-line';
import { ROUTE_HREF, ROUTE_LABEL, type Route } from '@/lib/routing';
import { t, useT } from '@/i18n';

export interface InfoViewProps {
  readonly info: InfoPanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
}

interface TabGuide {
  readonly route: Route;
  readonly does: string;
  readonly cameras: string;
  readonly writes: string;
}

/** What each tab does, which cameras it is for, and whether it writes. */
function tabGuides(): readonly TabGuide[] {
  return [
    {
      route: 'info',
      does: t('info:tabs.info.does'),
      cameras: t('info:tabs.info.cameras'),
      writes: t('info:tabs.info.writes'),
    },
    {
      route: 'preserve',
      does: t('info:tabs.preserve.does'),
      cameras: t('info:tabs.preserve.cameras'),
      writes: t('info:tabs.preserve.writes'),
    },
    {
      route: 'v4',
      does: t('info:tabs.v4.does'),
      cameras: t('info:tabs.v4.cameras'),
      writes: t('info:tabs.v4.writes'),
    },
    {
      route: 'decrypt',
      does: t('info:tabs.decrypt.does'),
      cameras: t('info:tabs.decrypt.cameras'),
      writes: t('info:tabs.decrypt.writes'),
    },
    {
      route: 'slots',
      does: t('info:tabs.slots.does'),
      cameras: t('info:tabs.slots.cameras'),
      writes: t('info:tabs.slots.writes'),
    },
  ];
}

/** The tab a version belongs to, or null when the version says nothing. */
function tabFor(version: string | null): Route | null {
  const line = firmwareLineOf(version);
  if (line === 'legacy') return 'preserve';
  if (line === 'modern') return 'v4';
  return null;
}

function lineLabel(version: string | null): string {
  const line = firmwareLineOf(version);
  if (line === 'legacy') return t('info:result.rangeLegacy');
  if (line === 'modern') return t('info:result.rangeModern');
  return t('info:result.rangeUnknown');
}

export function InfoView({ info, connected, busy }: InfoViewProps): ReactElement {
  const { rich } = useT();
  /* A detail line is the CLI's --verbose line: hidden until asked for, on both front ends (TESTING.md 42.108). */
  const [showDetails, setShowDetails] = useState(false);
  const { result } = info;
  const version = result?.version ?? null;
  const target = tabFor(version);
  const rows: readonly KeyValueRow[] | null =
    result === null
      ? null
      : [
          [t('info:result.version'), version],
          [t('info:result.build'), result.buildString],
          [t('info:result.range'), version === null ? null : lineLabel(version)],
          [t('info:result.tab'), target === null ? null : ROUTE_LABEL[target]],
        ];

  return (
    <>
      <Section
        id="info-read"
        step="2"
        title={t('info:read.title')}
        icon={<ScanSearch />}
        description={t('info:read.description')}
      >
        <Toolbar label={t('info:read.actions')}>
          <Button
            variant="default"
            disabled={!connected || busy}
            onClick={() => {
              void info.read();
            }}
          >
            <ScanSearch />
            {t('info:read.button')}
          </Button>
          <Button variant="ghost" disabled={!info.reading} onClick={info.cancel}>
            <CircleStop />
            {t('common:cancel')}
          </Button>
        </Toolbar>

        {!connected && (
          <Prose>
            <p>{t('info:read.connectFirst')}</p>
          </Prose>
        )}

        <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
          <input
            type="checkbox"
            id="info-details"
            checked={showDetails}
            onChange={(event) => {
              setShowDetails(event.target.checked);
            }}
          />
          <label htmlFor="info-details">{t('info:read.showDetails')}</label>
        </div>
        <RunPanel
          id="info"
          label={t('info:read.panel')}
          progress={info.reporter.progress}
          lines={
            showDetails
              ? info.reporter.lines
              : info.reporter.lines.filter((line) => line.level !== 'detail')
          }
          trimmed={info.reporter.trimmed}
        />

        {info.unlockNote && <UnlockNote />}

        {result !== null && rows !== null && (
          <>
            <Panel>
              <PanelTitle icon={<InfoIcon />}>{t('info:result.title')}</PanelTitle>
              <KeyValue rows={rows} />
              {version === null && (
                <Alert tone="warn" className="mt-3">
                  <p>{rich('info:result.noVersion')}</p>
                </Alert>
              )}
              {!result.gate.permitsArming && version !== null && (
                <Alert tone="err" className="mt-3">
                  <p>
                    <strong>{t('info:result.noTab')}</strong>
                  </p>
                  <p>{coreText(result.gate.reasonMessage ?? result.gate.reason)}</p>
                </Alert>
              )}
              {result.gate.permitsArming && target !== null && (
                <Prose className="mt-3">
                  <p>
                    {rich('info:result.openTab', {
                      params: { tab: ROUTE_LABEL[target] },
                      slots: { tab: (text) => <a href={ROUTE_HREF[target]}>{text}</a> },
                    })}
                  </p>
                </Prose>
              )}
            </Panel>
            {result.state !== null && <CameraReport state={result.state} />}
          </>
        )}
      </Section>

      <Section id="tabs" title={t('info:tabs.title')} icon={<ListChecks />}>
        <Prose>
          <p>{t('info:tabs.intro')}</p>
        </Prose>
        <Table>
          <TableCaption>{t('info:tabs.caption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12rem]">{t('info:tabs.tab')}</TableHead>
              <TableHead>{t('info:tabs.does')}</TableHead>
              <TableHead>{t('info:tabs.cameras')}</TableHead>
              <TableHead>{t('info:tabs.writes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabGuides().map((tab) => (
              <TableRow key={tab.route}>
                <TableRowHeader className="font-semibold">
                  <a href={ROUTE_HREF[tab.route]} className="underline underline-offset-2">
                    {ROUTE_LABEL[tab.route]}
                  </a>
                </TableRowHeader>
                <TableCell label={t('info:tabs.does')}>{tab.does}</TableCell>
                <TableCell label={t('info:tabs.cameras')} className="text-muted-foreground">
                  {tab.cameras}
                </TableCell>
                <TableCell label={t('info:tabs.writes')}>{tab.writes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </>
  );
}
