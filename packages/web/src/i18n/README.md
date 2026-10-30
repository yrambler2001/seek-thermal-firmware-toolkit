# Translations (src/i18n)

The page's text lives in dictionaries, one file per namespace per language. English is the source: it is bundled, it defines every key, and every other language is checked against it. The page is English-only until a language is registered. Nothing else changes until then.

```
src/i18n/
  index.ts        public API: t, rich, useT, useLanguage, setLanguage, ...
  store.ts        the language in use, t(), loading and switching
  rich.tsx        rich(): mini-markup and slots to React nodes
  react.ts        useT(), useLanguage(), useLanguageSwitch()
  detect.ts       ?lang= → saved choice → navigator.languages → en
  format.ts       {param} interpolation, Intl.PluralRules
  languages.ts    the registry (the switcher's list and order)
  types.ts        key, param and translation types derived from English
  locales/en/<namespace>.ts
```

## Using it

```tsx
import { useT } from '@/i18n';

export function ConnectButtons(): ReactElement {
  const { t, rich } = useT();
  return (
    <>
      <Button>{t('app:connect.test')}</Button>
      <p>{rich('app:connect.vendorNote', { params: { vendor: '0x289d' } })}</p>
    </>
  );
}
```

- `t(key, params?)` returns a string. Use it for attributes (`title`, `aria-label`), button labels, and anything that is not a sentence with markup in it.
- `rich(key, { params?, slots? })` returns React nodes with the markup rendered. Put the result inside the element that holds the sentence: `<p>{rich('app:intro.v4')}</p>`.
- Keys are typed. A key that does not exist, a missing param or an unknown param is a compile error.

## Adding a key

1. Add the English string to `locales/en/<your namespace>.ts`, near the keys for the same part of the page.
2. Use it with `t('<namespace>:<key>')` or `rich(...)`.
3. Keep the English text exactly as it was. The tests assert English, and `safety-copy.test.tsx` pins the warnings word for word. Paste the old text into the dictionary. Don't reword it while you move it.

Key names:

- Use dotted, camelCase segments named for the place on the page and the meaning, e.g. `connect.forget`, `support.ios.title`, `slotTable.bootColumn`. Don't name a key after its English words.
- Don't put `:` in a key.
- Give one sentence or label one key. Split a paragraph into one key per `<p>`. Never build a sentence from fragments (`t('a') + name + t('b')`): use a param instead.
- If the same English word means two different things, use two keys (a "Copy" button and the noun "copy" may be different words in other languages).

## Namespaces and owners

Agents run one at a time, each on the previous one's merged work. Edit your own namespace files and the source files assigned to you. Any agent may **add** a shared word to `common` (a button word, a size, a count) when several areas need it; never rename, reword or remove a key that is there, since other areas use it. `app` belongs to phase 1: leave it alone unless the shell itself changes.

