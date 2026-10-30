/**
 * Names in grammatical cases (`{bank:gen}`): a fake Polish with case forms for slot A and Key A, and only
 * some forms for recovery R, against the real English. None of these strings is the real translation.
 */

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bankParam, coreMessage, keyNameParam, listParam } from '@seek-fw/core';
import { bankListRef, bankNameRef, bankWordsRef } from '@/lib/bank-names';
import { coreText } from '@/lib/core-text';
import { render } from '@/test-helpers';
import { interpolate } from './format';
import type * as LanguagesModule from './languages';
import { rich } from './rich';
import { currentSayer, nameText, resetI18n, setLanguage, t, tEnglish } from './store';
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
  return {
    ...actual,
    LANGUAGES: [
      ...actual.LANGUAGES.filter((language) => language.code !== 'pl'),
      { code: 'pl', name: 'Polski', load: () => Promise.resolve(pl) },
    ],
  };
});

async function inPolish(): Promise<void> {
  await act(async () => {
    await setLanguage('pl');
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
    const forms: Readonly<Record<GrammaticalCase, string>> = {
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
    const forms: Partial<Translation<'common'>> = { 'bank.slot:loc': 'slocie {letter}' };
    // @ts-expect-error -- `voc` is not a case the page knows
    const badCase: Partial<Translation<'common'>> = { 'bank.slot:voc': 'x' };
    // @ts-expect-error -- only a name entry has case forms
    const notNameForm: Partial<Translation<'common'>> = { 'list.and:gen': 'x' };
    expect([text, notName, ref, notNameKey, forms, badCase, notNameForm]).toHaveLength(7);
  });
});
