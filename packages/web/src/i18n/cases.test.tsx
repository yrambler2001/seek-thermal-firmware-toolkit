/**
 * Names in grammatical cases (`{bank:gen}`): a fake Polish with case forms for slot A and Key A, and only
 * some forms for recovery R, against the real English; a fake Hungarian and a fake Estonian for the local
 * cases and for a list whose case only its last name takes. None of these strings is the real translation.
 */

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bankParam, coreMessage, keyNameParam, listParam } from '@seek-fw/core';
import { bankListRef, bankNameRef, bankWordsRef } from '@/lib/bank-names';
import { coreText, keyNameValue } from '@/lib/core-text';
import { render } from '@/test-helpers';
import { interpolate } from './format';
import type * as LanguagesModule from './languages';
import type { LanguageCode } from './languages';
import { rich } from './rich';
import { currentSayer, listItemCase, nameText, resetI18n, setLanguage, t, tEnglish } from './store';
import type { Dictionary, GrammaticalCase, NameRef, Translation } from './types';

vi.mock('./languages', async (importOriginal) => {
  const actual = await importOriginal<typeof LanguagesModule>();
  const { en } = await import('./locales/en');
  const pl = {
    ...en,
    common: {
      ...en.common,
      'list.and': '{first} i {second}',
      'bank.slot': 'Slot {letter}',
      'bank.slotInSentence': 'slot {letter}',
      'bank.slotInSentence:gen': 'slotu {letter}',
      'bank.slotInSentence:dat': 'slotowi {letter}',
      'bank.slotInSentence:acc': 'slot {letter}',
      'bank.slotInSentence:ins': 'slotem {letter}',
      'bank.slotInSentence:loc': 'slocie {letter}',
      'bank.recoveryInSentence': 'slot odzyskiwania {letter}',
      'bank.recoveryInSentence:gen': 'slotu odzyskiwania {letter}',
    },
    core: {
      ...en.core,
      'keyName.keyA': 'klucz A',
      'keyName.keyA:ins': 'kluczem A',
      'keys.derived.same': '{key:ins}, wyprowadzonym z uruchomionego {bank:gen}',
      'preserve.choice.bank': 'ze {bank:gen}',
      'boot.bootsNow': 'Kamera startuje {bank}',
    },
    slots: {
      ...en.slots,
      'table.copyTo': 'Kopiuj do {bank:gen}',
      'status.dumping': 'Zrzut {bank} ...',
      'fpsEveryOutcome.notWritten': 'Nic w {banks:loc}.',
      'preview.write': 'Zapisz w <b>{bank:loc}</b>…',
    },
  } as unknown as Dictionary;
  /* Hungarian: the suffix on the noun, the letter first ("A slotba"), and one suffix closing a list. */
  const hu = {
    ...en,
    common: {
      ...en.common,
      'list.and': '{first} és {second}',
      'bank.slot': '{letter} slot',
      'bank.slot:ine': '{letter} slotban',
      'bank.slotInSentence': '{letter} slot',
      'bank.slotInSentence:ine': '{letter} slotban',
      'bank.slotInSentence:ill': '{letter} slotba',
      'bank.slotInSentence:ela': '{letter} slotból',
      'bank.slotInSentence:sup': '{letter} sloton',
      'bank.slotInSentence:sub': '{letter} slotra',
      'bank.slotInSentence:del': '{letter} slotról',
      'bank.slotInSentence:ade': '{letter} slotnál',
      'bank.slotInSentence:all': '{letter} slothoz',
      'bank.slotInSentence:abl': '{letter} slottól',
      'bank.slotInSentence:tra': '{letter} slottá',
      'bank.slotInSentence:ter': '{letter} slotig',
      'bank.slotInSentence:ess': '{letter} slotként',
      'bank.slotInSentence:ins': '{letter} slottal',
      'bank.slotInSentence:cau': '{letter} slotért',
      'bank.slotInSentence:acc': '{letter} slotot',
      'bank.slotInSentence:dat': '{letter} slotnak',
      'bank.recoveryInSentence': '{letter} mentőslot',
      'bank.recoveryInSentence:ill': '{letter} mentőslotba',
      'bank.slotInSentence:nom': 'az {letter} slot',
      'bank.slotInSentence:nom#B': 'a {letter} slot',
      'bank.recoveryInSentence:nom': 'az {letter} mentőslot',
    },
    core: {
      ...en.core,
      'keyName.keyA': 'A kulcs',
      'keyName.keyA:ins': 'A kulccsal',
      'keyName.keyA:ela': 'A kulcsból',
      'keys.derived.same': '{key:ins}, a futó {bank:ela} származtatva',
      'preserve.choice.bank': '{bank:ill}',
      'boot.bootsNow': 'A kamera most így indul: {bank}',
    },
    slots: {
      ...en.slots,
      'table.copyTo': 'Másolás {bank:ill}',
      'fpsEveryOutcome.notWritten': 'Semmi sem került {banks:ill}.',
    },
  } as unknown as Dictionary;
  /* Estonian: each name takes the case, but the comitative (and ter/ess/abe) only on the last name, the
   * names before it in the genitive. */
  const et = {
    ...en,
    common: {
      ...en.common,
      'list.and': '{first} ja {second}',
      'bank.slotInSentence': '{letter}-pesa',
      'bank.slotInSentence:gen': '{letter}-pesa gen',
      'bank.slotInSentence:ine': '{letter}-pesas',
      'bank.slotInSentence:com': '{letter}-pesaga',
      'bank.slotInSentence:par': '{letter}-pesa par',
      'bank.recoveryInSentence': '{letter}-taastepesa',
      'bank.recoveryInSentence:gen': '{letter}-taastepesa gen',
      'bank.recoveryInSentence:ine': '{letter}-taastepesas',
      'bank.recoveryInSentence:com': '{letter}-taastepesaga',
    },
  } as unknown as Dictionary;
  return {
    ...actual,
    LANGUAGES: [
      ...actual.LANGUAGES.filter((language) => language.code !== 'pl'),
      { code: 'pl', name: 'Polski', load: () => Promise.resolve(pl) },
      {
        code: 'hu' as LanguageCode,
        name: 'Magyar',
        listCase: 'last',
        load: () => Promise.resolve(hu),
      },
      {
        code: 'et' as LanguageCode,
        name: 'Eesti',
        listCase: { lastOnly: ['ter', 'ess', 'abe', 'com'], before: 'gen' },
        load: () => Promise.resolve(et),
      },
    ],
  };
});

