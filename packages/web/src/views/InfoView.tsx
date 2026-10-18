/**
 * Info: the landing tab. It reads the firmware version of the connected camera
 * (the only camera read this tab makes, and it writes nothing), says which
 * firmware line that version belongs to, and tells the person in plain words
 * what each tab is for and which cameras it covers.
 */

import type { ReactElement } from 'react';
import { CircleStop, Info as InfoIcon, ListChecks, ScanSearch } from 'lucide-react';
import { KeyValue, type KeyValueRow } from '@/components/KeyValue';
import { Panel, PanelTitle } from '@/components/Panel';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
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
import { firmwareLineOf } from '@/lib/family-line';
import { ROUTE_HREF, ROUTE_LABEL, type Route } from '@/lib/routing';

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
const TABS: readonly TabGuide[] = [
  {
    route: 'info',
    does: 'Reads the firmware version the camera reports. Nothing else.',
    cameras: 'Any Seek camera that WebUSB can open.',
    writes: 'No.',
  },
  {
    route: 'preserve',
    does:
      'Makes a complete copy of the camera’s 4 MiB flash, with a run file saved after every step, ' +
      'and can put a patched firmware back in place. It walks through the steps one at a time.',
    cameras:
      'Cameras on 0.x and 1.x firmware: the 2014 Compact builds, the 2016 Compact PRO builds (1.0.3.x), ' +
      'and the 1.3.0.8 FF (16 Hz) Compact build.',
    writes: 'Yes, in two steps, and each asks first. It puts the camera back as it was.',
  },
  {
    route: 'v4',
    does:
      'Reads the whole flash of a 4.x or Nano camera and decrypts the firmware slots it finds. ' +
      'Read-only: it sends six read commands and no write.',
    cameras:
      'Cameras on 4.x firmware (Compact, Compact PRO, Compact XR), Mosaic (10.x and 2.x) and Nano ' +
      '(42.x and 44.x), from 2018 on.',
    writes: 'No.',
  },
  {
    route: 'decrypt',
    does:
      'Decrypts a file you already have: a whole dump, slot by slot, or one 64 KiB firmware slot ' +
      'on its own. The result can be downloaded.',
    cameras: 'None. It uses no camera, so it works with nothing plugged in and in any browser.',
    writes: 'No. It only writes the download.',
  },
  {
    route: 'slots',
    does:
      'Reads the three firmware banks (A, B and the recovery bank R), shows what each holds and ' +
      'which one the camera boots, and can dump or write one bank at a time.',
    cameras: 'Cameras on 0.8.0.0 and newer firmware.',
    writes: 'Yes, one bank at a time, and each write asks first.',
  },
];

/** The tab a version belongs to, or null when the version says nothing. */
function tabFor(version: string | null): Route | null {
  const line = firmwareLineOf(version);
  if (line === 'legacy') return 'preserve';
  if (line === 'modern') return 'v4';
  return null;
}

function lineLabel(version: string | null): string {
  const line = firmwareLineOf(version);
  if (line === 'legacy') return '0.x / 1.x: the 2014 and 2016 cameras';
  if (line === 'modern') return '4.x / Nano';
  return 'unknown';
}

