/**
 * The guard against a redesign quietly dropping a warning.
 *
 * Everything in this file is prose someone wrote after bricking a camera, or
 * after working out why one would not boot. A redesign may move it, restyle
 * it, fold it into a disclosure or split it across cards — it may not reword
 * it, shorten it or lose it. Each string below is asserted against the text
 * the browser would actually show.
 */

import { describe, expect, it } from 'vitest';
import { App } from './App';
import { RunPanel } from './components/RunPanel';
import { SupportBanner } from './components/SupportBanner';
import { plainText } from './lib/rich-text';
import { detectSupport, type BrowserEnvironment } from './lib/support';
import { render } from './test-helpers';

/** Line wrapping is a layout decision; the words are not. */
function normalize(text: string): string {
  /* `\s` already covers U+00A0, so a non-breaking space in the markup and a
   * plain one in the expectation compare equal. */
  return text.replace(/\s+/g, ' ').trim();
}

function viewText(hash: string): { readonly text: string; readonly unmount: () => void } {
  window.location.hash = hash;
  const { container, unmount } = render(
    <App
      support={detectSupport({
        hasWebUsb: true,
        userAgent: 'Chrome',
        platform: 'MacIntel',
        maxTouchPoints: 0,
        isSecureContext: true,
        protocol: 'https:',
      })}
    />,
  );
  return { text: normalize(container.textContent), unmount };
}

function expectAll(text: string, phrases: readonly string[]): void {
  for (const phrase of phrases) {
    expect(text, `missing safety copy: ${phrase}`).toContain(normalize(phrase));
  }
}

/* ---- the 4.x/Nano tab ------------------------------------------------- */

const DUMP_COPY: readonly string[] = [
  /* the read-only promise */
  'Read-only: this tab issues no flash write, erase, upload, commit, or reset command.',
  'A camera on another firmware line is refused before anything is read.',
  'This page can issue exactly six vendor commands. That is its entire vocabulary — there is no code path to anything else:',
  'Until the camera has reported its firmware version, only three of the six are sent, and only as reads: GetFirmwareInfo, GetOperationMode and GetErrorCode.',
  'USBDevice.reset() is never called either; the retry path just closes and reopens the handle.',

  /* detection, and the one check nothing skips */
  'A camera that does not report its version, or runs a build older than 0.8.0.0, is not read at all, and the page says why.',
  "Start dump reads every block the build's own selector table reaches.",

  /* decryption is best-effort, and says so */
  'Decryption is still best-effort.',

  /* the 0x14060000 gap */
  'The USB command set exposes a read-window selector for every 64 KiB block of the 4 MiB flash except 0x14060000..0x1406ffff.',
  'In practice this costs you nothing.',
  'That redundancy is also why a camera whose 0x14060000 reads back as 0xff is fine: the bootable firmware still exists in the other slots.',
  'If you do want a strictly complete byte-for-byte image — to diff flash against a reference, say — read it over SWD/J-Link or with an SPI programmer.',

  /* the read-only opcode table, every row */
  'GetFirmwareInfo',
  "the running firmware version, read first: it decides which build's selector table the dump uses, and a camera that does not report one is not read",
  'GetErrorCode',
  'check status after each step',
  'SetOperationMode',
  'only to select mode 0, and only if not already there',
  'GetOperationMode',
  'read the current mode',
  'GetFeaturedFirmwareData',
  'the actual flash read',
  'BeginFirmwareUpgrade',
  'volatile read-window selector only — it selects which 64 KiB block the next reads return, and writes nothing',
];

/* ---- the firmware slots tab ------------------------------------------ */

const SLOTS_COPY: readonly string[] = [
  /* the warning that matters most */
  "This page can write to the camera's flash. A write erases one 64 KiB bank and programs it. An image that is structurally valid but does not run leaves the camera unbootable, and the bootloader has no USB — only SWD/J-Link or an SPI programmer can recover it. Dump the bank first and keep the file.",
  'Read slots and Dump change nothing in the camera.',
  'The bootloader at 0x14000000 and the boot config are never written here, and there is no control for choosing the active bank.',
  'The bank takes effect only after the camera is unplugged and replugged.',
];

/* ---- shown in both ---------------------------------------------------- */

const PLATFORM_COPY: readonly string[] = [
  'Works out of the box in Chrome, Edge or any Chromium browser. No driver install, no admin rights.',
  'SUBSYSTEM=="usb", ATTR{idVendor}=="289d", MODE="0666", TAG+="uaccess"',
  'sudo udevadm control --reload-rules && sudo udevadm trigger',
  'Snap and Flatpak Chromium builds are often sandboxed away from raw USB devices;',
  'Windows needs the WinUSB driver bound to the camera before any browser can reach it.',
  'Options → List All Devices',
  'choose WinUSB as the driver, and click Replace Driver.',
  'If your camera appears more than once, take the entry labelled (Interface 0).',
  'Works in Chrome for Android with a USB-OTG cable, provided the phone can supply bus power to the camera.',
  'Cannot read a camera, and this will not change. Safari does not implement WebUSB, and on iOS and iPadOS every browser — including Chrome and Firefox — is required to render with WebKit, so none of them expose the API.',
  'The optional decryptor does work here: decrypting a dump you already have needs no USB access,',
];

