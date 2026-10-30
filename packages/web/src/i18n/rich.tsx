/**
 * Translated sentences with markup in them.
 *
 * A dictionary string may carry the mini-markup lib/rich-text.tsx renders —
 * `**bold**`, `*em*`, `` `code` `` — and slots: `<name>text</name>` wraps
 * `text` in whatever the caller's `name` slot returns (a link, a button), and
 * `<name/>` puts the slot's element there on its own. A slot is how a
 * component sits inside a sentence without splitting it into fragments a
 * translator cannot reorder.
 *
 *     // 'Use <zadig>Zadig</zadig>: *Options → List All Devices*, …'
 *     rich('app:platform.windows', {
 *       slots: { zadig: (text) => <a href="https://zadig.akeo.ie/">{text}</a> },
 *     });
 *
 * The markup is parsed before the params are filled in, so a param's value is
 * always plain text, never markup. Markup cannot cross a slot's edge, and
 * slots do not nest.
 */

import { Fragment, type ReactNode } from 'react';
import { MARKUP_TOKEN } from '@/lib/rich-text';
import { interpolate } from './format';
import { template } from './store';
import type { MessageKey, ParamNamesOf, EntryOf, ParamValue, ParamsOf } from './types';

/** Gets the slot's text (already rendered; empty for `<name/>`) and returns what goes there. */
export type Slot = (children: ReactNode) => ReactNode;
export type Slots = Readonly<Record<string, Slot>>;

type Params = Readonly<Record<string, ParamValue>>;

export type RichOptions<K extends MessageKey> = [ParamNamesOf<EntryOf<K>>] extends [never]
  ? { readonly slots?: Slots }
  : { readonly params: ParamsOf<K>; readonly slots?: Slots };

export type RichArgs<K extends MessageKey> = [ParamNamesOf<EntryOf<K>>] extends [never]
  ? [options?: RichOptions<K>]
  : [options: RichOptions<K>];

const SLOT = /<([A-Za-z][\w-]*)>([\s\S]*?)<\/\1>|<([A-Za-z][\w-]*)\s*\/>/g;

/** Mini-markup with params, no slots. */
function inline(text: string, params: Params | undefined, prefix: string): ReactNode[] {
  return text
    .split(MARKUP_TOKEN)
    .filter((part) => part !== '')
    .map((part, index) => {
      const key = `${prefix}.${String(index)}`;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={key}>{interpolate(part.slice(2, -2), params)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={key}>{interpolate(part.slice(1, -1), params)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={key}>{interpolate(part.slice(1, -1), params)}</code>;
      }
      return interpolate(part, params);
    });
}

/**
 * Renders a template string: slots, then mini-markup, then params. Exported for
 * text that is not a dictionary key (a test, or a string built from several).
 * A slot the caller did not pass renders its text without a wrapper.
 */
export function renderMarkup(text: string, params?: Params, slots: Slots = {}): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(SLOT)) {
    out.push(...inline(text.slice(last, match.index), params, String(index)));
    const name = match[1] ?? match[3] ?? '';
    const inner = match[2] === undefined ? [] : inline(match[2], params, `${String(index)}s`);
    const slot = slots[name];
    out.push(
      <Fragment key={`${String(index)}:${name}`}>
        {slot === undefined ? inner : slot(inner.length === 1 ? inner[0] : inner)}
      </Fragment>,
    );
    last = match.index + match[0].length;
    index += 1;
  }
  out.push(...inline(text.slice(last), params, String(index)));
  return out;
}

/**
 * A dictionary entry rendered to React nodes, in the language in use. Put it
 * inside the element that holds the sentence: `<p>{rich('app:intro.v4')}</p>`.
 */
export function rich<K extends MessageKey>(key: K, ...args: RichArgs<K>): ReactNode[];
export function rich(
  key: string,
  options?: { readonly params?: Params; readonly slots?: Slots },
): ReactNode[] {
  return renderMarkup(template(key, options?.params), options?.params, options?.slots);
}
