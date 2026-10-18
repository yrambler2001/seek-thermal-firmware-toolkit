/* ====================================================================
 * The keys the slot writes use, said before anything is picked: the key the
 * booted bank holds, that every other bank is written the same way (derived
 * from the booted bank), and the measured reason when the camera cannot be
 * written under those keys. The verdict is core's (`deriveWriteKeys`,
 * `slotWriteRefusal`); this component only shows it.
 * ==================================================================== */

import type { ReactElement } from 'react';
import { KeyRound } from 'lucide-react';
import { derivedKeyLine, deriveWriteKeys, slotWriteRefusal, type SlotsReport } from '@seek-fw/core';
import { KeyValue } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';

export interface WriteKeysVerdict {
  /** The measured reason no bank can be written, or null. */
  readonly refusal: string | null;
  /** The 2014 plaintext chain: every bank is stored plain, so no upload key is derived (not a refusal). */
  readonly plainChain: boolean;
  /** The booted bank's name, as the page shows it ("slot A"), or null when none is named. */
  readonly bootedName: string | null;
  /** The key every bank is written under (e.g. "Key B"). */
  readonly keyName: string | null;
  /** The key the booted bank holds (e.g. "Key A"), or null when the page cannot name it. */
  readonly bootedKeyName: string | null;
  /** One line per fact the derivation relied on. */
  readonly evidence: readonly string[];
}

/** The verdict for a report: core's answer, with the booted bank named as the page names it. */
export function writeKeysVerdictOf(report: SlotsReport): WriteKeysVerdict {
  const refusal = slotWriteRefusal(report.state);
  const keys = deriveWriteKeys(report.state);
  const booted =
    keys.booted === null
      ? null
      : (report.slots.find((view) => view.entry.key === keys.booted)?.entry.name ??
        `slot ${keys.booted.toUpperCase()}`);
  return {
    refusal:
      refusal ??
      (!keys.plainChain && keys.atRest === null
        ? (keys.refusal ?? 'the keys could not be derived')
        : null),
    plainChain: keys.plainChain,
    bootedName: booted,
    keyName: keys.atRest?.name ?? null,
    bootedKeyName: keys.bootedKeyName,
    evidence: keys.evidence,
  };
}

export interface SlotWriteKeysProps {
  readonly verdict: WriteKeysVerdict;
}

export function SlotWriteKeys({ verdict }: SlotWriteKeysProps): ReactElement {
  if (verdict.refusal !== null) {
    return (
      <Alert tone="err" className="mt-3">
        <p>
          <strong>No bank of this camera can be written from here.</strong>
        </p>
        <p>{verdict.refusal}</p>
      </Alert>
    );
  }
  if (verdict.plainChain) {
    return (
      <Panel className="mt-3">
        <PanelTitle icon={<KeyRound />}>Keys for the writes</PanelTitle>
        <KeyValue
          rows={[
            ['Chain', 'the 2014 plaintext chain: every bank is stored plain, so none holds a key'],
            ['Written as', 'the image as it is, with no key, to any bank'],
          ]}
        />
        {verdict.evidence.length > 0 && (
          <Prose>
            <ul>
              {verdict.evidence.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Prose>
        )}
      </Panel>
    );
  }
  const booted = verdict.bootedName ?? 'the booted bank';
  const bootedKey = verdict.bootedKeyName ?? 'a key the page cannot name';
  const key = verdict.keyName ?? 'the booted bank’s key';
  return (
    <Panel className="mt-3">
      <PanelTitle icon={<KeyRound />}>Keys for the writes</PanelTitle>
      <KeyValue
        rows={[
          ['Booted bank', `${booted} holds ${bootedKey}`],
          [
            'Written as',
            `${derivedKeyLine({ key, holds: verdict.bootedKeyName }, booted)}; every bank is written the same way`,
          ],
        ]}
      />
      {verdict.evidence.length > 0 && (
        <Prose>
          <ul>
            {verdict.evidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Prose>
      )}
    </Panel>
  );
}