describe('safety copy is carried verbatim', () => {
  it('the 4.x/Nano tab keeps every read-only promise and caveat', () => {
    const { text, unmount } = viewText('#/v4');
    expectAll(text, DUMP_COPY);
    expectAll(text, PLATFORM_COPY);
    unmount();
  });

  it('never calls the unlock token build-specific, on either view', () => {
    /* It was false: firmware-facts.test.ts finds the same 16 bytes, exactly
     * once each, in all 22 images from 2014-2017, and in none of the 14 later
     * ones. A caveat that says otherwise tells the user a camera might need a
     * token this page does not have. */
    for (const hash of ['#/', '#/v4', '#/slots']) {
      const { text, unmount } = viewText(hash);
      expect(text.toLowerCase(), hash).not.toMatch(/build[- ]specific|per[- ]build token/);
      expect(text, hash).not.toContain('recovered from a Compact PRO (PIR324) unit');
      unmount();
    }
  });

  it('the firmware slots tab keeps its write warning and its explainers', () => {
    const { text, unmount } = viewText('#/slots');
    expectAll(text, SLOTS_COPY);
    unmount();
  });

  it('renders every paragraph of all four browser-support banners', () => {
    const ENVIRONMENTS: readonly (readonly [string, BrowserEnvironment])[] = [
      [
        'ready',
        {
          hasWebUsb: true,
          userAgent: 'Chrome',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
          isSecureContext: true,
          protocol: 'https:',
        },
      ],
      [
        'ios',
        {
          hasWebUsb: false,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          platform: 'iPhone',
          maxTouchPoints: 5,
          isSecureContext: true,
          protocol: 'https:',
        },
      ],
      [
        'no-webusb',
        {
          hasWebUsb: false,
          userAgent: 'Firefox',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
          isSecureContext: true,
          protocol: 'https:',
        },
      ],
      [
        'insecure',
        {
          hasWebUsb: true,
          userAgent: 'Chrome',
          platform: 'Linux x86_64',
          maxTouchPoints: 0,
          isSecureContext: false,
          protocol: 'http:',
        },
      ],
    ];

    for (const [name, environment] of ENVIRONMENTS) {
      const status = detectSupport(environment);
      expect(status.kind, name).toBe(name);
      const { container, unmount } = render(<SupportBanner status={status} />);
      const text = normalize(container.textContent);
      for (const paragraph of status.paragraphs) {
        expect(text, `${name}: ${paragraph}`).toContain(normalize(plainText(paragraph)));
      }
      unmount();
    }
  });

  it('spot-checks the exact words of each support banner', () => {
    const literal: readonly string[] = [
      'Ready. Plug in your Seek camera and press Connect device.',
      "WebUSB is not available on iOS or iPadOS, so this device cannot read a camera's flash.",
      'This browser cannot access USB devices.',
      'WebUSB is available in Chrome, Edge, Opera and other Chromium browsers on Windows, macOS, Linux and Android. Firefox and Safari have both declined to implement it.',
      'Insecure connection. WebUSB is disabled here.',
      'Open this page over HTTPS or from http://localhost.',
      'You can still use the Decrypt File/Slot tab — that runs entirely on a file you pick and needs no USB access.',
    ];
    const seen: string[] = [];
    for (const environment of [
      {
        hasWebUsb: true,
        userAgent: 'Chrome',
        platform: 'Linux',
        maxTouchPoints: 0,
        isSecureContext: true,
        protocol: 'https:',
      },
      {
        hasWebUsb: false,
        userAgent: 'iPhone',
        platform: 'iPhone',
        maxTouchPoints: 5,
        isSecureContext: true,
        protocol: 'https:',
      },
      {
        hasWebUsb: false,
        userAgent: 'Firefox',
        platform: 'Linux',
        maxTouchPoints: 0,
        isSecureContext: true,
        protocol: 'https:',
      },
      {
        hasWebUsb: true,
        userAgent: 'Chrome',
        platform: 'Linux',
        maxTouchPoints: 0,
        isSecureContext: false,
        protocol: 'http:',
      },
    ] satisfies readonly BrowserEnvironment[]) {
      const { container, unmount } = render(<SupportBanner status={detectSupport(environment)} />);
      seen.push(normalize(container.textContent));
      unmount();
    }
    const all = seen.join(' || ');
    expectAll(all, literal);
  });

  it('prints what the camera said after a write, unaltered', () => {
    /* These two lines are produced by the flash workflow, not by the view.
     * What is pinned here is that the transcript renders them character for
     * character — no truncation, no ellipsis, no reflow. */
    const unplug = 'NOW UNPLUG AND REPLUG THE CAMERA.';
    const proven =
      'Proven so far: the payload streamed, the camera accepted its checksum, and the ' +
      'commit returned no error. NOT proven: that the bootloader will select this slot, ' +
      'or that the image runs. The bank switch only takes effect on a real power cycle, ' +
      'so replug and press "Read slots" — the running version it reports is the ' +
      'only thing that settles it.';

    const { container, unmount } = render(
      <RunPanel
        id="slotsrun"
        label="Slots"
        tone="danger"
        progress={{ done: 1, total: 1, text: 'Written.' }}
        lines={[
          { seq: 1, level: 'warn', text: unplug },
          { seq: 2, level: 'detail', text: proven },
        ]}
        trimmed={0}
      />,
    );
    const log = container.querySelector('[role="log"]');
    expect(log?.textContent).toContain(unplug);
    expect(log?.textContent).toContain(proven);
    unmount();
  });
});