| Namespace  | Owner                                 | Source files                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common`   | phase 1; any agent adds, none renames | shared words: Yes/No/Cancel/Copy…, sizes, counts                                                                                                                                                                                                                                                                    |
| `app`      | phase 1                               | `App.tsx`, `main.tsx`, `AppHeader`, `ThemeSwitch` + `lib/theme.ts`, `LanguageSwitch`, `lib/routing.ts`, `SupportBanner` + `lib/support.ts`, `UnlockNote`, `ConnectSection`, `PlatformNotes`                                                                                                                         |
| `shared`   | phase 2, rest-of-page agent           | what several tabs share: `RunPanel`, `Section`, `Panel`, `KeyValue`, `HexBlock`, `components/ui/*`, `DeviceInfoPanel`, `hooks/useRunner`, `useReporter`, `useDevice`, `useConnectionTest`, `lib/camera-lock`, `download`, `backup-save`, `hints`, `family-line`, `identify`, `unlock-seat`, `webusb`, `usb-adapter` |
| `info`     | phase 2, rest-of-page agent           | `views/InfoView`, `hooks/useInfoPanel`, `CameraReport` (labels only)                                                                                                                                                                                                                                                |
| `decrypt`  | phase 2, rest-of-page agent           | `views/DecryptView`, `hooks/useOfflineDecrypt`, `useSlotFileDecrypt`, `DetectionBox`, `FilePickerButton`                                                                                                                                                                                                            |
| `v4`       | phase 2, rest-of-page agent           | `views/V4View`, `hooks/useDumpPanel`, `CameraIdentity`, `OpcodeTable`, `OptionsDetails`, `lib/options.ts`                                                                                                                                                                                                           |
| `slots`    | phase 2, slots agent                  | `views/SlotsView`, `hooks/useSlotsPanel`, `components/Slot*`                                                                                                                                                                                                                                                        |
| `preserve` | phase 2, preserve agent               | `views/PreserveView`, `hooks/usePreservePanel`, `lib/preserve/*`                                                                                                                                                                                                                                                    |
| `core`     | phase 3                               | sentences exported by `@seek-fw/core` that the page shows. The English must equal the core string; add the pair to the `core namespace` test in `locales.test.ts`.                                                                                                                                                  |

A new namespace needs a file in `locales/en/` and a line in `locales/en/index.ts`. Ask the integrator before you add one.

## Params and plurals

Placeholders are named, in braces: `{count}`, `{slot}`, `{version}`. The types read the names from the English string.

```ts
// locales/en/slots.ts
'write.confirm': 'Write {file} to slot {slot}?',
'found': { one: 'Found {count} image in slot {slot}.', other: 'Found {count} images in slot {slot}.' },

t('slots:write.confirm', { file: name, slot: 'A' });
t('slots:found', { count: images.length, slot: 'B' }); // count is required for a plural
```

- A number is inserted as `String(n)`, with no grouping and no locale formatting. Format hex values, sizes and versions yourself and pass the string.
- An English plural has `one` and `other`. A translation gives the forms its language needs: ru/uk/pl `one, few, many, other`; es/fr/it/pt `one, many, other` (`many` is for millions); de `one, other`; zh-Hans `other` only. The forms are chosen with `Intl.PluralRules`. A form that is missing falls back to the same language's `other`. The parity test fails on a missing form.
- Don't put a literal `{` or `}` in a string: pass it as a param.

## Markup and slots

Strings keep the mini-markup of `lib/rich-text.tsx`: `**bold**`, `*em*`, `` `code` ``. `t()` returns the markup unchanged, for `<Rich>`/`<RichParagraphs>` or `plainText()`. `rich()` renders it.

To put a link or a component inside a sentence, use a slot: `<name>text</name>` wraps the text, and `<name/>` places an element on its own. The translator can move the slot anywhere in the sentence.

```tsx
// 'Use <zadig>Zadig</zadig>: *Options → List All Devices*, then …'
rich('app:platform.windows', {
  slots: { zadig: (text) => <a href="https://zadig.akeo.ie/">{text}</a> },
});
// 'Press <icon/> to copy the report.'
rich('info:report.copyHint', { slots: { icon: () => <Copy aria-hidden="true" /> } });
```

Rules:

- The markup is parsed before the params are filled in, so a param value is always plain text. A file name with `*` in it stays as it is.
- Markup inside a slot's text works. Markup that crosses a slot's edge, nested slots, and nested markup do not.
- If a slot is not passed, its text is rendered without the wrapper.
- Name slots after their role (`zadig`, `link`, `button`), not by number.

## `t` outside React

Hooks and libs import the plain function: `import { t } from '@/i18n'`. It reads the language in use when it is called.

- Call it when the text is about to be shown, not once at module load. `const LABEL = t('…')` at the top of a module is fixed in English forever. Use a function, or a live record like `ROUTE_LABEL` in `lib/routing.ts`.
- App re-renders the whole page on a switch, so `t()` called during render is always current. A string stored in React state stays in the language it was made in. Store the key and params (or the data) and translate at render time when that matters, or accept it for short-lived messages.
- Memoised text needs the language in its deps: `const lang = useLanguage(); useMemo(() => build(), [data, lang])`.

### Patterns that work

- **Status lines.** `shared:status.*` has the ones several panels set (`idle`, `cancelled`, `cancelling`, `failedSeeLog`). `useReporter(t('…'))` takes the idle line; until the first `reset`/`setStatus`/progress it follows a language switch, after that a status stays in the language it was set in until the next one.
- **Module-level tables.** Make them a function called at render (`tabGuides()` in InfoView, `archiveRows()` in V4View), or give the record getters (`get why(): string { return t('…'); }` in `READ_ONLY_OPCODES`), so the export keeps its shape.
- **Shown and logged.** When the same sentence goes on the page and into the run log, keep one entry and pass the translate function: `hintFor(error, ua, t)` for the page, the default `tEnglish` for `logHint`. `tEnglish(key, params)` is `t` in English whatever the language; `Translate` is its type. Old English constants (`UDEV_HINT`, `IN_USE_ELSEWHERE_STATUS`) are now `tEnglish(...)`, for the tests and the log; `cancelledStatus(committed, report, tEnglish)` in useSlotsPanel is the same split for a status line that is also logged. The Preserve tab's `canRunPhase({ …, translate: tEnglish })` and `gateReason(gate, tEnglish)` give the gate's reason in English for the run log; the page calls them without it.
- **A SeekError made by the page.** Its message is English (it is logged). `withPageMessage(error, () => t('…'))` from `lib/identify` attaches the translated wording, and `refusalOf()` shows that one.
- **Lists of names.** `listAnd(names)` joins with `common:list.and` (`{first} and {second}`, pairwise), so English stays "A and B and C". `bankList(keys)` in `lib/bank-names.ts` names banks inside a sentence as "slot A, slot B and recovery R" (`listComma`, then `common:list.and` before the last name), the English of core's `bankListWords`.
- **Code, hex, file names inside a sentence.** Pass them as params inside `code` markup: ``'… every `{begin}` selector `{first}`–`{last}` …'``.
- **Variants, not suffixes.** "Done — 5/5 windows read (cancelled). Check your downloads." is its own key next to the plain one; never append `' (cancelled)'`.
- **Core's sentences** (reasons, notes, boot reports, refusal messages) are shown as they come, with a `// i18n: core message` comment (or `{/* i18n: core message */}` in JSX) where the page shows them.

## What stays English

Keep these in English, in every language:

- hex values, status codes, register names, opcodes, firmware versions, file names;
- the run log lines (`reporter.log(...)`);
- the copyable camera report and bug-report text, which people paste to the owner;
- the CLI.

Translate the UI labels around them. Don't put the values in the dictionary at all: pass them as params (``'USB vendor `{vendor}`'``). If an English-only program is named in the text (Zadig's menus, `seek-fw info`), keep its names in English. Explain such cases in a comment above the key.

There is no "machine translation" label and no English shown under translated text: the owner declined both.

## Adding a language

1. `cp -R src/i18n/locales/en src/i18n/locales/<code>`.
2. In each namespace file, change the type line and translate the values:
   ```ts
   import type { Translation } from '../../types';
   export default {
     'connect.test': 'Verbindung testen' /* every key */,
   } satisfies Translation<'app'>;
   ```
   A missing key, an extra key, or a string where English has plural forms is a compile error.
3. In `locales/<code>/index.ts`:
   ```ts
   import type { Dictionary } from '../../types';
   // the same imports as en/index.ts
   const de: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
   export default de;
   ```
4. Uncomment the language's line in `languages.ts`. **The order is the rule:** English first, then by native name, Latin script, then Cyrillic, then Chinese: English, Deutsch, Español, Français, Italiano, Polski, Português, Русский, Українська, 简体中文. A language that is not planned goes in its place in that order, and its code goes into `LanguageCode`.
5. Run `npx vitest run --project web src/i18n`. `locales.test.ts` checks every registered language against English: keys, plural forms, `{params}` and `<slots>`.

The language loads only when someone picks it (a dynamic `import()`, its own chunk), so a new language adds nothing to the English page.

## How the language is chosen

The first match wins:

1. `?lang=xx` in the URL, for that visit only. Put it before the hash: `…/?lang=ru#/v4`.
2. The choice saved from the switcher (`localStorage['seek-fw:lang']`; storage that throws counts as no choice).
3. The first entry in `navigator.languages` whose primary subtag matches (`zh-TW` → `zh-Hans`, `pt-BR` → `pt`).
4. English.

`main.tsx` awaits `initI18n()` before the first render, so English never flashes first. A switch loads the language first, then re-renders. `<html lang>` always matches the language in use. A pick in the switcher is saved and removes `?lang=` from the address bar. A pick in one tab is followed by the page's other open tabs (`followLanguageChoice()`, called by `main.tsx`), which also drop their own `?lang=`; the theme does the same.

## Tests

- `test-setup.ts` calls `resetI18n()` before every test, so every test runs in English whatever the machine's locale. Existing tests assert the English text and keep doing so: you don't need to change a test when you move its text into a dictionary. If one fails, the English changed.
- To test another language, mock the registry the way `i18n.test.tsx` does (`vi.mock('./languages', …)` with a fake dictionary), then `await act(async () => { await setLanguage('ru'); })`.
- Run `npx vitest run --project web`, `npx tsc --noEmit -p packages/web/tsconfig.app.json` and `npx eslint packages/web`, then prettier on the files you touched.
