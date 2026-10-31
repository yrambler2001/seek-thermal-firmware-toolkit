/**
 * The "What you get" table: the files in a download, by name as written, and what each one is. The
 * 4.x/Nano tab lists its dump archive with it, the 0.x/1.x tab its run file.
 */

import { Fragment, type ReactElement } from 'react';
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

/**
 * A path that wraps only after a `/`: `02-read-build/` stays whole rather than breaking at its hyphens.
 */
function FileName({ name }: { readonly name: string }): ReactElement {
  const parts = name.split(/(?<=\/)(?=.)/);
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          <span className="whitespace-nowrap">{part}</span>
        </Fragment>
      ))}
    </>
  );
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
            <TableRowHeader className="font-mono text-[0.8rem] font-normal">
              <FileName name={file} />
            </TableRowHeader>
            <TableCell label={whatHeader} className="text-muted-foreground">
              {what}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
