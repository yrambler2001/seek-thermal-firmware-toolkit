/**
 * The "What you get" table: the files in a download, by name as written, and what each one is. The
 * 4.x/Nano tab lists its dump archive with it, the 0.x/1.x tab its run file.
 */

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
} from '@/components/ui/table';

export interface FileTableProps {
  readonly caption: string;
  readonly fileHeader: string;
  readonly whatHeader: string;
  /** File name (or pattern) as it appears in the download, and what it is, translated. */
  readonly rows: readonly (readonly [string, string])[];
}

export function FileTable({ caption, fileHeader, whatHeader, rows }: FileTableProps): ReactElement {
  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[19rem]">{fileHeader}</TableHead>
          <TableHead>{whatHeader}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([file, what]) => (
          <TableRow key={file}>
            <TableRowHeader className="font-mono text-[0.8rem] font-normal">{file}</TableRowHeader>
            <TableCell label={whatHeader} className="text-muted-foreground">
              {what}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
