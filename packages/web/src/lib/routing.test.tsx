import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '../test-helpers';
import { ROUTES, ROUTE_HREF, ROUTE_LABEL, ROUTE_TITLE, parseRoute, useRoute } from './routing';

function goTo(hash: string): void {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

afterEach(() => {
  window.location.hash = '';
});

describe('the tabs', () => {
  it('are the five tabs, in the owner-set order and with the owner-set labels', () => {
    expect(ROUTES).toEqual(['info', 'preserve', 'v4', 'decrypt', 'slots']);
    expect(ROUTES.map((route) => ROUTE_LABEL[route])).toEqual([
      'Info',
      'Dump & decrypt 0.x/1.x 2014/2016',
      'Dump & decrypt 4.x/Nano',
      'Decrypt File/Slot',
      'Work with firmware slots',
    ]);
  });

  it('have one hash each, and every hash parses back to its own tab', () => {
    expect(ROUTES.map((route) => ROUTE_HREF[route])).toEqual([
      '#/',
      '#/preserve',
      '#/v4',
      '#/decrypt',
      '#/slots',
    ]);
    for (const route of ROUTES) {
      expect(parseRoute(ROUTE_HREF[route])).toBe(route);
    }
  });
});

describe('parseRoute', () => {
  it('reads each canonical hash as its tab', () => {
    expect(parseRoute('#/')).toBe('info');
    expect(parseRoute('#/preserve')).toBe('preserve');
    expect(parseRoute('#/v4')).toBe('v4');
    expect(parseRoute('#/decrypt')).toBe('decrypt');
    expect(parseRoute('#/slots')).toBe('slots');
  });

  it('sends old and unknown hashes to the Info tab, with no alias for them', () => {
    expect(parseRoute('#dump')).toBe('info');
    expect(parseRoute('#flash')).toBe('info');
    expect(parseRoute('#/dump')).toBe('info');
    expect(parseRoute('#/flash')).toBe('info');
    expect(parseRoute('')).toBe('info');
    expect(parseRoute('#')).toBe('info');
    expect(parseRoute('#/nonsense')).toBe('info');
  });

  it('ignores case and a trailing slash', () => {
    expect(parseRoute('#/V4/')).toBe('v4');
    expect(parseRoute('#/DECRYPT')).toBe('decrypt');
    expect(parseRoute('#/PRESERVE/')).toBe('preserve');
  });
});

describe('useRoute', () => {
  it('starts on the Info tab and follows hashchange', () => {
    window.location.hash = '';
    const { result, unmount } = renderHook(() => useRoute());
    expect(result.current).toBe('info');
    expect(document.title).toBe(ROUTE_TITLE.info);

    goTo(ROUTE_HREF.v4);
    expect(result.current).toBe('v4');
    expect(document.title).toBe(ROUTE_TITLE.v4);

    goTo(ROUTE_HREF.decrypt);
    expect(result.current).toBe('decrypt');
    expect(document.title).toBe(ROUTE_TITLE.decrypt);

    goTo(ROUTE_HREF.info);
    expect(result.current).toBe('info');
    expect(document.title).toBe(ROUTE_TITLE.info);

    unmount();
  });

  it('stops listening once unmounted', () => {
    window.location.hash = '';
    const { result, unmount } = renderHook(() => useRoute());
    unmount();
    goTo(ROUTE_HREF.slots);
    expect(result.current).toBe('info');
  });
});
