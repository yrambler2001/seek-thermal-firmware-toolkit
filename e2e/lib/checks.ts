/** Small helpers the e2e files share for reading what a run produced. */

import { createHash } from 'node:crypto';

import type { ZipEntry } from './zip.js';

export function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function names(entries: readonly ZipEntry[]): string[] {
  return entries.map((entry) => entry.name);
}

export function entry(entries: readonly ZipEntry[], name: string): Uint8Array {
  const found = entries.find((candidate) => candidate.name === name);
  if (found === undefined) {
    throw new Error(`the archive has no ${name} (it has: ${names(entries).join(', ')})`);
  }
  return found.data;
}

/** One step's record in `preserve_run.json`. */
export interface StepRecordView {
  readonly status: string;
  readonly notes?: string;
  readonly artifactShas?: Readonly<Record<string, string>>;
  readonly rebootRefused?: boolean;
}

/** The fields of `preserve_run.json` the e2e files assert on. */
export interface RunStateView {
  readonly runId: string;
  readonly nextStep: string;
  readonly expectedVersion?: string;
  readonly steps: Readonly<Record<string, StepRecordView | undefined>>;
  readonly verify?: {
    readonly diffBytes: number;
    readonly windowsRead: number;
    readonly badWindows: number[];
  };
  readonly deliveredSha256?: string;
  readonly rawDumpSha256?: string;
  readonly buildId?: string;
  readonly buildLabel?: string;
  readonly buildFamily?: string;
  readonly imageSha256?: string;
  readonly imageDerivation?: {
    readonly id: string;
    readonly label: string;
    readonly balanceWord: number;
  };
  readonly stagedForm?: string;
  readonly restoreForm?: string;
  readonly route?: string;
  readonly slotReadShas?: readonly string[];
  readonly detection?: {
    readonly cfg0: number;
    readonly blank: boolean;
    readonly bank: string;
    readonly bankAddress: number;
    readonly bankMode: number;
  };
  readonly patch?: {
    readonly sites: readonly {
      readonly name: string;
      readonly offset: number;
      readonly before: readonly number[];
      readonly after: readonly number[];
    }[];
    readonly rebalanceWord?: number;
    readonly stagedLength?: number;
    readonly chunkCount?: number;
    readonly patchedSha256?: string;
    readonly diffCount?: number;
    readonly armResetsCursor?: boolean;
  };
}

export function runState(entries: readonly ZipEntry[]): RunStateView {
  return JSON.parse(new TextDecoder().decode(entry(entries, 'preserve_run.json'))) as RunStateView;
}

/** What went out on the wire between two snapshots of `UsbBridge.counts`. */
export function wireSince(
  before: ReadonlyMap<string, number>,
  after: ReadonlyMap<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const [key, n] of after) {
    const delta = n - (before.get(key) ?? 0);
    if (delta > 0) out.set(key, delta);
  }
  return out;
}

export function describeWire(counts: ReadonlyMap<string, number>): string {
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, n]) => `${key} x${String(n)}`)
    .join(', ');
}
