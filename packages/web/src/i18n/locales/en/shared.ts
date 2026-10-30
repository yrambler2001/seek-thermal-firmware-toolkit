/**
 * Namespace `shared`, English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': '{label} progress',
  'runPanel.logLabel': '{label} log',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} earlier line trimmed',
    other: '… {count} earlier lines trimmed',
  },
  'runPanel.lineCount': { one: '{count} line', other: '{count} lines' },

  /* Status lines several panels set. */
  'status.idle': 'Idle.',
  'status.cancelled': 'Cancelled.',
  'status.cancelling': 'Cancelling …',
  'status.failedSeeLog': 'Failed — see the log above.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'The camera is in use in another tab or window — finish or close it there first.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote':
    'The zip is downloaded automatically, before anything is sent. A browser gives no word when a download reaches the disk, so check your downloads folder for it before you rely on it.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'No device selected.',
  'device.disconnected': 'Device disconnected.',
  'device.revoked': 'Permission revoked.',
  'device.unknownProduct': 'unknown product',
  'device.unknownVendor': 'unknown vendor',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'On Linux the camera needs a udev rule before the browser can open it:\n\n{rule}\n\nThen unplug and replug the camera. Snap and Flatpak Chromium builds are often sandboxed away from raw USB devices; the .deb or .rpm build is the reliable one.',
  'hint.windows':
    'Windows needs the WinUSB driver bound to the camera before any browser can reach it. Use Zadig (https://zadig.akeo.ie/): Options → List All Devices, pick the entry named after your camera — for example "CompactPRO FF" — choose WinUSB, and click Replace Driver.',
  'hint.holding':
    'Another program or a system driver is holding the camera — only one process can hold the USB interface at a time. Quit anything else that talks to it, then unplug and replug the camera.',
  'hint.recipientFallback':
    'Or set recipient to "device" in the read options, which does not need the interface claimed.',
  'hint.optionsInvalid': 'Open "Read options" and check the note under the fields for each range.',
  'hint.usbTimeout':
    'The camera accepted the request and never answered. Unplug and replug it, then try a smaller chunk (64 is the value that works everywhere).',
  'hint.usbStalled':
    'The camera rejected the request. This usually means the firmware does not implement it — the camera is asked which family it is before anything is read, so a family that keeps refusing is the one the camera answers with — check the firmware version on the Info tab.',
  'hint.usbNotOpen':
    'Another program or a system driver is holding the camera. Close it, or set recipient to "device" in the read options, which does not need the interface claimed.',
  'hint.usbTransferFailed': 'Unplug and replug the camera, then try again.',
  'hint.deviceMode':
    'The camera would not leave imaging mode. Unplug it, wait for it to power down fully, and plug it back in.',
  'hint.deviceWindow':
    'The selector map this family uses did not match the camera. On the 4.x/Nano tab, open Options and run "Dump all selectors" to see what the camera actually exposes.',
  'hint.deviceVersionUnknown':
    'Nothing that could change the camera was sent. Unplug it, let it finish starting up, plug it back in and try again; a camera that reports its firmware version is read normally.',
  'hint.imageMalformed': 'The file is not a decrypted Seek firmware image.',
  'hint.imageUnsupported': 'This image cannot be packaged for the camera as it is.',
  'hint.imageKeyTable':
    'The image does not carry the key pair its filename claims. Use the decrypted file exactly as the dump wrote it, name and all.',
  'hint.flashRefused': 'Nothing was written to the camera.',
  'hint.familyUnsupported':
    'Nothing was read or written. Each tab covers a range of firmware versions: 0.x and 1.x cameras go to "Dump & decrypt 0.x/1.x 2014/2016", 4.x and Nano cameras to "Dump & decrypt 4.x/Nano". The Info tab says which tab the camera goes to.',
  'hint.firmwareTooOld':
    'No firmware family can read this build here: its firmware has no read handler for the command this tab reads flash with, so nothing that could be misread was sent to it. A Compact on 0.7.0.7 or 0.7.0.8 can be read on "Dump & decrypt 0.x/1.x 2014/2016". A dump taken with an SPI programmer or over SWD/J-Link can still be decrypted on this page, under "Decrypt File/Slot".',
  'hint.powerCycle':
    'In this wizard: unplug the camera and plug it back in, press "Connect device" and pick it, then start the same step again. The run is still loaded here — there is nothing to resume.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Running firmware',
  'deviceInfo.version': 'Version',
  'deviceInfo.family': 'Firmware family',
  'deviceInfo.build': 'Build',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platform',
  'deviceInfo.serial': 'Serial',
  'deviceInfo.usbLink': 'USB link',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Boot config',
  'deviceInfo.bootedFrom': 'Booted from',
  'deviceInfo.nextStart': 'Next start',
  'deviceInfo.upgradeTarget': 'Upgrade target (its own upgrade)',
  'deviceInfo.bankAt': '{bank} at {address}',
  'deviceInfo.perDeviceKey': 'Per-device key',
  'deviceInfo.notProgrammed': 'not programmed — the camera falls back to Key B',
  'deviceInfo.keysTitle': 'Keys read from this camera',
  'deviceInfo.foundAt': 'Found at',
  'deviceInfo.flashOffset': 'flash offset {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Key A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Key B',
  'deviceInfo.keysConfirmed':
    "Confirmed by matching a slot's keystream state, recovered from the ciphertext itself. An upload is built so each bank stores it under the bootloader's store key ({storeKey}), or under the booted bank's own key where the application's store key is not that one.",
  'deviceInfo.keysDecrypted':
    'Each slot was decrypted in the browser by solving for its keystream from its own known-zero reset vectors. Decrypting is not the same as booting: the bootloader only ever tries {storeKey} and Key A, so a slot written under any other key checksums perfectly and is still skipped. Nothing was written.',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: "**{banks} holds a valid firmware image encrypted with a key this camera's bootloader does not know.** The image is intact and its checksum is correct, but the bootloader only tries {storeKey} and Key A when it checks a bank, so it skips it and boots something else.",
    other:
      "**{banks} hold a valid firmware image encrypted with a key this camera's bootloader does not know.** The image is intact and its checksum is correct, but the bootloader only tries {storeKey} and Key A when it checks a bank, so it skips them and boots something else.",
  },
  'deviceInfo.orphanIsTarget':
    'That is the slot an upgrade writes. The application running on this camera re-encrypts with that unknown key, so **flashing through this page will produce another slot the bootloader cannot boot** — the camera will carry on running {bank}. Writing the slot directly with an SPI programmer or over SWD/J-Link is the way round it.',
  'deviceInfo.otherBank': 'the other bank',
} as const satisfies NamespaceMessages;
