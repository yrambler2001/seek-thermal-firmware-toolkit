/**
 * The language switch, beside the light/dark switch in the header.
 *
 * A native `<select>`: the phone's own picker on Android, the keyboard and
 * screen-reader behaviour of a real form control everywhere, and nothing to
 * position. It sits invisible over a pill drawn like the theme switch — the
 * translate icon, the language's own name from `sm` up, a caret — so the
 * header keeps one look; on a phone the pill is the icon alone, which keeps
 * the header's row inside 360 px. Its `<label>` (screen-reader only) says "Language" in the
 * language in use, and each option is the language's own name, marked with its
 * own `lang` so a screen reader pronounces it right. No flags: a flag is a
 * country, not a language.
 *
 * A pick loads the language first and then switches (src/i18n/store.ts), and is
 * kept in localStorage. A language that fails to load leaves the page as it was.
 * While a pick loads, the select shows the pick, not the language in use, so
 * picking the old language back during a slow load is a change event, and that
 * later pick wins (store.ts drops the overtaken load).
 */

import { useState, type ChangeEvent, type ReactElement } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { useLanguageSwitch, useT, type LanguageCode } from '@/i18n';

export function LanguageSwitch(): ReactElement {
  const { t } = useT();
  const { lang, languages, choose } = useLanguageSwitch();
  const [pending, setPending] = useState<LanguageCode | null>(null);
  const current = languages.find((entry) => entry.code === lang);

  const onChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const picked = languages.find((entry) => entry.code === event.target.value);
    if (picked === undefined) return;
    setPending(picked.code);
    choose(picked.code)
      .catch(() => {
        /* The chunk could not be fetched (offline): the page stays as it was. */
      })
      .finally(() => {
        setPending((shown) => (shown === picked.code ? null : shown));
      });
  };

  return (
    <span className="relative inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-input bg-card px-2 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
      <Languages aria-hidden="true" className="size-3.5" />
      <span aria-hidden="true" className="hidden sm:inline">
        {current?.name ?? lang}
      </span>
      <ChevronDown aria-hidden="true" className="size-3" />
      <label htmlFor="language-switch" className="sr-only">
        {t('app:language.label')}
      </label>
      <select
        id="language-switch"
        title={t('app:language.label')}
        value={pending ?? lang}
        onChange={onChange}
        className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0 focus-visible:outline-none"
      >
        {languages.map((entry) => (
          <option key={entry.code} value={entry.code} lang={entry.code}>
            {entry.name}
          </option>
        ))}
      </select>
    </span>
  );
}
