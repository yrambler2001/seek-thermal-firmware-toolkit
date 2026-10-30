/** The "Opcode / Name / Dir / Why it is used" table, for the 4.x/Nano tab's read-only guarantee. */

import type { ReactElement } from 'react';
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
import { cn } from '@/lib/utils';
import { t } from '@/i18n';

export interface OpcodeRow {
  readonly opcode: string;
  readonly name: string;
  readonly dir: 'IN' | 'OUT';
  readonly why: string;
}

export interface OpcodeTableProps {
  readonly caption: string;
  readonly rows: readonly OpcodeRow[];
}

export function OpcodeTable({ caption, rows }: OpcodeTableProps): ReactElement {
  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[5.5rem]">{t('v4:opcodes.opcode')}</TableHead>
          <TableHead>{t('v4:opcodes.name')}</TableHead>
          <TableHead className="w-[4rem]">{t('v4:opcodes.dir')}</TableHead>
          <TableHead>{t('v4:opcodes.why')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.opcode}>
            <TableRowHeader className="font-mono font-semibold whitespace-nowrap">
              <span className="cell-label" aria-hidden="true">
                {t('v4:opcodes.opcode')}
              </span>
              {row.opcode}
            </TableRowHeader>
            <TableCell label={t('v4:opcodes.name')} className="font-mono">
              {row.name}
            </TableCell>
            <TableCell label={t('v4:opcodes.dir')}>
              <span
                className={cn(
                  'inline-flex rounded border px-1.5 py-px font-mono text-[0.68rem] font-semibold',
                  row.dir === 'IN'
                    ? 'border-ok/35 bg-ok/10 text-ok'
                    : 'border-warn/40 bg-warn/10 text-warn',
                )}
              >
                {row.dir}
              </span>
            </TableCell>
            <TableCell label={t('v4:opcodes.why')} className="text-muted-foreground">
              {row.why}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * The dump view's whole vocabulary: the original's five, verbatim, and the
 * version read that has gone out before every dump since the toolkit started
 * reading each build's own selector table (core `READ_ONLY_OPS`).
 */
/* Each `why` is a getter, so it is translated when the table renders, not at module load. */
export const READ_ONLY_OPCODES: readonly OpcodeRow[] = [
  {
    opcode: '0x4e',
    name: 'GetFirmwareInfo',
    dir: 'IN',
    get why(): string {
      return t('v4:opcodes.getInfo');
    },
  },
  {
    opcode: '0x35',
    name: 'GetErrorCode',
    dir: 'IN',
    get why(): string {
      return t('v4:opcodes.getError');
    },
  },
  {
    opcode: '0x3c',
    name: 'SetOperationMode',
    dir: 'OUT',
    get why(): string {
      return t('v4:opcodes.setMode');
    },
  },
  {
    opcode: '0x3d',
    name: 'GetOperationMode',
    dir: 'IN',
    get why(): string {
      return t('v4:opcodes.getMode');
    },
  },
  {
    opcode: '0x4f',
    name: 'GetFeaturedFirmwareData',
    dir: 'IN',
    get why(): string {
      return t('v4:opcodes.getData');
    },
  },
  {
    opcode: '0x52',
    name: 'BeginFirmwareUpgrade',
    dir: 'OUT',
    get why(): string {
      return t('v4:opcodes.begin');
    },
  },
];
