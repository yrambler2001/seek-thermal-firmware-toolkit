/**
 * The i18n core against a fake registry: English (the real one), a Russian
 * that has only a few keys but all four plural forms, a Chinese with only the
 * `other` form, a German whose chunk cannot be fetched, and a Polish and a
 * Ukrainian that load only when the test says so. None of these strings is a real translation.
 */

import { act, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { useReporter } from '@/hooks/useReporter';
import { bankName, bankWords } from '@/lib/bank-names';
import { render, renderHook } from '@/test-helpers';
import {
  LANG_KEY,
  detectLanguage,
  dropLangParam,
  matchLanguage,
  readLanguageChoice,
  readLanguageEnvironment,
} from './detect';
import { interpolate, pluralCategory } from './format';
import type * as LanguagesModule from './languages';
import type { LanguageEntry } from './languages';
import { useT } from './react';
import { renderMarkup } from './rich';
import {
  followLanguageChoice,
  getLanguage,
  initI18n,
  listAnd,
  listComma,
  listThen,
  resetI18n,
  setLanguage,
  t,
  tEnglish,
} from './store';
import type { Dictionary } from './types';

const [gate, ukGate] = vi.hoisted(() => {
  const make = () => {
    let open: () => void = () => undefined;
    const opened = new Promise<void>((resolve) => {
      open = resolve;
    });
    return {
      opened,
      open: () => {
        open();
      },
    };
  };
  return [make(), make()] as const;
});

vi.mock('./languages', async (importOriginal) => {
  const actual = await importOriginal<typeof LanguagesModule>();
  const ru = {
    common: {
      'count.files': {
        one: '{count} файл',
        few: '{count} файла',
        many: '{count} файлов',
        other: '{count} файла',
      },
      'list.and': '{first} и {second}',
      'list.then': '{first}, затем {second}',
      'bank.slot': 'Слот {letter}',
      'bank.recovery': 'Резервный {letter}',
    },
    app: { 'connect.test': 'Проверить соединение', 'language.label': 'Язык' },
    shared: { 'status.idle': 'Ожидание.' },
  };
  const zh = { common: { 'count.files': { other: '{count} 个文件' } } };
  const pl = { app: { 'connect.test': 'Testuj połączenie' } };
  const fake = (dict: unknown) => () => Promise.resolve(dict as Dictionary);
  const registry: readonly LanguageEntry[] = [
    actual.LANGUAGES[0]!,
    { code: 'de', name: 'Deutsch', load: () => Promise.reject(new Error('offline')) },
    {
      code: 'pl',
      name: 'Polski',
      load: () => gate.opened.then(() => pl as unknown as Dictionary),
    },
    { code: 'pt', name: 'Português', load: fake({}) },
    { code: 'ru', name: 'Русский', load: fake(ru) },
    { code: 'uk', name: 'Українська', load: () => ukGate.opened.then(() => ({}) as Dictionary) },
    { code: 'zh-Hans', name: '简体中文', load: fake(zh) },
  ];
  return { ...actual, LANGUAGES: registry };
});

function setUrl(url: string): void {
  window.history.replaceState(null, '', url);
}

beforeEach(() => {
  localStorage.clear();
  setUrl('/');
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  setUrl('/');
});

describe('choosing the starting language', () => {
  const env = { search: '', stored: null, languages: [] as string[] };

  it('takes ?lang= first, then the kept choice, then the browser, then English', () => {
    const all = { search: '?lang=ru', stored: 'pt', languages: ['zh-CN'] };
    expect(detectLanguage(all)).toBe('ru');
    expect(detectLanguage({ ...all, search: '' })).toBe('pt');
    expect(detectLanguage({ ...all, search: '', stored: null })).toBe('zh-Hans');
    expect(detectLanguage(env)).toBe('en');
  });

  it('skips a ?lang= or a kept choice that is not registered', () => {
    expect(detectLanguage({ ...env, search: '?lang=ja', stored: 'xx', languages: ['ru'] })).toBe(
      'ru',
    );
  });

  it('matches the browser by primary subtag, in the browser’s order', () => {
    expect(detectLanguage({ ...env, languages: ['ja-JP', 'zh-TW', 'ru'] })).toBe('zh-Hans');
    expect(detectLanguage({ ...env, languages: ['pt-BR'] })).toBe('pt');
    expect(detectLanguage({ ...env, languages: ['en-GB', 'ru'] })).toBe('en');
    expect(matchLanguage('ZH-hans')).toBe('zh-Hans');
    expect(matchLanguage('zh')).toBe('zh-Hans');
    expect(matchLanguage('')).toBeNull();
  });

  it('reads the live URL, storage and navigator', () => {
    setUrl('/?lang=ru#/v4');
    localStorage.setItem(LANG_KEY, 'pt');
    const live = readLanguageEnvironment();
    expect(live.search).toBe('?lang=ru');
    expect(live.stored).toBe('pt');
    expect(live.languages.length).toBeGreaterThan(0);
  });
});

describe('loading and switching', () => {
  it('starts in English, and puts the language on <html lang>', async () => {
    expect(getLanguage()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    await initI18n({ search: '?lang=ru', stored: null, languages: [] });
    expect(getLanguage()).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    resetI18n();
    expect(document.documentElement.lang).toBe('en');
  });

  it('stays in English when the language cannot be loaded', async () => {
    await expect(initI18n({ search: '?lang=de', stored: null, languages: [] })).resolves.toBe('en');
    await setLanguage('ru');
    await expect(setLanguage('de')).rejects.toThrow('offline');
    expect(getLanguage()).toBe('ru');
  });

  it('lets the last switch win when an earlier load is slow', async () => {
    const slow = setLanguage('pl');
    await setLanguage('ru');
    gate.open();
    await slow;
    expect(getLanguage()).toBe('ru');
  });
});

describe('keeping the choice', () => {
  it('keeps a pick and drops ?lang= from the URL, keeping the hash', async () => {
    setUrl('/?lang=pt&x=1#/v4');
    await setLanguage('ru', { persist: true });
    expect(localStorage.getItem(LANG_KEY)).toBe('ru');
    expect(window.location.search).toBe('?x=1');
    expect(window.location.hash).toBe('#/v4');
  });

  it('keeps nothing for ?lang= or the browser’s language', async () => {
    await initI18n({ search: '?lang=ru', stored: null, languages: [] });
    expect(localStorage.getItem(LANG_KEY)).toBeNull();
  });

  it('still switches, for the visit, when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    await setLanguage('ru', { persist: true });
    expect(getLanguage()).toBe('ru');
    expect(readLanguageChoice()).toBeNull();
  });

  it('follows a pick made in another tab, and drops this tab’s ?lang=', async () => {
    setUrl('/?lang=pt#/v4');
    const stop = followLanguageChoice();
    const fire = async (key: string | null, newValue: string | null): Promise<void> => {
      window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    };
    await fire('seek-fw:theme', 'ru');
    await fire(LANG_KEY, 'xx');
    await fire(null, null);
    expect(getLanguage()).toBe('en');
    expect(window.location.search).toBe('?lang=pt');
    await fire(LANG_KEY, 'ru');
    expect(getLanguage()).toBe('ru');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#/v4');
    stop();
    await fire(LANG_KEY, 'zh-Hans');
    expect(getLanguage()).toBe('ru');
  });

  it('reads no choice when localStorage itself cannot be reached', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(readLanguageChoice()).toBeNull();
    expect(() => {
      dropLangParam();
    }).not.toThrow();
  });
});

