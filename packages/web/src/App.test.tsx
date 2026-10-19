/**
 * The shell: the five tabs, their order and labels, which tab a hash selects,
 * and what each tab puts on the page. The tab-level behaviour is in the view
 * tests; this file is the navigation and the promises the tabs make to a person.
 */

import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { detectSupport, type BrowserEnvironment } from './lib/support';
import { ROUTE_LABEL, ROUTE_TITLE } from './lib/routing';
import { buttonByText, render } from './test-helpers';

const READY = detectSupport({
  hasWebUsb: true,
  userAgent: 'Chrome',
  platform: 'MacIntel',
  maxTouchPoints: 0,
  isSecureContext: true,
  protocol: 'https:',
} satisfies BrowserEnvironment);

const NO_USB = detectSupport({
  hasWebUsb: false,
  userAgent: 'Firefox',
  platform: 'Linux x86_64',
  maxTouchPoints: 0,
  isSecureContext: true,
  protocol: 'https:',
} satisfies BrowserEnvironment);

const TAB_LABELS = [
  'Info',
  'Dump & decrypt 0.x/1.x 2014/2016',
  'Dump & decrypt 4.x/Nano',
  'Decrypt File/Slot',
  'Work with firmware slots',
];

function goTo(hash: string): void {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

function nav(container: HTMLElement): HTMLElement {
  const found = container.querySelector<HTMLElement>('nav[aria-label="Tabs"]');
  if (found === null) throw new Error('no tab nav');
  return found;
}

/** The Options spoiler: the one `<details>` whose summary says so. */
function optionsSpoiler(container: HTMLElement): HTMLDetailsElement {
  const found = [...container.querySelectorAll<HTMLDetailsElement>('details')].find((details) =>
    details.querySelector('summary')?.textContent.includes('Options'),
  );
  if (found === undefined) throw new Error('no Options spoiler');
  return found;
}

afterEach(() => {
  window.location.hash = '';
});

describe('the tabs', () => {
  it('are five, in the owner-set order, with the owner-set labels, and the current one is marked', () => {
    window.location.hash = '#/';
    const { container, unmount } = render(<App support={READY} />);

    const links = [...nav(container).querySelectorAll('a')];
    expect(links.map((link) => link.textContent)).toEqual(TAB_LABELS);
    expect(Object.values(ROUTE_LABEL)).toEqual(TAB_LABELS);
    const current = nav(container).querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]?.textContent).toBe('Info');
    unmount();
  });

  it('marks the tab the hash selects, and only that one', () => {
    window.location.hash = '#/v4';
    const { container, unmount } = render(<App support={READY} />);
    const current = nav(container).querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Dump & decrypt 4.x/Nano');
    expect(document.title).toBe(ROUTE_TITLE.v4);
    unmount();
  });

  it('swaps tabs on hashchange and keeps the Connect panel on the camera tabs', () => {
    window.location.hash = '#/';
    const { container, unmount } = render(<App support={READY} />);
    expect(container.textContent).toContain('Read firmware version');

    goTo('#/slots');
    expect(container.textContent).toContain('Read slots');
    expect(container.textContent).not.toContain('Read firmware version');
    expect(buttonByText(container, 'Connect device')).toBeTruthy();

    goTo('#/');
    expect(container.textContent).toContain('Read firmware version');
    unmount();
  });

  it('sends the old hashes, and anything unknown, to the Info tab', () => {
    for (const hash of ['#/dump', '#/flash', '#/nonsense']) {
      window.location.hash = hash;
      const { container, unmount } = render(<App support={READY} />);
      expect(nav(container).querySelector('[aria-current="page"]')?.textContent, hash).toBe('Info');
      expect(container.textContent, hash).toContain('Read firmware version');
      unmount();
    }
  });
});

describe('Info', () => {
  it('reads the version, says which tab each camera goes to, and writes nothing', () => {
    window.location.hash = '#/';
    const { container, unmount } = render(<App support={READY} />);

    expect(buttonByText(container, 'Read firmware version').disabled).toBe(true);
    expect(container.textContent).toContain('Connect the camera above first');

    const text = container.textContent;
    expect(text).toContain('What each tab is for');
    expect(text).toContain('Cameras on 0.x and 1.x firmware');
    expect(text).toContain('Cameras on 4.x firmware');
    expect(text).toContain('Cameras on 0.8.0.0 and newer firmware');
    expect(text).toContain('None. It uses no camera');
    expect(text).toContain('Nothing is written to flash on this tab.');
    unmount();
  });

  it('says where the 2016 and 1.3.0.8 FF builds go, and why', () => {
    window.location.hash = '#/';
    const { container, unmount } = render(<App support={READY} />);
    const text = container.textContent;
    expect(text).toContain('Where the 2016 and 1.3.0.8 FF builds are');
    expect(text).toContain('The 2016 Compact PRO builds (1.0.3.0 and 1.0.3.2');
    expect(text).toContain('the 1.3.0.8 FF (16 Hz) Compact build');
    expect(text).toContain('refused for 38 of its 63 selectors');
    unmount();
  });

  it('links each tab by its own hash, so the table is a way in', () => {
    window.location.hash = '#/';
    const { container, unmount } = render(<App support={READY} />);
    const table = container.querySelector('table');
    const hrefs = [...(table?.querySelectorAll('a') ?? [])].map((link) =>
      link.getAttribute('href'),
    );
    expect(hrefs).toEqual(['#/', '#/preserve', '#/v4', '#/decrypt', '#/slots']);
    unmount();
  });
});

