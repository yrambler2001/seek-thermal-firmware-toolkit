/* ====================================================================
 * The keys the slot writes use, said before anything is picked, in the form
 * the line uses (core's `WriteKeyForm`): the 2014 plaintext chain's image as it
 * is; the 2016 Compact PRO's image under its own key block 0, which the camera
 * stores under the key its bootloader checks; the 1.3.0.8 FF image in the
 * vendor's form, which the camera stores under Key B; or the key the booted
 * bank holds, from which every bank's keys are derived. And the measured reason
 * when the camera cannot be written. The verdict is core's (`deriveWriteKeys`,
 * `slotWriteRefusal`); this component only shows it. The CLI's `slots list`
 * prints the same verdict, row for row (`writeKeyLines`).
 * ==================================================================== */

import type { ReactElement } from 'react';
import { KeyRound } from 'lucide-react';
import {
  bankNameOf,
  derivedKeyLine,
  deriveWriteKeys,
  FF_VENDOR_STAGED,
  FF_VENDOR_STORED,
  STAGED_UNDER_IMAGE_BLOCK_0,
  storedUnderCheckKey,
  writeBannerOf,
  type SlotsReport,
  type WriteKeyForm,
} from '@seek-fw/core';
import { KeyValue } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';

export interface WriteKeysVerdict {
  /** The measured reason no bank can be written, or null. */
  readonly refusal: string | null;
  /**
   * How the keys are chosen: 'plain' on the 2014 plaintext chain (no key is derived; not a refusal),
   * 'image-block-0' on the 2016 Compact PRO (the image's own key block 0; the camera stores under the key its
   * bootloader checks), 'ff-vendor' on a 1.3.0.8 FF camera with no bank stored plain (the vendor's form, stored
   * under Key B), 'derived' on the modern line.
   */
  readonly form: WriteKeyForm;
  /**
   * Why the derivation names no key, when it does not ('derived' only): the row the CLI prints as "refused".
   * Not the banner (`refusal`), which is camera-wide.
   */
  readonly keysRefusal: string | null;
  /** The booted bank's name, as the page shows it ("slot A"), or null when none is named. */
  readonly bootedName: string | null;
  /**
   * The key every bank is stored under (e.g. "Key B"); on the 2016 line the key its bootloader checks a bank
   * under ("key block 1"), or null when the read did not name it.
   */
  readonly keyName: string | null;
  /** The key the booted bank holds (e.g. "Key A"), or null when the page cannot name it. */
  readonly bootedKeyName: string | null;
  /** The 2016 line: what a written bank is stored under, in core's words (`storedUnderCheckKey`); else null. */
  readonly storedAs: string | null;
  /** One line per fact the derivation relied on. */
  readonly evidence: readonly string[];
}

/** The verdict for a report: core's answer, with the booted bank named as the page names it. */
export function writeKeysVerdictOf(report: SlotsReport): WriteKeysVerdict {
  const keys = deriveWriteKeys(report.state);
  const booted =
    keys.booted === null
      ? null
      : (report.slots.find((view) => view.entry.key === keys.booted)?.entry.name ??
        bankNameOf(keys.booted));
  return {
    /* The banner's text is core's (writeBannerOf): the same words the CLI's JSON carries. */
    refusal: writeBannerOf(report.state),
    form: keys.form,
    keysRefusal: keys.refusal,
    bootedName: booted,
    keyName: keys.atRest?.name ?? null,
    bootedKeyName: keys.bootedKeyName,
    storedAs: keys.form === 'image-block-0' ? storedUnderCheckKey(keys) : null,
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
  if (verdict.form === 'plain') {
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
  if (verdict.form === 'image-block-0') {
    /* The 2016 Compact PRO: staged under the image's own key block 0, stored by the camera under the key its
     * bootloader checks a bank under (core's evidence names it, and the bank it was named from). */
    return (
      <Panel className="mt-3">
        <PanelTitle icon={<KeyRound />}>Keys for the writes</PanelTitle>
        <KeyValue
          rows={[
            ['Staged as', STAGED_UNDER_IMAGE_BLOCK_0],
            ['Stored as', verdict.storedAs ?? storedUnderCheckKey({ atRest: null })],
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
  if (verdict.form === 'ff-vendor') {
    /* The 1.3.0.8 FF build with no bank stored plain: the FF image in the vendor's form, stored by the camera
     * under Key B (core's rows, the CLI's `staged as` and `stored as`; TESTING.md 42.89). */
    return (
      <Panel className="mt-3">
        <PanelTitle icon={<KeyRound />}>Keys for the writes</PanelTitle>
        <KeyValue
          rows={[
            ['Staged as', FF_VENDOR_STAGED],
            ['Stored as', FF_VENDOR_STORED],
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
  if (verdict.keyName === null && verdict.keysRefusal !== null) {
    /* The derivation names no key, but nothing refuses the camera as a whole (the banner is not shown): the
     * row says why, as the CLI's "refused" row does. */
    return (
      <Panel className="mt-3">
        <PanelTitle icon={<KeyRound />}>Keys for the writes</PanelTitle>
        <KeyValue rows={[['Refused', verdict.keysRefusal]]} />
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