describe('t()', () => {
  it('fills named params, and leaves a missing one visible', () => {
    expect(t('app:documentTitle', { tab: 'Info' })).toBe('Seek Thermal Firmware — Info (WebUSB)');
    expect(interpolate('{slot} of {count}: {missing}', { slot: 'A', count: 3 })).toBe(
      'A of 3: {missing}',
    );
  });

  it('falls back to English for a key the language lacks', async () => {
    await setLanguage('ru');
    expect(t('app:connect.test')).toBe('Проверить соединение');
    expect(t('app:connect.forget')).toBe('Forget device');
  });

  it('picks English plural forms', () => {
    expect(t('common:count.files', { count: 1 })).toBe('1 file');
    expect(t('common:count.files', { count: 0 })).toBe('0 files');
    expect(t('common:count.files', { count: 2 })).toBe('2 files');
  });

  it('picks one/few/many/other in a Russian-style language', async () => {
    await setLanguage('ru');
    const files = (count: number): string => t('common:count.files', { count });
    expect([1, 21, 2, 4, 22, 5, 11, 12, 25, 1.5].map(files)).toEqual([
      '1 файл',
      '21 файл',
      '2 файла',
      '4 файла',
      '22 файла',
      '5 файлов',
      '11 файлов',
      '12 файлов',
      '25 файлов',
      '1.5 файла',
    ]);
    expect(pluralCategory('ru', 5)).toBe('many');
  });

  it('chooses European Portuguese plural rules for pt, not the Brazilian ones plain pt resolves to', () => {
    expect([0, 1, 2, 1.5, 1000000].map((n) => pluralCategory('pt', n))).toEqual([
      'other',
      'one',
      'other',
      'other',
      'many',
    ]);
  });

  it('uses `other` alone where the language has one form', async () => {
    await setLanguage('zh-Hans');
    expect(t('common:count.files', { count: 1 })).toBe('1 个文件');
    expect(t('common:count.files', { count: 7 })).toBe('7 个文件');
  });
});

