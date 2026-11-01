# Translations (src/i18n)

The page's text lives in dictionaries, one file per namespace per language. English is the source: it is bundled, it defines every key, and every other language is checked against it. The page is English-only until a language is registered. Nothing else changes until then.

```
src/i18n/
  index.ts        public API: t, rich, useT, useLanguage, setLanguage, ...
  store.ts        the language in use, t(), loading and switching
  rich.tsx        rich(): mini-markup and slots to React nodes
  react.ts        useT(), useLanguage(), useLanguageSwitch()
  detect.ts       ?lang= → saved choice → navigator.languages → en
  format.ts       {param} and {param:case} interpolation, Intl.PluralRules
  names.ts        the page params that carry a bank or key name (the ones a case may go on)
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
| `v4`       | phase 2, rest-of-page agent           | `views/V4View`, `hooks/useDumpPanel`, `CameraIdentity`, `OptionsDetails`, `lib/options.ts`                                                                                                                                                                                                                          |
| `slots`    | phase 2, slots agent                  | `views/SlotsView`, `hooks/useSlotsPanel`, `components/Slot*`                                                                                                                                                                                                                                                        |
| `preserve` | phase 2, preserve agent               | `views/PreserveView`, `hooks/usePreservePanel`, `lib/preserve/*`                                                                                                                                                                                                                                                    |
| `core`     | phase 3                               | sentences `@seek-fw/core` makes and the page shows, keyed by message code. The English must render to core's `text`: `core-messages.test.ts` checks every key.                                                                                                                                                      |

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
- An English plural has `one` and `other`. A translation gives the forms its language needs: ru/uk/pl/cs/sk/lt `one, few, many, other`; es/fr/it/pt `one, many, other` (`many` is for millions); ro `one, few, other` (`few` is 0, 2–19 and any number ending in 01–19, `other` is 20 and up: "20 de sloturi"); sr `one, few, other`; sl `one, two, few, other`; lv `zero, one, other`; de/et/hu/bg `one, other`; zh-Hans `other` only (the notes under "How to add a language" say which numbers each form gets). The forms are chosen with `Intl.PluralRules`. A form that is missing falls back to the same language's `other`.
- A translated file names its language, `satisfies Translation<'common', 'lv'>`, and its plural entries must then give exactly that language's categories (`PluralCategoriesOf` in `types.ts`): a missing `zero` in Latvian, or a `few` Latvian never picks, does not compile. The parity test reports both too.
- Don't put a literal `{` or `}` in a string: pass it as a param.

## Cases

A bank ("slot A", "recovery R") or a key ("Key A", "key block 1") goes into many sentences, and Polish, Russian, Ukrainian and German say it differently after "from", "in", "under", "to"; Hungarian and Estonian say "in", "into", "from", "with" with a suffix on the noun itself. A translation asks for the form it needs in the placeholder: `{bank:gen}`, `{key:ins}`, `{bank:ill}`. English never does; it has no case forms.

The selectors (`CASES` in `format.ts`). Each language uses the ones its grammar has and leaves the rest alone; the meanings say what the case is for, not a word to translate:

| Selector | Case         | Meaning                                                                    | Example (slot A, Key A; Estonian _võti_, a key)      |
| -------- | ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `:nom`   | nominative   | the subject inside a sentence, where it differs from the plain form        | Hungarian **az A slot** üres; Bulgarian **слотът A** |
| `:gen`   | genitive     | of, from; Estonian's possessor and finished object                         | Polish ze **slotu A**; Estonian **võtme**            |
| `:dat`   | dative       | to, for (the receiver)                                                     | Polish **slotowi A**; Hungarian **az A slotnak**     |
| `:acc`   | accusative   | the direct object                                                          | Polish na **slot A**; Hungarian **az A slotot**      |
| `:ins`   | instrumental | with, by means of; under (Slavic); Hungarian "with" (-val/-vel)            | Polish pod **kluczem A**; Hungarian **az A slottal** |
| `:loc`   | locative     | in, on, about, after a preposition (Slavic)                                | Polish w **slocie A**                                |
| `:ine`   | inessive     | in                                                                         | Hungarian az A slot**ban**; Estonian võtme**s**      |
| `:ill`   | illative     | into                                                                       | Hungarian az A slot**ba**; Estonian võtme**sse**     |
| `:ela`   | elative      | out of; about                                                              | Hungarian az A slot**ból**; Estonian võtme**st**     |
| `:sup`   | superessive  | on (Hungarian)                                                             | az A slot**on**                                      |
| `:sub`   | sublative    | onto (Hungarian)                                                           | az A slot**ra**                                      |
| `:del`   | delative     | off, from the surface of; about (Hungarian)                                | az A slot**ról**                                     |
| `:ade`   | adessive     | at, by; Estonian also "on" and "has"                                       | Hungarian az A slot**nál**; Estonian võtme**l**      |
| `:all`   | allative     | to, towards                                                                | Hungarian az A slot**hoz**; Estonian võtme**le**     |
| `:abl`   | ablative     | from, away from                                                            | Hungarian az A slot**tól**; Estonian võtme**lt**     |
| `:tra`   | translative  | into a state, becoming ("turns into")                                      | Hungarian az A slot**tá**; Estonian võtme**ks**      |
| `:ter`   | terminative  | until, as far as                                                           | Hungarian az A slot**ig**; Estonian võtme**ni**      |
| `:ess`   | essive       | as, in the role of                                                         | Hungarian az A slot**ként**; Estonian võtme**na**    |
| `:com`   | comitative   | with, together with (Estonian; Hungarian uses `:ins`)                      | Estonian võtme**ga**                                 |
| `:abe`   | abessive     | without (Estonian)                                                         | Estonian võtme**ta**                                 |
| `:par`   | partitive    | Estonian's object of an unfinished action, after a number, with some words | Estonian võti**t**                                   |
| `:cau`   | causal-final | for, for the sake of (Hungarian -ért)                                      | az A slot**ért**                                     |

How it works:

- **The param is a name, not text.** The page passes a `NameValue`: `bankWordsRef(key)` ("slot A"), `bankNameRef(key)` ("Slot A"), `bankListRef(keys, join?)` (a list, "slot A, slot B and recovery R"), `keyNameValue(name)` (a key; one core has no name for stays as it is), or `{ text }` for a phrase that cannot be declined. A `NameRef` is the name's dictionary key and that key's params (`{ name: 'common:bank.slotInSentence', params: { letter: 'A' } }`). Core's bank params (`bankParam`), key names (`keyNameParam`) and lists of them become names in `coreText`.
- **The forms live with the name**, as optional keys next to it in the language's own file: `'bank.slotInSentence:loc': 'slocie {letter}'` in `common`, `'keyName.keyA:ins': 'kluczem A'` in `core`. Only names have forms: `common:bank.*`, `core:keyName.*` and `shared:deviceInfo.otherBank` ("the other bank", said where the booted bank has no name) (`NameKey`).
- **A missing form falls back to the plain form of the same language**, never to English. English and Chinese write no forms at all; German gives only the ones it needs.
- **A list** gets the case on each name, joined with the language's `common:list.*`: `{banks:loc}` → "slocie A, slocie B i slocie odzyskiwania R". A language whose grammar puts the case only on the last name says so in its registry entry, `listCase` (`ListCase` in `types.ts`): `'last'` (Hungarian: "az A slot és a B slotba"; the names before the last are said in `:nom`, or the plain form when the language gives no `:nom`), or `{ lastOnly, before }` for some cases only (Estonian: `{ lastOnly: ['ter', 'ess', 'abe', 'com'], before: 'gen' }`, "A-pesa ja B-pesaga", the others reach each name). Without `listCase`, every name takes the case, as today.
- **A form for one letter.** Where the words around a bank's letter change with the letter (Hungarian "az A slot" but "a B slot"), give the case form for that letter as well: `'bank.slotInSentence:nom#B': 'a {letter} slot'` next to `'bank.slotInSentence:nom': 'az {letter} slot'`. The letter's form comes first, then the case form, then the plain form. Only the bank names have a `{letter}`; the letters are `A`, `B` and `R`.
- **Nested core messages** work at any depth: each template says its own params in the case it asks for.

What is checked:

- A case form whose case is not in `CASES`, a letter form for a letter no bank has, or a case form of a key that is not a name, does not compile (`Translation<N>`); `locales.test.ts` reports it too, and a case form whose `{params}` differ from its name's.
- `locales.test.ts` fails on `{x:case}` with an unknown case, or on a page param that `names.ts` does not list as a name. `core-messages.test.ts` fails on `{x:case}` in a core template whose param core does not pass as a bank, a key or a list of them in every sample.
- A page param that `names.ts` lists must be passed a `NameValue`, and any other param must not be: both are compile errors, so a sentence cannot lose its name to a string already formatted.

Why optional per-language forms and not English-mirrored keys (`bank.slotInSentence.gen` in English, required everywhere): English, Chinese and most others have no cases, and a copy of every name per case in each of them would be noise that a translator must still fill and keep in step. The types still catch a typo, because the optional keys are typed from the name keys and `GrammaticalCase`, and the parity test checks the rest.

### Romance languages: articles and contractions

French, Italian, Spanish and Portuguese have no cases, but a name inside a sentence needs its article, and the article contracts with the preposition before it (French _du_, _au_; Italian _dello_, _nello_; Spanish _del_, _al_; Portuguese _do_, _ao_, _no_). The five selectors carry the article and the preposition, so the contraction is written once, with the name, and a template never builds it:

| Selector | Romance meaning                                                       | French (slot A, Key A, key block 1)                     |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| `:acc`   | definite article + name (subject or object)                           | l’emplacement A, la clé A, le bloc de clés 1            |
| `:gen`   | "of / from" + article                                                 | de l’emplacement A, de la clé A, du bloc de clés 1      |
| `:dat`   | "to / at" + article                                                   | à l’emplacement A, à la clé A, au bloc de clés 1        |
| `:loc`   | "in / into" + article                                                 | dans l’emplacement A (Italian _nello_, Portuguese _no_) |
| `:ins`   | the `:acc` form with a capital letter, for a name starting a sentence | L’emplacement A, La clé A                               |

- **Give all five forms on every name**: `common:bank.slot`, `bank.recovery`, `bank.slotInSentence`, `bank.recoveryInSentence` (the label and the sentence keys get the same case forms: the page passes either, and only the plain form differs, capital or lower case), each `core:keyName.*`, and `shared:deviceInfo.otherBank`. A name whose English already has its article ("the per-device key") has it in the plain form too, and its `:gen` is "de" + that form.
- **In a template**, write the selector the grammar needs: `'Copier vers {bank:acc}'`, `'Extraction de {bank:gen}…'`, `'le reprogramme {bank:dat}'`, `'Ce qui change {bank:loc}'`, `'{bank:ins} est vide : …'`. Write the plain `{bank}` only where the name stands alone: a table cell, a row value, a heading (`'{bank} — non choisi'`), after a colon or in a list introduced by one (`'dans cet ordre : {order}'`).
- **`:ins` is for one name only.** On a list it would capitalise every name; start such a sentence another way (`'Ces emplacements contiennent … : {banks:acc}'`).
- **A param that is not always a name** takes no selector (`core-messages.test.ts` reports "is not a name" or "is not always a name"): core passes some names already capitalised for the start of an English sentence (`fpsBoot.holdsOne`, `fpsBoot.cannotPatch`, `restore.readBack.differs`), as plain text (`upgrade.verdict.bootable` in one caller), or as a sentence in place of a name (`{banks}` in `preserve.banks.afterCommit` may be "no bank", `{next}` in `preserve.result.backupNext` "a bank that is not known"). Put the plain name before a colon there: `'{bank} : ne peut pas être corrigé ici…'`.
- **A page param passed as text** (`{ text }`: `slots:keys.theBootedBank`, a bank name core does not know) is the same in every case. Where a text may stand in for the name, write the preposition outside the param (`'dans {banks:acc}'` rather than `'{banks:loc}'`).
- French chose a word for slot, _emplacement_, that starts with a vowel, so every bank name elides the same way (l’, de l’, à l’, dans l’). A language whose slot word has a gender or an initial that changes the article per name writes each name's forms out in full; the template stays the same.
- **A preposition the five selectors do not carry** (Italian _da_ → _dallo_ and _su_ → _sullo_; Portuguese _por_ → _pelo_) cannot be written outside the param either, since the article must contract with it. Turn the sentence so one of the five fits: Italian says "from slot A" as _in base allo slot A_ (`{bank:dat}`), _quella dello slot A_ (`{bank:gen}`) or _dallo slot avviato ({bank})_, and "on slot A" as _nello slot A_ (`{bank:loc}`).

### Romanian: the article on the noun, and the genitive-dative

Romanian puts the definite article at the end of the noun ("slotul A") and has a genitive-dative ("slotului A"), but no preposition contracts with the article: "din slotul A", "în slotul A", "pe slotul A", "cu cheia A" all take the same form. The selectors carry the article and the case:

| Selector | Romanian meaning                                                                        | Romanian (slot A, Key A, key block 1)   |
| -------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| `:acc`   | the name with its article: subject, object, and after any preposition (din, în, pe, cu) | slotul A, cheia A, blocul de chei 1     |
| `:gen`   | genitive-dative                                                                         | slotului A, cheii A, blocului de chei 1 |
| `:dat`   | the same form as `:gen`                                                                 | slotului A, cheii A                     |
| `:loc`   | "în" + the `:acc` form                                                                  | în slotul A                             |
| `:ins`   | the `:acc` form with a capital letter, for one name starting a sentence                 | Slotul A, Cheia A                       |

- **The plain in-sentence name already has its article** (`bank.slotInSentence` is "slotul {letter}"), because Romanian names a slot with it; the label (`bank.slot`) is "Slot {letter}", "Recuperare {letter}". Templates still write `:acc` where the name is a subject or an object, so the grammar shows in the template.
- **"al/a/ai/ale" belongs to the template.** A genitive right after a noun with its article needs nothing ("imaginea {bank:gen}" → "imaginea slotului A"); after an adjective or a noun without its article, the template writes the possessive article that agrees with that noun ("blocul de 64 KB al {bank:gen}", "imaginea derivată a {bank:gen}", "Imaginea este a {name:gen}").
- **A list in `:gen`** repeats the case on each name ("patch-ul slotului B și slotului de recuperare R"). `:ins` is for one name only, as in the Romance languages: a plural sentence starts another way ("**În {banks:acc} se află câte o imagine…**").
- **A param that is not always a name** (a text, a capitalised label, "no bank") goes after a colon: `'{bank}: conține un patch…'`, `'această rulare scrie: {banks}'`.
- **A key with no name** is said indefinitely: `core:keyName.unknown` is "cheie necunoscută", `:acc` "o cheie necunoscută", `:gen` "unei chei necunoscute", `:loc` "într-o cheie necunoscută".

A new page sentence with a bank or a key in it: list the key's name params in `names.ts`, and pass the names with the `…Ref` helpers. Use `bankWords`/`bankName`/`bankList` (strings) only where the name stands alone (a table cell, a label).

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
- **Lists of names.** `listAnd(names)` joins with `common:list.and` (`{first} and {second}`, pairwise), so English stays "A and B and C". `bankList(keys)` in `lib/bank-names.ts` names banks inside a sentence as "slot A, slot B and recovery R" (`listComma`, then `common:list.and` before the last name), the English of core's `bankListWords`; as a param, pass `bankListRef(keys)` so the language can decline each name (see "Cases"). `listSemicolon(clauses)` joins clauses with `common:list.semicolon` ("; " in English): core's `semicolon` lists and the Preserve gate's missing parts. Don't join a list shown on the page with `join(', ')` or `join('; ')`.
- **Code, hex, file names inside a sentence.** Pass them as params inside `code` markup: ``'… every `{begin}` selector `{first}`–`{last}` …'``.
- **Variants, not suffixes.** "Done — 5/5 windows read (cancelled). Check your downloads." is its own key next to the plain one; never append `' (cancelled)'`.
- **Core's sentences.** Core keeps its English (the CLI and the logs print it) and gives the sentences the page shows a `CoreMessage` too: `{ code, params, text }` (`packages/core/src/message.ts`), from a `…Message` function next to the string one (`bootsNowMessage`, `backupPlanMessage`) or a field next to the text one (`whyMessage`, `warningMessages`, `PlanNote.message`, `messages`). Show it with `coreText(message)` from `lib/core-text.ts`, which renders `core:<code>` with each param translated (a nested message, a bank via `common:bank.*`, a list via `common:list.*`); `coreTexts(messages, texts)` takes a message list with its English fallback, `recordedCoreText(code, text)` a sentence saved in a run file (old files have only the English), and `recordedText(message, text)` one whose message must still say `text` (the Preserve run file's `refusedMessage`, `whyMessage`, `ruleMessage`, and core sentences built from them; core's `recordedParam` is the same rule for a param). A plain string passes through as it is. To give a core sentence a code: wrap it in core with `coreMessage(code, params, text)` without changing `text`, add the template to `locales/en/core.ts`, add a sample to `core-messages.test.ts` (it fails on any drift or on a template no sample reaches). A sentence that is a constant can be found by its English: `capabilityNoteMessage(note)` (a plan's, a bank's or an empty bank's note), `compareWordMessage(word)` (the preview's compare table), `keyNameParam(name)` ("Key A", "per-device key"), `supportReasonMessage(support)` (a refusing `Support` carries its own `reasonMessage`; a reason string, such as an empty bank's `why`, is found by its English when it is a constant). A core test (`packages/core/test/slots/note-messages.test.ts`) fails on a capability note, or a plan's or a family's refusal, with no message; `compareRows` writes the same constants `compareWordMessage` looks up. A message core builds inside a camera flow is reachable by the drift test through an exported builder (`PRESERVE_BANK_REFUSAL`, `SLOT_WRITE_REFUSAL`, `SUPPORT_REASON`, `READ_REASON`, `SLOT_FILE_WORDS`). A `SeekError` can carry `coreMessage`: `refusalOf()` shows it, and `coreText(errorCoreMessage(error) ?? errorMessage(error))` shows any caught error. A status line can too: `reporter.progress(done, total, text, unit, message)`; `useReporter` shows `message` in the language in use and the log keeps `text`. Where the page still shows core English, a `// i18n: core message` comment (or `{/* i18n: core message */}` in JSX) marks it: `grep -rn "i18n: core message" src` is the to-do list.

## What stays English

Keep these in English, in every language:

- hex values, status codes, register names, opcodes, firmware versions, file names;
- the run log lines (`reporter.log(...)`);
- the copyable camera report and bug-report text, which people paste to the owner;
- the CLI.

Translate the UI labels around them. Don't put the values in the dictionary at all: pass them as params (``'USB vendor `{vendor}`'``). If an English-only program is named in the text (Zadig's menus, `seek-fw info`), keep its names in English. Explain such cases in a comment above the key.

There is no "machine translation" label and no English shown under translated text: the owner declined both.

## How to add a language

Written for the agent that translates one language. You work from the English dictionaries alone; the code is there when a comment is not enough.

1. **Copy English.** `cp -R src/i18n/locales/en src/i18n/locales/<code>` (today `cs`, `de`, `es`, `fr`, `it`, `pl`, `pt`, `ro`, `ru`, `uk`, `zh-Hans`; planned `et`, `lv`, `lt`, `hu`, `sk`, `sl`, `sr`, `bg`).
2. **Translate each namespace file.** Change the type line and translate every value; keep every key and every comment's meaning (you may translate the comments or leave them):
   ```ts
   import type { Translation } from '../../types';
   export default {
     'connect.test': 'Verbindung testen' /* every key */,
   } satisfies Translation<'app', 'de'>;
   ```
   A missing key, an extra key, or a string where English has plural forms is a compile error.
3. **`locales/<code>/index.ts`:**
   ```ts
   import type { Dictionary } from '../../types';
   // the same imports as en/index.ts
   const de: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
   export default de;
   ```
4. **Register it**, in the same commit as your dictionaries (the types accept only a complete language):
   - **`languages.ts`:** add the code to `LanguageCode`, and replace your language's comment in `LANGUAGES` with its entry, in that place: `{ code: 'cs', name: 'Čeština', load: () => import('./locales/cs').then((m) => m.default) }`. Serbian adds `htmlLang: 'sr-Latn'` (the page is in Latin script); Hungarian adds `listCase: 'last'`, Estonian `listCase: { lastOnly: ['ter', 'ess', 'abe', 'com'], before: 'gen' }` (see "Cases").
   - **`<html lang>`** and each switcher option's `lang` come from `htmlLang`, else the code: nothing more to do.
   - **Detection:** nothing to do. `?lang=`, the kept choice and `navigator.languages` match the registry exactly, then by primary subtag: `cs-CZ` → `cs`, `sl-SI` → `sl`, and `sr`, `sr-RS`, `sr-Latn-RS`, `sr-Cyrl-RS` all → `sr` (`languages.test.tsx`).
   - **Switcher position:** the comment's place. The rule is English first, then the native names in Latin script in alphabetical order, then Cyrillic, then Chinese: English, Čeština, Deutsch, Eesti, Español, Français, Italiano, Latviešu, Lietuvių, Magyar, Polski, Português, Română, Slovenčina, Slovenščina, Srpski, Български, Русский, Українська, 简体中文. `languages.test.tsx` checks the order from the names.
   - **Plural categories:** `PluralCategoriesOf` in `types.ts` lists all twenty languages; your files name the language (`Translation<'<ns>', '<code>'>`).
   - **Tests and e2e that list languages:** none to edit. `locales.test.ts`, `core-messages.test.ts` and the phone e2e (`npm run e2e:phone:i18n`, which reads the languages from the switcher) cover every registered language; `languages.test.tsx` already lists all twenty; `i18n.test.tsx` uses its own fake registry.
   - **The language sentences:** add your language, in the switcher's order, to the root `README.md` ("The page is in English, …" and its `?lang=` code list) and to step 1 above. The integrator updates the CHANGELOG line and rebuilds `docs/` once, after the last language.
5. **Check it:** `npx tsc --noEmit -p packages/web/tsconfig.app.json`, then `npx vitest run packages/web/src/i18n/locales.test.ts packages/web/src/i18n/pseudo-locale.test.tsx packages/web/src/i18n/key-usage.test.ts packages/web/src/i18n/core-messages.test.ts packages/web/src/i18n/cases.test.tsx packages/web/src/i18n/languages.test.tsx` and the whole web project (`npx vitest run --project web`). `locales.test.ts` checks every registered language against English: keys, plural forms, `{params}` and `<slots>`. Then `npx eslint packages/web` and `npx prettier --write` on your files.

The language loads only when someone picks it (a dynamic `import()`, its own chunk), so a new language adds nothing to the English page.

### Conventions

- **Plain words.** The page is for camera owners, not firmware engineers. Say it the way a careful manual in your language would. Keep sentences short, as the English does.
- **Slot, never bank.** In this code "bank" is only the internal word for the same firmware slot (`common:bank.*` builds "Slot A"). Use your language's word for slot everywhere, also where the English says "bank" (core's sentences, the Slots and 0.x/1.x tabs' tables). Russian and Ukrainian: always "слот", never "банк".
- **Bank names:** `common:bank.*` builds them; keep the Latin letter (A, B, R). "Recovery R" is the last-resort slot the bootloader falls back to.
- **Units:** sizes are KB and MB, never the KiB/MiB style, even where the English writes "64 KiB" or "4 MiB" (a namespace comment that says KiB/MiB stay is overruled by this line). Write them in your language's usual form: Russian and Ukrainian **КБ/МБ** (never КиБ/МиБ), French **Ko/Mo**, every other language KB/MB. Bytes follow the sizes: a language that writes sizes in its own script writes bytes the same way (Russian and Ukrainian **Б**, French **o**); every other language keeps **B**. Hz and FPS stay. A number is inserted as it is (no grouping): don't add separators around `{count}`.
- **Keep as they are:** hex values, versions, file names and paths, register and command names (`cfg[0]`, GetFirmwareInfo, CompleteMemoryUpgrade), opcode names, family and product names (Compact, Compact PRO, Mosaic, Nano, Seek Thermal), programs (Zadig, Chrome, J-Link), WebUSB, and anything in `` `code` ``.
- **Buttons the text names.** When a sentence names a button ("press _Connect device_"), use the button's own translation from `app`/`shared`, word for word.
- **Capitals:** keep the English's. A value that starts lower case is said inside another sentence or after a label; one that starts upper case stands alone.
- **Plurals:** give the forms your language uses (`Intl.PluralRules` categories): ru/uk/pl/cs/sk/lt `one, few, many, other`; es/fr/it/pt `one, many, other`; ro `one, few, other`; sr `one, few, other`; sl `one, two, few, other`; lv `zero, one, other`; de/et/hu/bg `one, other`; zh-Hans `other` only.
- **Cases** (Polish, Russian, Ukrainian, German; see "Cases" above; French, Italian, Spanish and Portuguese use the same selectors for the article and its contraction, see "Romance languages"; Romanian for the article and the genitive-dative, see "Romanian"). A bank or a key inside a sentence can be asked for in a case: `{bank:gen}`, `{bank:dat}`, `{bank:acc}`, `{bank:ins}`, `{bank:loc}`, and the others in the table under "Cases" (`{bank:ill}`, `{key:com}`, …). Two steps:
  1. Give your forms once, next to the plain one, for each name: in `common.ts`, `'bank.slotInSentence:gen': 'slotu {letter}'`, `'bank.recoveryInSentence:loc': 'slocie odzyskiwania {letter}'` (and `bank.slot:*`, `bank.recovery:*` for the label forms where a sentence uses them); in `core.ts`, `'keyName.keyA:ins': 'kluczem A'`, and so on for each `keyName.*`. Write only the cases your language uses; a case you leave out is said in the plain form.
  2. In a sentence, write the case the grammar needs: `'Kopiuj do {bank:gen}'`, `'Zapisz w {bank:loc}'`, `'pod {key:ins}'`. Don't work round a case with a colon or brackets ("pod kluczem: {key}") any more.

  Which params are names: the `{bank}`, `{banks}`, `{a}`, `{b}`, `{r}`, `{order}`, `{key}`, `{storeKey}` of the keys `names.ts` lists (page namespaces), and in `core` the params its header lists as a bank or a key name. A param that is sometimes a whole sentence takes no case: turn the sentence so the plain form fits. A case on any other param fails `locales.test.ts` or `core-messages.test.ts`; if a sentence needs a case on a page param that is not listed, ask the integrator (the code must pass a name there). `{banks}` and `{order}` are lists: the case goes on each name.

- **Params** arrive either already translated (another key, a bank name, a list) or as data that stays as it is (hex, sizes, versions, file names). The comment above a key says which when it matters; the `core` namespace lists them all at its top.
- **What stays English** whatever the language: the run log lines, the copyable camera report, the CLI, and a browser's or the USB stack's own error text inside a translated sentence. See "What stays English" above.

### Notes for the languages added after Romanian

Czech, Estonian, Latvian, Lithuanian, Hungarian, Slovak, Slovenian, Serbian and Bulgarian. Each translator adds a section like "Romanian" above for their language when its selectors need explaining.

- **Plural forms, which numbers get which.** cs, sk: `one` 1, `few` 2–4, `many` a fraction ("1,5 souboru"), `other` 0 and 5 up. lt: `one` 1, 21, 31 … (not 11), `few` 2–9, 22–29 … (not 12–19), `many` a fraction, `other` 0, 10–20, 30 …. lv: `zero` 0, 10–20, 30, 40 … ("0 failu"), `one` 1, 21, 31 … (not 11), `other` the rest. sl: `one` 1, 101 …, `two` 2, 102 … (the dual), `few` 3, 4, 103, 104 … and fractions, `other` the rest. sr: `one` 1, 21 … (not 11), `few` 2–4, 22–24 … (not 12–14), `other` the rest. et, hu, bg: `one` 1, `other` the rest. Hungarian says the noun after a number in the singular ("3 fájl"), so its `one` and `other` often read the same; Estonian puts it in the partitive singular ("2 faili", "5 pesa"), in the `other` form.
- **Czech, Slovak, Slovenian, Serbian, Lithuanian, Latvian** decline the name like Polish: give `gen`, `dat`, `acc`, `ins`, `loc` forms ("ve slotu A", "se slotem A"; Latvian "slotā A", "ar slotu A"; Lithuanian "slote A"). No language here needs the vocative for a name.
- **Hungarian:** say the letter first and put the suffix on the noun, so the suffix follows the noun's vowels, not the letter's: "az A slotba", "a B slotba". The article is "az" before a vowel sound: A (á) and R (er) take "az", B (bé) takes "a". Put the article in the names' forms and give B its own form (`'bank.slotInSentence:ill': 'az {letter} slotba'`, `'bank.slotInSentence:ill#B': 'a {letter} slotba'`, and `:nom` for a subject), or leave it out of every name; never write "a" or "az" before a name param in a template. The keys are separate entries ("az A kulcs", "a B kulcs"), so each writes its own article. Lists take the suffix on the last name only (`listCase: 'last'`); the names before it are said in `:nom`. Hungarian has no gender and uses `:ins` for "with".
- **Estonian:** the case is a suffix on the noun, as in Hungarian, with `:gen` and `:par` doing much of the work: a finished object in the genitive, an unfinished one, a negated one and a counted noun in the partitive. A letter on its own takes its ending after a hyphen ("A-st"); a compound like "A-pesa" declines its noun ("A-pesas"). `listCase` puts the terminative, essive, abessive and comitative on the last name only, with the names before it in the genitive.
- **Latvian:** no article. The instrumental is "ar" + the accusative in the singular, so `:ins` may be that whole phrase or left out.
- **Serbian:** Latin script only (č, ć, đ, š, ž), never Cyrillic: the registry says `htmlLang: 'sr-Latn'`, and a browser set to Serbian Cyrillic gets this page too. Use the ekavian standard of Serbia.
- **Bulgarian:** no noun cases, but the definite article sits on the noun, as in Romanian: the full article for a subject ("слотът A", `:nom`), the short article as an object and after a preposition ("в слота A", "запишете слота A", `:acc`); the plain `{bank}` is the label without an article ("Слот A"). Sizes in Cyrillic like Russian and Ukrainian: **КБ, МБ, Б**; Hz and FPS stay.
- **Fonts:** the page uses the system's own fonts (`--font-sans` is `system-ui`, Segoe UI, Roboto…; `--font-mono` `ui-monospace`, SF Mono, Menlo, Consolas…), which cover every letter these languages use (ő ű, č ď ě ň ř ů ľ ĺ ŕ, ā ē ī ū ģ ķ ļ ņ ė į ų õ, đ ć, Cyrillic). Nothing to do.

### Glossary

| English                      | Means                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| slot / firmware slot         | one of the camera's three firmware copies (A, B, recovery R)           |
| dump                         | read the camera's flash to a file                                      |
| write / flash                | write an image into a slot                                             |
| boot / booted / next start   | which slot the camera starts from                                      |
| frame-rate patch, `N FPS`    | the edit that makes the camera run faster; keep "FPS" and the number   |
| run file                     | the Preserve wizard's saved zip, used to resume a run                  |
| backup (zip saved first)     | the zip every write downloads before it sends anything                 |
| key, Key A, Key B, key block | the camera's AES keys; "Key A"/"Key B" are names, translate "key" only |
| acceptance sum               | the checksum the bootloader checks on a decrypted image                |
| unlock token / power cycle   | the 0.x/1.x unlock; unplug and plug the camera back in                 |

### Checking a language by hand

`pseudo-locale.test.tsx` renders the page in a pseudo language and fails on any English left outside a short, commented allowlist. It renders the shell (header, switcher, connect section, footer, every support banner) and each tab in the states its stubs reach: no camera; a 4.x, a 2016 and a too-old build in Info; a full read; Decrypt File/Slot with a refused file, an erased bank and a read error; the 4.x tab idle, running and with a detected camera; Slots before a read, a 4.x and a 2016 read, empty and unread banks, a prepared write, its dialog and its outcome; Preserve before a run, after each phase, a failed commit, the reconnect and replug asks, the gave-up error, and the verdicts. It cannot reach, so check these by hand with `npm run dev` and `?lang=<code>`: the language menu opened; a live camera flow's own errors (USB failures, a refusal raised mid-run); the Slots tab's refusal and frame-rate outcomes; the 4.x tab's refusal; the offline dump decrypt's detection box; the Preserve run-file load. Where the page shows core text, the drift test (`core-messages.test.ts`) proves every core code has a template.

## How the language is chosen

The first match wins:

1. `?lang=xx` in the URL, for that visit only. Put it before the hash: `…/?lang=ru#/v4`.
2. The choice saved from the switcher (`localStorage['seek-fw:lang']`; storage that throws counts as no choice).
3. The first entry in `navigator.languages` whose primary subtag matches (`zh-TW` → `zh-Hans`, `pt-BR` → `pt`, `ro-MD` → `ro`; once registered, `sr-Cyrl-RS` → `sr`, `cs-CZ` → `cs`).
4. English.

`main.tsx` awaits `initI18n()` before the first render, so English never flashes first. A switch loads the language first, then re-renders. `<html lang>` always matches the language in use: its code, or the more specific tag its registry entry names (`htmlLang`: `pt` is `pt-PT`), which hyphenation and screen-reader voices key on. A pick in the switcher is saved and removes `?lang=` from the address bar. A pick in one tab is followed by the page's other open tabs (`followLanguageChoice()`, called by `main.tsx`), which also drop their own `?lang=`; the theme does the same.

## Tests

- `test-setup.ts` calls `resetI18n()` before every test, so every test runs in English whatever the machine's locale. Existing tests assert the English text and keep doing so: you don't need to change a test when you move its text into a dictionary. If one fails, the English changed.
- To test another language, mock the registry the way `i18n.test.tsx` does (`vi.mock('./languages', …)` with a fake dictionary), then `await act(async () => { await setLanguage('ru'); })`.
- Run `npx vitest run --project web`, `npx tsc --noEmit -p packages/web/tsconfig.app.json` and `npx eslint packages/web`, then prettier on the files you touched.
