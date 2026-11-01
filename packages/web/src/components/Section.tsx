import type { ReactElement, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

export interface SectionProps {
  /** Becomes `<id>-heading`, which the `<section>` points `aria-labelledby` at. */
  readonly id: string;
  readonly title: string;
  /** The numbered flow: '1', '2', '3'. Rendered as a chip, not as prose. */
  readonly step?: string | undefined;
  /** The original's `.optlabel` — "Optional — not part of the two steps above". */
  readonly eyebrow?: string | undefined;
  readonly icon?: ReactNode;
  readonly tone?: 'default' | 'danger' | 'ok' | 'quiet' | undefined;
  readonly description?: ReactNode;
  readonly aside?: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string | undefined;
  readonly children: ReactNode;
}

const ICON_TONE: Readonly<Record<'default' | 'danger' | 'ok' | 'quiet', string>> = {
  default: 'border-border bg-muted text-muted-foreground',
  danger: 'border-destructive/40 bg-destructive/10 text-destructive',
  ok: 'border-ok/35 bg-ok/10 text-ok',
  quiet: 'border-border bg-transparent text-muted-foreground',
};

/**
 * One panel of the instrument: a landmark `<section>` labelled by its own
 * heading, wrapped in a card whose tone says how consequential it is.
 */
export function Section({
  id,
  title,
  step,
  eyebrow,
  icon,
  tone = 'default',
  description,
  aside,
  footer,
  className,
  children,
}: SectionProps): ReactElement {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn('scroll-mt-4', className)}>
      <Card tone={tone}>
        <CardHeader>
          {icon !== undefined && (
            <span
              aria-hidden="true"
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4',
                ICON_TONE[tone],
              )}
            >
              {icon}
            </span>
          )}
          {/* The heading and its badges. The heading asks for its whole line
           * (flex-basis auto: its width unwrapped), so the badges stay beside it
           * only when both fit; otherwise they move under it, in line with the
           * heading's text. A heading squeezed beside a badge wrapped word by
           * word and, with a word longer than its share, ran under the badge. */}
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-1.5">
            <div className="min-w-0 grow">
              {eyebrow !== undefined && (
                <p className="mb-0.5 text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {eyebrow}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                {step !== undefined && (
                  <span
                    className="font-mono text-[0.78rem] font-semibold text-muted-foreground tabular-nums"
                    aria-hidden="true"
                  >
                    {step.padStart(2, '0')}
                  </span>
                )}
                <CardTitle id={`${id}-heading`}>{title}</CardTitle>
              </div>
            </div>
            {aside !== undefined && <div className="max-w-full">{aside}</div>}
          </div>
          {description !== undefined && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-3.5">{children}</CardContent>
        {footer !== undefined && <CardFooter>{footer}</CardFooter>}
      </Card>
    </section>
  );
}
