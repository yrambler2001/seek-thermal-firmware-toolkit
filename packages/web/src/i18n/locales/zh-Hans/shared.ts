/**
 * Namespace `shared`, 简体中文 (zh-Hans), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': '{label}进度',
  'runPanel.logLabel': '{label}日志',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': { other: '… 已省略前面的 {count} 行' },
  'runPanel.lineCount': { other: '{count} 行' },

  /* Status lines several panels set. */
  'status.idle': '空闲。',
  'status.cancelled': '已取消。',
  'status.cancelling': '正在取消…',
  'status.failedSeeLog': '失败——请查看上方的日志。',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere': '相机正在另一个标签页或窗口中使用——请先在那里完成操作或将其关闭。',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'zip 文件会在发送任何内容之前自动下载。',

  /* useDevice: the connection line when no camera is held. */
  'device.none': '未选择设备。',
  'device.disconnected': '设备已断开。',
  'device.revoked': '权限已被撤销。',
  'device.unknownProduct': '未知产品',
  'device.unknownVendor': '未知厂商',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    '在 Linux 上，相机需要一条 udev 规则，浏览器才能打开它：\n\n{rule}\n\n然后拔下相机再重新插上。Snap 和 Flatpak 版的 Chromium 常被沙盒隔离，无法访问原始 USB 设备；.deb 或 .rpm 版才可靠。',
  'hint.windows':
    'Windows 需要先为相机绑定 WinUSB 驱动，浏览器才能访问它。使用 Zadig（https://zadig.akeo.ie/）：Options → List All Devices，选择以你的相机命名的条目——例如“CompactPRO FF”——选择 WinUSB，然后点击 Replace Driver。',
  'hint.holding':
    '另一个程序或系统驱动正在占用相机——同一时间只能有一个进程占用 USB 接口。请退出其他与它通信的程序，然后拔下相机再重新插上。',
  'hint.recipientFallback': '或者在读取选项中把 recipient 设为“device”，这样不需要占用接口。',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid': '打开“选项”，查看各字段下方关于取值范围的说明。',
  'hint.usbTimeout':
    '相机接受了请求，但一直没有应答。请拔下相机再重新插上，然后改用更小的 chunk 再试（64 是在所有设备上都可用的值）。',
  'hint.usbStalled':
    '相机拒绝了该请求。这通常表示它的固件不支持该请求。本页在读取任何内容之前都会先询问相机属于哪个固件系列，所以一再被拒绝的请求，正是按相机自己报告的系列发出的。请在“信息”标签页上查看固件版本。',
  'hint.usbNotOpen':
    '另一个程序或系统驱动正在占用相机。请关闭它，或者在读取选项中把 recipient 设为“device”，这样不需要占用接口。',
  'hint.usbTransferFailed': '拔下相机再重新插上，然后重试。',
  'hint.deviceMode': '相机无法退出成像模式。请拔下相机，等它完全断电，再重新插上。',
  'hint.deviceWindow':
    '该固件系列使用的选择器映射与相机不符。请在 4.x/Nano 标签页上打开“选项”，运行“导出全部选择器”，查看相机实际开放了哪些内容。',
  'hint.deviceVersionUnknown':
    '没有发送任何可能改变相机的命令。请拔下相机，再重新插上，等它完成启动后重试；能报告固件版本的相机会被正常读取。',
  'hint.imageMalformed': '该文件不是解密后的 Seek 固件镜像。',
  'hint.imageUnsupported': '这个镜像无法按原样打包给相机。',
  'hint.imageKeyTable':
    '该镜像中没有其文件名所声称的密钥对。请原样使用导出时写出的解密文件，包括文件名。',
  'hint.flashRefused': '没有向相机写入任何内容。',
  'hint.familyUnsupported':
    '没有读取或写入任何内容。每个标签页适用于一段固件版本：0.x 和 1.x 相机请使用“导出并解密 0.x/1.x”，4.x 和 Nano 相机请使用“导出并解密 4.x/Nano”。“信息”标签页会告诉你相机该用哪个标签页。',
  'hint.firmwareTooOld':
    '在这里，没有任何固件系列能读取这个版本：它的固件不处理此标签页读取闪存所用的命令，因此没有向它发送任何可能被误读的命令。运行 0.7.0.7 或 0.7.0.8 的 Compact 可以在“导出并解密 0.x/1.x”中读取。用 SPI 编程器或通过 SWD/J-Link 读出的闪存镜像，仍可在本页的“解密文件/槽位”中解密。',
  'hint.powerCycle':
    '在本向导中：拔下相机再重新插上，按“连接设备”并选择它，然后重新开始同一步骤。本次运行仍保留在页面中——无需从运行文件继续。',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': '正在运行的固件',
  'deviceInfo.version': '版本',
  'deviceInfo.family': '固件系列',
  'deviceInfo.build': '构建',
  'deviceInfo.bootloader': '引导程序',
  'deviceInfo.platform': '平台',
  'deviceInfo.serial': '序列号',
  'deviceInfo.usbLink': 'USB 连接',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': '启动配置',
  'deviceInfo.bootedFrom': '本次启动自',
  'deviceInfo.nextStart': '下次启动',
  'deviceInfo.upgradeTarget': '升级目标（相机自身的升级）',
  'deviceInfo.bankAt': '{bank}，地址 {address}',
  'deviceInfo.perDeviceKey': '设备专属密钥',
  'deviceInfo.notProgrammed': '未烧录——相机会退而使用密钥 B',
  'deviceInfo.keysTitle': '从这台相机读取的密钥',
  'deviceInfo.foundAt': '所在位置',
  'deviceInfo.flashOffset': '闪存偏移 {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': '密钥 A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': '密钥 B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    other:
      '**{banks} 中存有有效的固件镜像，但它是用这台相机的引导程序不认识的密钥加密的。**镜像完好，校验和也正确，但引导程序检查槽位时只尝试 {storeKey} 和密钥 A，所以会将其跳过，转而启动其他内容。',
  },
  'deviceInfo.orphanIsTarget':
    '这正是升级时写入的槽位。这台相机上运行的应用程序会用那个未知密钥重新加密，所以**通过本页写入只会再产生一个引导程序无法启动的槽位**——相机会继续运行{bank}。用 SPI 编程器或通过 SWD/J-Link 直接写入该槽位，可以绕过这个问题。',
  'deviceInfo.otherBank': '另一个槽位',
} satisfies Translation<'shared'>;