describe('Dump & decrypt 4.x/Nano', () => {
  it('has no firmware-family selector and no hand-picked dump', () => {
    window.location.hash = '#/v4';
    const { container, unmount } = render(<App support={READY} />);

    expect(container.querySelector('#manualProfile')).toBeNull();
    expect(container.querySelector('label[for="manualProfile"]')).toBeNull();
    expect(container.textContent).not.toContain('firmware family');
    expect(container.textContent).not.toContain('Choose the firmware family yourself');
    expect(container.textContent).not.toContain('Dump as this family');
    expect(container.textContent).not.toContain('Dump legacy firmware');
    unmount();
  });

  it('keeps Start dump on the page and moves Dump all selectors into Options', () => {
    window.location.hash = '#/v4';
    const { container, unmount } = render(<App support={READY} />);

    expect(buttonByText(container, 'Start dump')).toBeTruthy();
    expect(buttonByText(container, 'Start dump').disabled).toBe(true);

    /* Not on the page proper: only inside the Options spoiler. */
    const everywhere = [...container.querySelectorAll('button')].filter(
      (button) => button.textContent.trim() === 'Dump all selectors (0x00–0xFF)',
    );
    expect(everywhere).toHaveLength(1);
    expect(optionsSpoiler(container).contains(everywhere[0] ?? null)).toBe(true);
    expect(buttonByText(container, 'Dump all selectors (0x00–0xFF)').disabled).toBe(true);
    unmount();
  });

  it('keeps the read options, the archive and the read-only guarantee', () => {
    window.location.hash = '#/v4';
    const { container, unmount } = render(<App support={READY} />);
    for (const id of [
      'optChunk',
      'optGapFill',
      'optRetries',
      'optRetryDelay',
      'optRecipient',
      'optDecrypt',
    ]) {
      expect(container.querySelector(`#${id}`), id).toBeTruthy();
    }
    expect(container.textContent).toContain('What you get');
    expect(container.textContent).toContain('Read-only guarantee');
    expect(container.textContent).toContain('GetFeaturedFirmwareData');
    unmount();
  });

  it('points at the other tab for a camera that is not 4.x/Nano, before it runs anything', () => {
    window.location.hash = '#/v4';
    const { container, unmount } = render(<App support={READY} />);
    expect(container.textContent).toContain('A camera on another firmware line is refused');
    expect(container.textContent).toContain('Dump & decrypt 0.x/1.x 2014/2016');
    unmount();
  });
});

describe('Decrypt File/Slot', () => {
  it('works with no camera: no Connect panel, no USB banner, and both file pickers are open', () => {
    window.location.hash = '#/decrypt';
    const { container, unmount } = render(<App support={NO_USB} />);

    expect(container.textContent).not.toContain('Connect device');
    expect(container.textContent).not.toContain('This browser cannot access USB devices.');
    expect(buttonByText(container, 'Choose dump file…').disabled).toBe(false);
    expect(buttonByText(container, 'Choose slot file…').disabled).toBe(false);
    expect(container.textContent).toContain('Decrypt a dump you already have');
    expect(container.textContent).toContain('Decrypt a firmware slot');
    unmount();
  });
});

describe('Dump & decrypt 0.x/1.x 2014/2016', () => {
  it('is the Preserve wizard under its new name, with its Connect step', () => {
    window.location.hash = '#/preserve';
    const { container, unmount } = render(<App support={READY} />);
    expect(container.textContent).toContain('For 0.x and 1.x cameras');
    expect(container.textContent).toContain('What to expect');
    expect(buttonByText(container, 'Connect device')).toBeTruthy();
    expect(document.title).toBe(ROUTE_TITLE.preserve);
    unmount();
  });
});

describe('Work with firmware slots', () => {
  it('writes, and says so, and sits on the same shell', () => {
    window.location.hash = '#/slots';
    const { container, unmount } = render(<App support={READY} />);
    expect(container.textContent).toContain('This tab writes to flash');
    expect(buttonByText(container, 'Read slots')).toBeTruthy();
    expect(document.title).toBe(ROUTE_TITLE.slots);
    unmount();
  });
});