export function InfoView({ info, connected, busy }: InfoViewProps): ReactElement {
  const { result } = info;
  const version = result?.version ?? null;
  const target = tabFor(version);
  const rows: readonly KeyValueRow[] | null =
    result === null
      ? null
      : [
          ['Firmware version', version],
          ['Build', result.buildString],
          ['Line', version === null ? null : lineLabel(version)],
          ['Tab for this camera', target === null ? null : ROUTE_LABEL[target]],
        ];

  return (
    <>
      <Section
        id="info-read"
        step="2"
        title="Read the firmware version"
        icon={<ScanSearch />}
        description="Read-only. Asks the camera what firmware it runs. Nothing is armed, read or written beyond that."
      >
        <Toolbar label="Info actions">
          <Button
            variant="default"
            disabled={!connected || busy}
            onClick={() => {
              void info.read();
            }}
          >
            <ScanSearch />
            Read firmware version
          </Button>
          <Button variant="ghost" disabled={!info.reading} onClick={info.cancel}>
            <CircleStop />
            Cancel
          </Button>
        </Toolbar>

        {!connected && (
          <Prose>
            <p>Connect the camera above first, then press Read firmware version.</p>
          </Prose>
        )}

        <RunPanel
          id="info"
          label="Firmware version"
          progress={info.reporter.progress}
          lines={info.reporter.lines}
          trimmed={info.reporter.trimmed}
        />

        {result !== null && rows !== null && (
          <Panel>
            <PanelTitle icon={<InfoIcon />}>What the camera reports</PanelTitle>
            <KeyValue rows={rows} />
            {version === null && (
              <Alert tone="warn" className="mt-3">
                <p>
                  <strong>The camera did not report its firmware version.</strong> Nothing else was
                  sent. Unplug it, let it finish starting up, plug it back in and read again.
                </p>
              </Alert>
            )}
            {!result.gate.permitsArming && version !== null && (
              <Alert tone="err" className="mt-3">
                <p>
                  <strong>No tab reads this build.</strong>
                </p>
                <p>{result.gate.reason}</p>
              </Alert>
            )}
            {result.gate.permitsArming && target !== null && (
              <Prose className="mt-3">
                <p>
                  Open <a href={ROUTE_HREF[target]}>{ROUTE_LABEL[target]}</a> for this camera. That
                  tab asks the camera which family it is again before it reads anything, and refuses
                  a camera that is not the family it covers.
                </p>
              </Prose>
            )}
          </Panel>
        )}
      </Section>

      <Section id="tabs" title="What each tab is for" icon={<ListChecks />}>
        <Prose>
          <p>
            Five tabs, in this order. Each one is a page of its own, and the header shows which one
            you are on.
          </p>
        </Prose>
        <Table>
          <TableCaption>
            The tabs, what they do, the cameras they cover and whether they write
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12rem]">Tab</TableHead>
              <TableHead>What it does</TableHead>
              <TableHead>Cameras</TableHead>
              <TableHead>Writes to the camera?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABS.map((tab) => (
              <TableRow key={tab.route}>
                <TableRowHeader className="font-semibold">
                  <a href={ROUTE_HREF[tab.route]} className="underline underline-offset-2">
                    {ROUTE_LABEL[tab.route]}
                  </a>
                </TableRowHeader>
                <TableCell label="What it does">{tab.does}</TableCell>
                <TableCell label="Cameras" className="text-muted-foreground">
                  {tab.cameras}
                </TableCell>
                <TableCell label="Writes to the camera?">{tab.writes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section id="split" title="Where the 2016 and 1.3.0.8 FF builds are" icon={<InfoIcon />}>
        <Prose>
          <p>
            The 2016 Compact PRO builds (1.0.3.0 and 1.0.3.2, including their FF variants) and the
            1.3.0.8 FF (16 Hz) Compact build are <strong>not</strong> 4.x cameras, and they are not
            read like one. Their protocol is the locked 2014–2017 one, and their firmware stores the
            slots under a different cipher (2016) or as the 2014 plaintext chain with a
            recovery-only route (FF). So they are on{' '}
            <strong>Dump &amp; decrypt 0.x/1.x 2014/2016</strong>, and the 4.x/Nano tab refuses them
            before it reads anything.
          </p>
          <p>
            The evidence that they work on the 0.x/1.x tab: the Preserve pipeline has a derived
            patch for each of them (the build table in{' '}
            <code>packages/core/src/preservation/patch.ts</code>), and its emulator runs are green
            for both. The 1.0.3.0 build on its native 2016 dump went through backup, patch, commit,
            drain, restore and verify; the 1.3.0.8 FF went through its recovery route. On the bench
            camera, a Compact PRO 1.0.3.0, the Preserve step 02 read completed with no reset and no
            write, and the camera was identified as the 2016 cipher. On these builds the 4.x
            selector map is refused for 38 of its 63 selectors (<code>compact-2016.ts</code>), so
            the 4.x tab could only return gaps for them.
          </p>
          <p>
            So they stay on the 0.x/1.x tab, and the 4.x/Nano tab has no family selector that would
            send them there.
          </p>
        </Prose>
      </Section>
    </>
  );
}
