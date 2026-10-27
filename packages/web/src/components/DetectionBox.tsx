/**
 * Which firmware family the evidence pointed at, how strongly, and why.
 *
 * NEW versus the original page, which assumed one family everywhere and
 * silently produced nonsense on any other. Shared by the flash view (evidence
 * from the camera) and the offline decryptor (evidence from the dump file).
 */

import type { ReactElement } from 'react';
import type { DetectionResult } from '@seek-fw/core';
import { KeyValue, type KeyValueRow } from './KeyValue';
import { Prose } from './Prose';
import { Alert } from './ui/alert';

export interface DetectionBoxProps {
  readonly detection: DetectionResult;
  /**
   * What the score was taken from, after "of 1.00": the camera's first answers before any bank is read
   * (the probe, as the run's log line says), or the images in a file. The Info tab's Firmware family panel labels
   * its own score the same way (TESTING.md 42.86, 42.87).
   */
  readonly scoreBasis: string;
  /** The profile actually used, when it differs from the one detected. */
  readonly actingName?: string | undefined;
}

export function DetectionBox({
  detection,
  scoreBasis,
  actingName,
}: DetectionBoxProps): ReactElement {
  const best = detection.best;
  const rows: readonly KeyValueRow[] = [
    ['Detected', best.profile.name],
    [
      'Score',
      <span key="score" className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-1 w-20 shrink-0 overflow-hidden rounded-full bg-muted"
        >
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${String(Math.round(Math.max(0, Math.min(1, best.score)) * 100))}%` }}
          />
        </span>
        {`${best.score.toFixed(2)} of 1.00, ${scoreBasis}`}
      </span>,
    ],
    ['Read as', actingName === best.profile.name ? null : (actingName ?? null)],
    ['Summary', best.profile.summary],
  ];

  return (
    <>
      <KeyValue rows={rows} />
      <Prose className="mt-3">
        <p>Why:</p>
        <ul>
          {best.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </Prose>
      {detection.ambiguous && (
        <Alert tone="warn" className="mt-3">
          <p>
            <strong>The evidence did not settle which family this is.</strong> Either the winner
            scored no better than the generic fallback, or a runner-up came too close to call. The
            decryption is unaffected — the key is solved out of the ciphertext either way — but the
            family named in the report, and anything gated on it, is a guess.
          </p>
        </Alert>
      )}
    </>
  );
}