async function inPolish(): Promise<void> {
  await act(async () => {
    await setLanguage('pl');
  });
}

async function inLanguage(code: string): Promise<void> {
  await act(async () => {
    await setLanguage(code as LanguageCode);
  });
}

afterEach(() => {
  resetI18n();
});

const SLOT_A = bankWordsRef('a');

describe('a name in a case', () => {
  it('says the plain form where the template asks for no case', async () => {
    await inPolish();
    expect(t('slots:status.dumping', { bank: SLOT_A })).toBe('Zrzut slot A ...');
    expect(nameText(bankNameRef('b'))).toBe('Slot B');
  });

  it('says each case the language gives', async () => {
    await inPolish();
    const forms: Readonly<Partial<Record<GrammaticalCase, string>>> = {
      gen: 'slotu A',
      dat: 'slotowi A',
      acc: 'slot A',
      ins: 'slotem A',
      loc: 'slocie A',
    };
    for (const [gramCase, form] of Object.entries(forms)) {
      expect(interpolate(`{bank:${gramCase}}`, { bank: SLOT_A }, currentSayer())).toBe(form);
      expect(nameText(SLOT_A, t, gramCase as GrammaticalCase)).toBe(form);
    }
    expect(t('slots:table.copyTo', { bank: SLOT_A })).toBe('Kopiuj do slotu A');
  });

  it('falls back to the same language’s plain form when a form is missing', async () => {
    await inPolish();
    const recovery = bankWordsRef('r');
    expect(nameText(recovery, t, 'gen')).toBe('slotu odzyskiwania R');
    expect(nameText(recovery, t, 'loc')).toBe('slot odzyskiwania R');
    /* A name no entry says, and a case on a plain string, stay as they are. */
    expect(t('slots:table.copyTo', { bank: { text: 'Slot 7' } })).toBe('Kopiuj do Slot 7');
    expect(interpolate('{bank:gen}', { bank: 'slot A' }, currentSayer())).toBe('slot A');
  });

  it('changes nothing in English, which has no case forms', async () => {
    expect(t('slots:table.copyTo', { bank: SLOT_A })).toBe('Copy to slot A');
    expect(interpolate('{bank:loc} {bank}', { bank: SLOT_A }, currentSayer())).toBe(
      'slot A slot A',
    );
    await inPolish();
    expect(tEnglish('slots:table.copyTo', { bank: SLOT_A })).toBe('Copy to slot A');
  });

  it('puts every name of a list in the case', async () => {
    await inPolish();
    const banks = bankListRef(['a', 'b', 'r']);
    expect(t('slots:fpsEveryOutcome.notWritten', { banks })).toBe(
      'Nic w slocie A, slocie B i slot odzyskiwania R.',
    );
    expect(nameText(banks, t, 'gen')).toBe('slotu A, slotu B i slotu odzyskiwania R');
    expect(nameText(bankListRef(['b'], 'and'), t, 'ins')).toBe('slotem B');
  });

  it('says a core bank or key param in the case its template asks for, nested messages included', async () => {
    await inPolish();
    const derived = coreMessage(
      'keys.derived.same',
      { key: keyNameParam('Key A'), bank: bankParam('a') },
      'Key A, derived from the booted slot A',
    );
    expect(coreText(derived)).toBe('kluczem A, wyprowadzonym z uruchomionego slotu A');
    expect(coreText(derived, tEnglish)).toBe(derived.text);
    const inner = coreMessage('preserve.choice.bank', { bank: bankParam('a') }, 'slot A');
    const outer = coreMessage('boot.bootsNow', { bank: inner }, 'x');
    expect(coreText(outer)).toBe('Kamera startuje ze slotu A');
    const list = coreMessage(
      'preserve.choice.bank',
      { bank: listParam([bankParam('a'), bankParam('r')], 'commaAnd') },
      'slot A and recovery R',
    );
    expect(coreText(list)).toBe('ze slotu A i slotu odzyskiwania R');
  });

  it('says the local cases of Hungarian and Estonian', async () => {
    await inLanguage('hu');
    const forms: Readonly<Partial<Record<GrammaticalCase, string>>> = {
      ine: 'A slotban',
      ill: 'A slotba',
      ela: 'A slotból',
      sup: 'A sloton',
      sub: 'A slotra',
      del: 'A slotról',
      ade: 'A slotnál',
      all: 'A slothoz',
      abl: 'A slottól',
      tra: 'A slottá',
      ter: 'A slotig',
      ess: 'A slotként',
      ins: 'A slottal',
      cau: 'A slotért',
      acc: 'A slotot',
      dat: 'A slotnak',
    };
    for (const [gramCase, form] of Object.entries(forms)) {
      expect(interpolate(`{bank:${gramCase}}`, { bank: SLOT_A }, currentSayer())).toBe(form);
    }
    expect(t('slots:table.copyTo', { bank: SLOT_A })).toBe('Másolás A slotba');
    /* A form the language leaves out is its plain form. */
    expect(nameText(SLOT_A, t, 'com')).toBe('A slot');
    expect(nameText(bankWordsRef('r'), t, 'ine')).toBe('R mentőslot');
    await inLanguage('et');
    expect(nameText(SLOT_A, t, 'par')).toBe('A-pesa par');
    expect(nameText(SLOT_A, t, 'com')).toBe('A-pesaga');
  });

  it('reaches a new case through every name helper and core param', async () => {
    await inLanguage('hu');
    expect(nameText(bankNameRef('b'), t, 'ine')).toBe('B slotban');
    expect(nameText(bankWordsRef('b'), t, 'ill')).toBe('B slotba');
    expect(nameText(keyNameValue('Key A'), t, 'ela')).toBe('A kulcsból');
    expect(nameText(keyNameValue('a key core has no name for'), t, 'ela')).toBe(
      'a key core has no name for',
    );
    const derived = coreMessage(
      'keys.derived.same',
      { key: keyNameParam('Key A'), bank: bankParam('a') },
      'Key A, derived from the booted slot A',
    );
    expect(coreText(derived)).toBe('A kulccsal, a futó A slotból származtatva');
    const inner = coreMessage('preserve.choice.bank', { bank: bankParam('b') }, 'slot B');
    expect(coreText(coreMessage('boot.bootsNow', { bank: inner }, 'x'))).toBe(
      'A kamera most így indul: B slotba',
    );
    const list = coreMessage(
      'preserve.choice.bank',
      { bank: listParam([bankParam('a'), bankParam('b'), bankParam('r')], 'commaAnd') },
      'slot A, slot B and recovery R',
    );
    expect(coreText(list)).toBe('az A slot, a B slot és R mentőslotba');
  });

  it('puts a list’s case on each name, or only on the last, as the language says', async () => {
    const banks = bankListRef(['a', 'b', 'r']);
    await inPolish();
    expect(nameText(banks, t, 'loc')).toBe('slocie A, slocie B i slot odzyskiwania R');
    await inLanguage('hu');
    expect(t('slots:fpsEveryOutcome.notWritten', { banks })).toBe(
      'Semmi sem került az A slot, a B slot és R mentőslotba.',
    );
    expect(nameText(bankListRef(['a', 'b'], 'and'), t, 'ine')).toBe('az A slot és B slotban');
    expect(nameText(bankListRef(['b'], 'and'), t, 'ine')).toBe('B slotban');
    await inLanguage('et');
    /* Estonian: the inessive on each name, the comitative only on the last, the others in the genitive. */
    expect(nameText(banks, t, 'ine')).toBe('A-pesas, B-pesas ja R-taastepesas');
    expect(nameText(banks, t, 'com')).toBe('A-pesa gen, B-pesa gen ja R-taastepesaga');
    expect(nameText(banks)).toBe('A-pesa, B-pesa ja R-taastepesa');
  });

  it('takes a form given for the name’s own letter first (the Hungarian article)', async () => {
    await inLanguage('hu');
    expect(nameText(bankWordsRef('a'), t, 'nom')).toBe('az A slot');
    expect(nameText(bankWordsRef('b'), t, 'nom')).toBe('a B slot');
    expect(nameText(bankWordsRef('r'), t, 'nom')).toBe('az R mentőslot');
    /* No letter form for this case: the case form, then the plain form. */
    expect(nameText(bankWordsRef('b'), t, 'ill')).toBe('B slotba');
    expect(nameText(bankWordsRef('b'))).toBe('B slot');
    expect(nameText(bankListRef(['a', 'b']), t, 'nom')).toBe('az A slot és a B slot');
  });

  it('picks the case of each name in a list from the rule', () => {
    const estonian = { lastOnly: ['ter', 'ess', 'abe', 'com'], before: 'gen' } as const;
    expect(listItemCase('each', 'ine', false)).toBe('ine');
    expect(listItemCase('last', 'ine', false)).toBe('nom');
    expect(listItemCase('last', 'ine', true)).toBe('ine');
    expect(listItemCase(estonian, 'com', false)).toBe('gen');
    expect(listItemCase(estonian, 'com', true)).toBe('com');
    expect(listItemCase(estonian, 'ine', false)).toBe('ine');
    expect(listItemCase({ lastOnly: ['com'] }, 'com', false)).toBe('nom');
    expect(listItemCase('last', undefined, false)).toBeUndefined();
  });

  it('renders a case inside rich text', async () => {
    await inPolish();
    const { container } = render(
      <p>{rich('slots:preview.write', { params: { bank: SLOT_A } })}</p>,
    );
    expect(container.textContent).toBe('Zapisz w slocie A…');
  });
});