describe('English for the log, lists', () => {
  it('tEnglish() gives English whatever the language in use', async () => {
    await setLanguage('ru');
    expect(t('app:connect.test')).toBe('Проверить соединение');
    expect(tEnglish('app:connect.test')).toBe('Test connection');
    expect(tEnglish('common:count.files', { count: 2 })).toBe('2 files');
  });

  it('listAnd() joins pairwise with common:list.and, in the language in use', async () => {
    expect(listAnd([])).toBe('');
    expect(listAnd(['slot A'])).toBe('slot A');
    expect(listAnd(['slot A', 'slot B', 'slot R'])).toBe('slot A and slot B and slot R');
    await setLanguage('ru');
    expect(listAnd(['A', 'B'])).toBe('A и B');
    expect(listAnd(['A', 'B'], tEnglish)).toBe('A and B');
  });

  it('listThen() and listComma() join pairwise; a missing translation falls back to English', async () => {
    expect(listThen(['slot B', 'recovery R', 'slot A'])).toBe(
      'slot B, then recovery R, then slot A',
    );
    expect(listComma(['slot A', 'slot B', 'recovery R'])).toBe('slot A, slot B, recovery R');
    expect(listThen([])).toBe('');
    await setLanguage('ru');
    expect(listThen(['A', 'B'])).toBe('A, затем B');
    expect(listComma(['A', 'B'])).toBe('A, B');
  });

  it('names the banks with common:bank.*, the letter as a param', async () => {
    expect([bankName('a'), bankName('b'), bankName('r')]).toEqual([
      'Slot A',
      'Slot B',
      'Recovery R',
    ]);
    expect([bankWords('a'), bankWords('r')]).toEqual(['slot A', 'recovery R']);
    await setLanguage('ru');
    expect([bankName('b'), bankName('r')]).toEqual(['Слот B', 'Резервный R']);
    expect(bankName('r', tEnglish)).toBe('Recovery R');
  });

  it('keeps an untouched status line in step with the language, and a set one as set', async () => {
    const hook = renderHook(() => useReporter());
    expect(hook.result.current.progress.text).toBe('Idle.');
    await act(async () => {
      await setLanguage('ru');
    });
    hook.rerender();
    expect(hook.result.current.progress.text).toBe('Ожидание.');
    act(() => {
      hook.result.current.setStatus('Read.');
    });
    await act(async () => {
      await setLanguage('en');
    });
    hook.rerender();
    expect(hook.result.current.progress.text).toBe('Read.');
    hook.unmount();
  });
});

