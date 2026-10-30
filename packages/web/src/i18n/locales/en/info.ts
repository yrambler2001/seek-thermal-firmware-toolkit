/**
 * Namespace `info`, English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Not read yet.',
  'status.reading': 'Reading ...',
  'status.noVersion': 'No version reported.',
  'status.tooOld': 'Read. Firmware {version} is older than 0.8.0.0 — nothing else was read.',
  'status.read': 'Read. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Read the camera',
  'read.description':
    'Read-only. Asks the camera what it runs, how it boots, which keys it holds and what each bank holds: the same read as seek-fw info. Nothing is written.',
  'read.actions': 'Info actions',
  'read.button': 'Read firmware version',
  'read.connectFirst': 'Connect the camera above first, then press Read firmware version.',
  'read.showDetails': 'Show details in the log',
  'read.panel': 'Firmware version',
  'result.title': 'What the camera reports',
  'result.version': 'Firmware version',
  'result.build': 'Build',
  'result.range': 'Version range',
  'result.tab': 'Tab for this camera',
  'result.rangeLegacy': '0.x / 1.x: the 2014 and 2016 cameras',
  'result.rangeModern': '2.x and newer: the 4.x, Nano and Mosaic cameras',
  'result.rangeUnknown': 'unknown',
  'result.noVersion':
    '**The camera did not report its firmware version.** Nothing else was sent. Unplug it, let it finish starting up, plug it back in and read again.',
  'result.noTab': 'No tab reads this build.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Open <tab>{tab}</tab> for this camera. That tab asks the camera which family it is again before it reads anything, and refuses a camera that is not the family it covers.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'What each tab is for',
  'tabs.intro':
    'Five tabs, in this order. Each one is a page of its own, and the header shows which one you are on.',
  'tabs.caption': 'The tabs, what they do, the cameras they cover and whether they write',
  'tabs.tab': 'Tab',
  'tabs.does': 'What it does',
  'tabs.cameras': 'Cameras',
  'tabs.writes': 'Writes to the camera?',
  'tabs.info.does':
    'Reads what the camera reports: its firmware, the family it answers as, how it boots, its keys and every bank. The same read as seek-fw info. It writes nothing.',
  'tabs.info.cameras': 'Any Seek camera that WebUSB can open.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'No.',
  'tabs.preserve.does':
    'Makes a complete copy of the camera’s 4 MiB flash, with a run file saved after every step, and can put a patched firmware back in place. It walks through the steps one at a time.',
  'tabs.preserve.cameras':
    'Cameras on 0.x and 1.x firmware: the 2014 Compact builds, the 2016 Compact PRO builds (1.0.3.x), and the 1.3.0.8 FF (16 Hz) Compact build.',
  'tabs.preserve.writes':
    'Yes, in two steps, and each asks first. It puts the camera back as it was.',
  'tabs.v4.does':
    'Reads the whole flash of a 4.x or Nano camera and decrypts the firmware slots it finds. Read-only: it sends six read commands and no write.',
  'tabs.v4.cameras':
    'Cameras on 4.x firmware (Compact, Compact PRO, Compact XR), Mosaic (10.x and 2.x) and Nano (42.x and 44.x), from 2018 on.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'No.',
  'tabs.decrypt.does':
    'Decrypts a file you already have: a whole dump, slot by slot, or one 64 KiB firmware slot on its own. The result can be downloaded.',
  'tabs.decrypt.cameras':
    'None. It uses no camera, so it works with nothing plugged in and in any browser.',
  'tabs.decrypt.writes': 'No. It only writes the download.',
  'tabs.slots.does':
    'Reads the three firmware banks (slot A, slot B and recovery R), shows what each holds and which one the camera boots, and can dump or write one bank at a time.',
  'tabs.slots.cameras': 'Cameras on 0.8.0.0 and newer firmware.',
  'tabs.slots.writes': 'Yes, one bank at a time, and each write asks first.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Where the 2016 and 1.3.0.8 FF builds are',
  'split.where':
    'The 2016 Compact PRO builds (1.0.3.0 and 1.0.3.2, including their FF variants) and the 1.3.0.8 FF (16 Hz) Compact build are **not** 4.x cameras, and they are not read like one. Their protocol is the locked 2014–2017 one, and their firmware stores the slots under a different cipher (2016) or as the 2014 plaintext chain with a recovery-only route (FF). So they are on **Dump & decrypt 0.x/1.x 2014/2016**, and the 4.x/Nano tab refuses them before it reads anything.',
  'split.evidence':
    'The evidence that they work on the 0.x/1.x tab: the Preserve pipeline has a derived patch for each of them, and its emulator runs are green for both. The 1.0.3.0 build on its native 2016 dump went through backup, patch, commit, drain, restore and verify; the 1.3.0.8 FF went through its recovery route. On the bench camera, a Compact PRO 1.0.3.0, the Preserve step 02 read completed with no reset and no write, and the camera was identified as the 2016 cipher. On these builds the 4.x selector map is refused for 38 of its 63 selectors, so the 4.x tab could only return gaps for them.',
  'split.stay':
    'So they stay on the 0.x/1.x tab, and the 4.x/Nano tab has no family selector that would send them there.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Camera',
  'report.product': 'Product',
  'report.manufacturer': 'Manufacturer',
  'report.serial': 'Serial',
  'report.platform': 'Platform',
  'report.usbLink': 'USB link',
  'report.noProduct': '(no product string)',
  'report.none': '(none)',
  'report.unreadable': '(unreadable)',
  'report.firmware': 'Firmware',
  'report.running': 'Running',
  'report.bootloader': 'Bootloader',
  'report.family': 'Firmware family',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Read under',
  'report.detected': 'Detected',
  'report.boot': 'Boot',
  'report.booted': 'Booted',
  'report.lastStart': 'Last start',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Running (1.3.0.8)',
  'report.nextStart': 'Next start',
  'report.upgradeTarget': 'Upgrade target',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(not replayed)',
  'report.targetConfirmed': '{slot} (confirmed on the wire)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'not known: {why}. A 16 Hz FF image needs the camera to say which build it runs (the slots tab asks)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'the 16 Hz FF 1.3.0.8 build',
  'report.build8Hz': 'the 8 Hz 1.3.0.8 build',
  'report.keys': 'Keys',
  'report.slots': 'Slots',
  'report.slotsCaption': 'Each bank as the read found it. Read-only: the Slots tab writes.',
  'report.slot': 'Slot',
  'report.address': 'Address',
  'report.version': 'Version',
  'report.size': 'Size',
  'report.key': 'Key',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Accepts',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Footer',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Bootable',
  'report.bytes': '{count} B',
  'report.plaintext': 'none (plaintext)',
  /** A table value, lower case: "yes". */
  'report.yes': 'yes',
  /** A table value, lower case: "no". */
  'report.no': 'no',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/a',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Writing',
  'report.noBankWritten': 'No bank of this camera is written:',
  /* {staged} is core's phrase for how a bank is written. */
  'report.oneBank':
    'One bank at a time: the Slots tab writes or patches one bank of this camera, each bank {staged}, and each write asks first.',
  'report.refusesEvery': 'The Slots tab refuses every bank of this camera:',
} as const satisfies NamespaceMessages;
