/**
 * What index.html does before React runs: the inline script that puts the
 * theme on <html> before the first paint, and the favicon, which is the
 * header's thermometer tile as the dark theme draws it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import indexHtml from '../index.html?raw';
import styles from './styles.css?raw';
import { THEME_KEY } from './lib/theme';
import { denied, fakeSystem, resetThemeDom } from './test-theme';

/** The page's one inline <script>, the theme rule. */
function themeScript(): string {
  const match = /<script>([\s\S]*?)<\/script>/.exec(indexHtml);
  if (match?.[1] === undefined) throw new Error('index.html has no inline theme script');
  return match[1];
}

/** Runs the script as the browser does, against this document and its storage. */
function runThemeScript(): void {
  /* The inline script is the code under test; there is no module to import it from. */
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const run = new Function('window', 'document', themeScript()) as (
    win: Window,
    doc: Document,
  ) => void;
  run(window, document);
}

describe("index.html's theme script", () => {
  let meta: HTMLMetaElement;

  beforeEach(() => {
    localStorage.clear();
    meta = resetThemeDom();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    meta.remove();
  });

  const cases = [
    { stored: null, systemDark: true, theme: 'dark' },
    { stored: null, systemDark: false, theme: 'light' },
    { stored: 'dark', systemDark: false, theme: 'dark' },
    { stored: 'light', systemDark: true, theme: 'light' },
    { stored: 'sepia', systemDark: true, theme: 'dark' },
  ] as const;

  for (const { stored, systemDark, theme } of cases) {
    it(`applies ${theme} with ${stored ?? 'no choice'} kept and a ${systemDark ? 'dark' : 'light'} system`, () => {
      if (stored !== null) localStorage.setItem(THEME_KEY, stored);
      fakeSystem(systemDark);
      runThemeScript();
      expect(document.documentElement.dataset.theme).toBe(theme);
      expect(meta.content).toBe(theme);
    });
  }

  it('follows the system when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    fakeSystem(true);
    runThemeScript();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('follows the system when reaching localStorage throws', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(denied);
    fakeSystem(true);
    runThemeScript();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('is light without matchMedia', () => {
    runThemeScript();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('runs in <head> before the stylesheet and the app, after the meta tag it updates', () => {
    const at = (needle: string): number => indexHtml.indexOf(needle);
    expect(at('name="color-scheme"')).toBeLessThan(at('<script>'));
    expect(at('<script>')).toBeLessThan(at('</head>'));
    expect(at('</head>')).toBeLessThan(at('<script type="module"'));
  });
});

/* ---- the favicon ------------------------------------------------------ */

/** oklch() to sRGB channels in 0..1, as CSS Color 4 defines it. */
function oklchToSrgb(l: number, c: number, hue: number): number[] {
  const h = (hue * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1,
  ];
  return linear.map((x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, v));
  });
}

/** `top` at `alpha` over `under`, mixed in sRGB as the browser composites. */
const over = (top: number[], alpha: number, under: number[]): number[] =>
  top.map((value, i) => alpha * value + (1 - alpha) * (under[i] ?? 0));

const hex = (rgb: number[]): string =>
  '#' +
  rgb
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** A token's oklch() from the dark block of styles.css. */
function darkToken(name: string): number[] {
  const block = /:root\[data-theme='dark'\] \{([\s\S]*?)\n\}/.exec(styles)?.[1] ?? '';
  const value = new RegExp(`--${name}: oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\);`).exec(block);
  if (value === null) throw new Error(`no dark --${name} in styles.css`);
  return oklchToSrgb(Number(value[1]), Number(value[2]), Number(value[3]));
}

function favicon(): string {
  const match = /<link\s+rel="icon"[\s\S]*?href="data:image\/svg\+xml,([^"]+)"/.exec(indexHtml);
  if (match?.[1] === undefined) throw new Error('index.html has no inline SVG favicon');
  return decodeURIComponent(match[1]);
}

describe('the favicon', () => {
  it("is the header's thermometer tile in the dark theme's colours", () => {
    /* The header is `bg-card/60` over the page; the tile is `bg-primary/10` with a
     * `border-primary/30` edge; the thermometer is `text-primary`. */
    const header = over(darkToken('card'), 0.6, darkToken('background'));
    const tile = over(darkToken('primary'), 0.1, header);
    const edge = over(darkToken('primary'), 0.3, tile);
    const svg = favicon();
    expect(svg).toContain(
      `<rect x='.5' y='.5' width='31' height='31' rx='8.5' fill='${hex(tile)}' stroke='${hex(edge)}'/>`,
    );
    expect(svg).toContain(`stroke='${hex(darkToken('primary'))}' stroke-width='2'`);
    expect(svg).toContain("viewBox='0 0 32 32'");
  });

  it('draws the tube walls on whole pixels at 16 and 32 px', () => {
    /* Walls at x = 13 and 19 with a 2-unit stroke: edges at 12, 14, 18 and 20 on
     * the 32 grid, so 6, 7, 9 and 10 at 16 px — and centred on the tile. */
    const path = /<path d='([^']+)'/.exec(favicon())?.[1];
    expect(path).toBe('M19 7.5v11a5 5 0 1 1-6 0V7.5a3 3 0 0 1 6 0Z');
  });
});
