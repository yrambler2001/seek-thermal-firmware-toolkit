/**
 * Browser-support detection, ported from the original page's `checkSupport()`.
 *
 * The prose is the original's, word for word; only its HTML tags have become
 * the mini-markup of ./rich-text.tsx. It lives in the `app` namespace
 * (src/i18n/locales/en/app.ts) and is read in the language in use when
 * `detectSupport` runs; App runs it again when the language changes. The one rule that matters is at the top
 * of the original function and is preserved exactly: **dumping needs WebUSB,
 * decrypting a file you already have does not**, so an unsupported browser
 * loses steps 1-2 and keeps the offline decryptor.
 */

import { t } from '@/i18n';
import { getWebUsb } from './webusb';

export type SupportKind = 'ready' | 'ios' | 'no-webusb' | 'insecure';

export interface BrowserEnvironment {
  readonly hasWebUsb: boolean;
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
  readonly isSecureContext: boolean;
  /** `location.protocol`, e.g. 'https:' or 'file:'. */
  readonly protocol: string;
}

export interface SupportStatus {
  readonly kind: SupportKind;
  readonly tone: 'ok' | 'warn';
  /** Whether the Connect button can do anything at all. */
  readonly canUseUsb: boolean;
  /**
   * Always true. The offline decryptor runs on a file the user picks and needs
   * no USB access, so no environment check may ever disable it.
   */
  readonly offlineDecryptWorks: true;
  readonly paragraphs: readonly string[];
}

/** The original's `offlineStillWorks`, appended to every failure banner, in the language in use. */
export function offlineStillWorks(): string {
  return t('app:support.offlineStillWorks', { tab: t('app:tab.decrypt') });
}

/** Its English wording, which the tests pin. */
export const OFFLINE_STILL_WORKS = offlineStillWorks();

/** The original's iOS/iPadOS sniff, including the iPadOS-13+ desktop-UA case. */
export function isIosDevice(env: BrowserEnvironment): boolean {
  return (
    /iPad|iPhone|iPod/.test(env.userAgent) ||
    (env.platform === 'MacIntel' && env.maxTouchPoints > 1 && !env.hasWebUsb)
  );
}

export function detectSupport(env: BrowserEnvironment): SupportStatus {
  if (isIosDevice(env) && !env.hasWebUsb) {
    return {
      kind: 'ios',
      tone: 'warn',
      canUseUsb: false,
      offlineDecryptWorks: true,
      paragraphs: [t('app:support.ios.title'), t('app:support.ios.body'), offlineStillWorks()],
    };
  }

  if (!env.hasWebUsb) {
    return {
      kind: 'no-webusb',
      tone: 'warn',
      canUseUsb: false,
      offlineDecryptWorks: true,
      paragraphs: [
        t('app:support.noWebUsb.title'),
        t('app:support.noWebUsb.body'),
        ...(env.isSecureContext ? [] : [t('app:support.noWebUsb.insecure')]),
        offlineStillWorks(),
      ],
    };
  }

  if (!env.isSecureContext) {
    return {
      kind: 'insecure',
      tone: 'warn',
      canUseUsb: false,
      offlineDecryptWorks: true,
      paragraphs: [
        t('app:support.insecure.title'),
        t('app:support.insecure.body'),
        offlineStillWorks(),
      ],
    };
  }

  return {
    kind: 'ready',
    tone: 'ok',
    canUseUsb: true,
    offlineDecryptWorks: true,
    paragraphs: [
      t('app:support.ready', { connect: t('app:connect.connect') }),
      ...(env.protocol === 'file:' ? [t('app:support.fileProtocol')] : []),
    ],
  };
}

/** Reads the live environment. Split out so `detectSupport` stays pure. */
export function readBrowserEnvironment(): BrowserEnvironment {
  const nav: Navigator | undefined = typeof navigator === 'undefined' ? undefined : navigator;
  return {
    hasWebUsb: getWebUsb() !== null,
    userAgent: nav?.userAgent ?? '',
    /* eslint-disable-next-line @typescript-eslint/no-deprecated --
       the iPadOS-13+ "desktop Safari" sniff has no non-deprecated equivalent,
       and it is the only way to tell an iPad from a Mac without WebUSB. */
    platform: nav?.platform ?? '',
    maxTouchPoints: nav?.maxTouchPoints ?? 0,
    isSecureContext: typeof isSecureContext === 'undefined' ? false : isSecureContext,
    protocol: typeof location === 'undefined' ? '' : location.protocol,
  };
}
