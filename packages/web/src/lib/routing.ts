/**
 * The five tabs, selected by the URL hash. Each is a real URL, so a tab can be
 * linked and reloaded. Nothing else is routed: an old or unknown hash (`#/dump`,
 * `#/flash`, anything) lands on the Info tab, with no redirect and no alias.
 */

import { useEffect, useState } from 'react';
import { t, useLanguage } from '@/i18n';

export type Route = 'info' | 'preserve' | 'v4' | 'decrypt' | 'slots';

export const ROUTE_HREF: Readonly<Record<Route, string>> = {
  info: '#/',
  preserve: '#/preserve',
  v4: '#/v4',
  decrypt: '#/decrypt',
  slots: '#/slots',
};

/** The tabs in nav order. */
export const ROUTES: readonly Route[] = ['info', 'preserve', 'v4', 'decrypt', 'slots'];

/**
 * A record whose values are read through `t()` each time, so they follow the
 * language in use while every caller keeps indexing it like a constant.
 */
function translated(read: (route: Route) => string): Readonly<Record<Route, string>> {
  const record = {} as Record<Route, string>;
  for (const route of ROUTES) {
    Object.defineProperty(record, route, { enumerable: true, get: () => read(route) });
  }
  return Object.freeze(record);
}

/** The tab labels, as the nav shows them, in the language in use. */
export const ROUTE_LABEL: Readonly<Record<Route, string>> = translated((route) =>
  t(`app:tab.${route}`),
);

/** Page titles, one per tab, in the language in use. */
export const ROUTE_TITLE: Readonly<Record<Route, string>> = translated((route) =>
  t('app:documentTitle', { tab: ROUTE_LABEL[route] }),
);

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
  const lang = useLanguage();

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
  }, [route, lang]);

  return route;
}