describe('the types', () => {
  it('ask for a name where names.ts declares one, and take a case form only of a name, in a known case', () => {
    // @ts-expect-error -- a declared name param takes a name, not text
    const text = t('slots:table.copyTo', { bank: 'slot A' });
    // @ts-expect-error -- a param names.ts does not declare takes no name
    const notName = t('slots:what.restore', { bank: SLOT_A, file: SLOT_A });
    const ref: NameRef = { name: 'core:keyName.keyB' };
    // @ts-expect-error -- only a bank or a key is a name
    const notNameKey: NameRef = { name: 'slots:table.copyTo' };
    const forms: Partial<Translation<'common'>> = {
      'bank.slot:loc': 'slocie {letter}',
      'bank.slot:ine': '{letter} slotban',
      'bank.recoveryInSentence:cau': '{letter} mentőslotért',
      'bank.slotInSentence:nom#B': 'a {letter} slot',
    };
    // @ts-expect-error -- a form for a letter no bank has
    const badLetter: Partial<Translation<'common'>> = { 'bank.slot:nom#C': 'x' };
    // @ts-expect-error -- `voc` is not a case the page knows
    const badCase: Partial<Translation<'common'>> = { 'bank.slot:voc': 'x' };
    // @ts-expect-error -- only a name entry has case forms
    const notNameForm: Partial<Translation<'common'>> = { 'list.and:gen': 'x' };
    expect([text, notName, ref, notNameKey, forms, badCase, notNameForm, badLetter]).toHaveLength(
      8,
    );
  });
});