describe('markup and slots', () => {
  function html(nodes: ReturnType<typeof renderMarkup>): string {
    const { container, unmount } = render(<p>{nodes}</p>);
    const out = container.innerHTML;
    unmount();
    return out;
  }

  it('renders bold, emphasis and code, with params inside them', () => {
    expect(html(renderMarkup('a **{x}** *b* `{y}`', { x: 'X', y: '0x289d' }))).toBe(
      '<p>a <strong>X</strong> <em>b</em> <code>0x289d</code></p>',
    );
  });

  it('never reads markup out of a param', () => {
    expect(html(renderMarkup('see {name}', { name: '**not bold** <a/>' }))).toBe(
      '<p>see **not bold** &lt;a/&gt;</p>',
    );
  });

  it('wraps slot text, places self-closing slots, and keeps text of an unknown slot', () => {
    const out = html(
      renderMarkup('Use <zadig>Zadig *now*</zadig>, <icon/> and <other>this</other>.', undefined, {
        zadig: (text) => <a href="https://zadig.akeo.ie/">{text}</a>,
        icon: () => <b>i</b>,
      }),
    );
    expect(out).toBe(
      '<p>Use <a href="https://zadig.akeo.ie/">Zadig <em>now</em></a>, <b>i</b> and this.</p>',
    );
  });
});

describe('React', () => {
  function Probe(): ReactElement {
    const { t: translate, lang } = useT();
    return <p data-lang={lang}>{translate('app:connect.test')}</p>;
  }

  it('re-renders a component that uses useT() when the language changes', async () => {
    const { container, unmount } = render(<Probe />);
    expect(container.textContent).toBe('Test connection');
    await act(async () => {
      await setLanguage('ru');
    });
    expect(container.textContent).toBe('Проверить соединение');
    expect(container.querySelector('p')?.dataset.lang).toBe('ru');
    unmount();
  });

  it('offers the registry in order, by native name, and keeps a pick', async () => {
    setUrl('/?lang=ru#/slots');
    const { container, unmount } = render(<LanguageSwitch />);
    const select = container.querySelector('select');
    if (select === null) throw new Error('no select');
    expect(container.querySelector(`label[for="${select.id}"]`)?.textContent).toBe('Language');
    expect([...select.options].map((option) => [option.value, option.text, option.lang])).toEqual([
      ['en', 'English', 'en'],
      ['de', 'Deutsch', 'de'],
      ['pl', 'Polski', 'pl'],
      ['pt', 'Português', 'pt'],
      ['ru', 'Русский', 'ru'],
      ['uk', 'Українська', 'uk'],
      ['zh-Hans', '简体中文', 'zh-Hans'],
    ]);
    expect(select.value).toBe('en');

    await act(async () => {
      select.value = 'ru';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });
    expect(getLanguage()).toBe('ru');
    expect(select.value).toBe('ru');
    expect(container.querySelector('label')?.textContent).toBe('Язык');
    expect(localStorage.getItem(LANG_KEY)).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#/slots');
    unmount();
  });

  it('shows a pick while it loads, and lets a pick back to the old language win', async () => {
    const { container, unmount } = render(<LanguageSwitch />);
    const select = container.querySelector('select');
    if (select === null) throw new Error('no select');
    const pick = async (code: string): Promise<void> => {
      await act(async () => {
        select.value = code;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await Promise.resolve();
      });
    };
    await pick('uk');
    expect(getLanguage()).toBe('en');
    expect(select.value).toBe('uk');
    await pick('en');
    await act(async () => {
      ukGate.open();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(getLanguage()).toBe('en');
    expect(select.value).toBe('en');
    unmount();
  });
});
