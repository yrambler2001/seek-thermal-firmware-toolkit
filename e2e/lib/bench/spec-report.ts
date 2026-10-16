/**
 * What the bench run reports: the plan it prints before it starts, one result
 * line per subject on stdout, and the matrix (JSON and markdown) in the report
 * directory. Names are the tree's family, version and folder, and file basenames;
 * no absolute path and no serial number is written here.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  subjectLabel,
  type SlotWriteResult,
  type StepState,
  type SubjectResult,
} from './spec-flow.js';
import type { BenchSubject } from './types.js';

export type RunMode = 'bench' | 'dry' | 'fake';

export interface RunMeta {
  readonly mode: RunMode;
  readonly camera: string;
  readonly startedAt: string;
  /** Listed by the tree and not run: not launchable, or below 0.8.0.0. */
  readonly left: readonly string[];
}

/** The plan, as the run prints it before it starts (no hardware is asked anything). */
export function describePlan(
  subjects: readonly BenchSubject[],
  left: readonly BenchSubject[],
  camera: string,
): string {
  const lines = [
    `slots bench plan: ${String(subjects.length)} ${camera} subject(s), in this order:`,
    ...subjects.map(
      (subject, index) =>
        `  ${String(index + 1)}. ${subjectLabel(subject)} — ${path.basename(subject.file)} ` +
        `(${subject.fileKind}, sha256 ${subject.sha256.slice(0, 8)})`,
    ),
    '  each: flash the whole part, verify it halted, reset, enumerate; the page reads A, B, R;',
    '  write each bank its own decrypted image (B, then A, then R, the tick where the page asks);',
    '  patch the build string and write it into all three; reset; the camera must run it.',
    "  the camera's own original goes last (the library orders it).",
  ];
  if (left.length > 0) {
    lines.push(`  not run (${String(left.length)}): ${left.map(subjectLabel).join('; ')}`);
  }
  return lines.join('\n');
}

const STATE_WORD: Readonly<Record<StepState, string>> = {
  passed: 'ok',
  failed: 'FAILED',
  skipped: 'skipped',
  'not-run': 'not run',
};

function writesCell(writes: readonly SlotWriteResult[]): string {
  return writes.map((write) => `${write.bank.toUpperCase()} ${STATE_WORD[write.state]}`).join(', ');
}

/** One stdout line per subject: the matrix's columns, in order. */
export function reportLine(r: SubjectResult): string {
  const enumerated =
    r.enumerated && r.enumerateMs !== null ? `yes, ${String(r.enumerateMs)} ms` : 'no';
  return [
    `RESULT ${r.label}`,
    `file ${r.file}`,
    `flash verified ${r.flashVerified ? 'yes' : 'no'}`,
    `enumerated ${enumerated}`,
    `page identified ${r.pageIdentified ? 'yes' : 'no'}`,
    `banks = J-Link ${r.banksMatch ? 'yes' : 'no'}`,
    `slot writes ${writesCell(r.slotWrites)}`,
    `boot proof ${STATE_WORD[r.bootProof]}`,
    `failures ${String(r.failures.length)}`,
  ].join(' | ');
}

/** The matrix as JSON: every subject's record, and the run's own facts. */
export function matrixJson(results: readonly SubjectResult[], meta: RunMeta): string {
  return `${JSON.stringify({ ...meta, subjects: results }, null, 2)}\n`;
}

/** The matrix as a markdown table, with each subject's notes and failures under its row. */
export function matrixMarkdown(results: readonly SubjectResult[], meta: RunMeta): string {
  const cell = (text: string): string => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const rows = results.map((r) => {
    const notes = [...r.notes, ...r.failures.map((failure) => `FAIL: ${failure}`)];
    return [
      r.label,
      r.flashVerified ? 'yes' : 'no',
      r.enumerated && r.enumerateMs !== null ? `yes, ${String(r.enumerateMs)} ms` : 'no',
      r.pageIdentified ? 'yes' : 'no',
      r.banksMatch ? 'yes' : 'no',
      writesCell(r.slotWrites),
      STATE_WORD[r.bootProof],
      notes.length === 0 ? '' : notes.map((note) => `- ${note}`).join('<br>'),
    ].map(cell);
  });
  const header = [
    'Subject',
    'Flash verified',
    'Enumerated',
    'Page identified',
    'Banks = J-Link',
    'Slot writes',
    'Boot proof',
    'Notes',
  ];
  const table = [header, ...rows].map((row) => `| ${row.join(' | ')} |`);
  const separator = `| ${header.map(() => '---').join(' | ')} |`;
  const left =
    meta.left.length === 0
      ? []
      : ['', `Not run (${String(meta.left.length)}): ${meta.left.join('; ')}`];
  return [
    `# Slots bench matrix`,
    '',
    `Camera: ${meta.camera}. Mode: ${meta.mode}. Started ${meta.startedAt}.`,
    '',
    table[0] ?? '',
    separator,
    ...table.slice(1),
    ...left,
    '',
  ].join('\n');
}

/** Writes the JSON and markdown matrix into `dir`; returns the two paths. */
export function writeMatrix(
  dir: string,
  results: readonly SubjectResult[],
  meta: RunMeta,
): { readonly json: string; readonly markdown: string } {
  mkdirSync(dir, { recursive: true });
  const json = path.join(dir, 'slots-bench-matrix.json');
  const markdown = path.join(dir, 'slots-bench-matrix.md');
  writeFileSync(json, matrixJson(results, meta));
  writeFileSync(markdown, matrixMarkdown(results, meta));
  return { json, markdown };
}
