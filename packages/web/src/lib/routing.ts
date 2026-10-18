/**
 * The five tabs, selected by the URL hash. Each is a real URL, so a tab can be
 * linked and reloaded. Nothing else is routed: an old or unknown hash (`#/dump`,
 * `#/flash`, anything) lands on the Info tab, with no redirect and no alias.
 */

import { useEffect, useState } from 'react';

export type Route = 'info' | 'preserve' | 'v4' | 'decrypt' | 'slots';

export const ROUTE_HREF: Readonly<Record<Route, string>> = {
  info: '#/',
  preserve: '#/preserve',
  v4: '#/v4',
  decrypt: '#/decrypt',
  slots: '#/slots',
};

/** The tab labels, as the nav shows them. */
export const ROUTE_LABEL: Readonly<Record<Route, string>> = {
  info: 'Info',
  preserve: 'Dump & decrypt 0.x/1.x 2014/2016',
  v4: 'Dump & decrypt 4.x/Nano',
  decrypt: 'Decrypt File/Slot',
  slots: 'Work with firmware slots',
};

/** The tabs in nav order. */
export const ROUTES: readonly Route[] = ['info', 'preserve', 'v4', 'decrypt', 'slots'];

/** Page titles, one per tab. */
export const ROUTE_TITLE: Readonly<Record<Route, string>> = {
  info: 'Seek Thermal Firmware — Info (WebUSB)',
  preserve: 'Seek Thermal Firmware — Dump & decrypt 0.x/1.x 2014/2016 (WebUSB)',
  v4: 'Seek Thermal Firmware — Dump & decrypt 4.x/Nano (WebUSB)',
  decrypt: 'Seek Thermal Firmware — Decrypt File/Slot (WebUSB)',
  slots: 'Seek Thermal Firmware — Work with firmware slots (WebUSB)',
};

export function parseRoute(hash: string): Route {
  const cleaned = hash.replace(/^#/, '').replace(/^\//, '').replace(/\/$/, '').toLowerCase();
  if (cleaned === 'preserve') return 'preserve';
  if (cleaned === 'v4') return 'v4';
  if (cleaned === 'decrypt') return 'decrypt';
  if (cleaned === 'slots') return 'slots';
  return 'info';
}

export function currentRoute(): Route {
  return parseRoute(typeof location === 'undefined' ? '' : location.hash);
}

/** Subscribes to `hashchange`. No router dependency, and none is needed. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const onHashChange = (): void => {
      setRoute(currentRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    /* The hash may have changed between the initial render and this effect. */
    onHashChange();
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLE[route];
  }, [route]);

  return route;
}
