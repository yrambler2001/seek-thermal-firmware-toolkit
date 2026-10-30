/**
 * Namespace `app`, 简体中文 (zh-Hans), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Seek Thermal 固件工具箱',
  'header.cameraSelected': '已选择相机',
  'header.noCamera': '未选择相机',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB 不可用',
  'header.github': 'GitHub 上的本工具箱',
  'header.tabs': '标签页',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': '信息',
  'tab.preserve': '导出并解密 0.x/1.x 2014/2016',
  'tab.v4': '导出并解密 4.x/Nano',
  'tab.decrypt': '解密文件/槽位',
  'tab.slots': '固件槽位操作',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal 固件 — {tab}（WebUSB）',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': '深色主题',
  'theme.followsSystem': '跟随系统的浅色或深色设置',
  'theme.chosenDiffers': '已在此处选择。切换回来即可跟随系统设置。',
  'theme.chosenSame': '已在此处选择，与系统当前的设置相同',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': '语言',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    '像 `seek-fw info` 一样读取已连接的相机：它的固件、它的应答所对应的固件系列、启动方式、密钥以及每个槽位。它会告诉你哪个标签页适用于这台相机，并用通俗的话说明每个标签页的用途。**此标签页不会向闪存写入任何内容。**',
  'intro.preserve':
    '适用于 **0.x 和 1.x** 相机（2014 年和 2016 年的版本）。为相机的 4 MB 闪存制作一份**完整**副本——包括普通导出读不到的部分——然后让相机完全恢复原样。它先备份能读取的内容，短暂地给固件打上补丁以便读取其余部分，导出全部内容，再还原原始固件并加以检查。一切都在你的浏览器本地运行。**其中两个步骤会写入闪存**，每一步执行前都会先征求你的确认。',
  'intro.v4':
    '通过 WebUSB 以只读方式复制 **4.x 或 Nano** 相机的 4 MB SPI 闪存，并解密其中找到的所有固件镜像。一切都在你的浏览器本地运行——不会上传到任何地方。**只读：**此标签页不会发出任何闪存写入、擦除、上传、提交或重置命令。其他固件线的相机会在读取任何内容之前被拒绝。',
  'intro.decrypt':
    '在这台电脑上解密你已有的固件：一份完整的闪存镜像，或单个 64 KB 固件槽位。**不使用相机**，因此不连接任何设备也能使用，在没有 USB 访问权限的浏览器中也能使用。文件只在本地读取，绝不上传。',
  'intro.slots':
    '读取相机的三个固件槽位——槽位 A、槽位 B 和恢复槽位 R——显示每个槽位存放的内容、相机从哪个槽位启动，以及此版本能对它做什么，旁边列出设备正在运行的固件和密钥。一切都在你的浏览器本地运行。**此标签页会写入闪存：**它可以用解密后的镜像或原始字节写入一个槽位，并在每次写入前征求确认。',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title': '**iOS 和 iPadOS 上没有 WebUSB，**因此这台设备无法读取相机的闪存。',
  'support.ios.body':
    'Safari 没有实现它，而 iOS 上的所有浏览器都必须使用 WebKit，所以这里的 Chrome 和 Firefox 也无法提供它。没有任何开关或扩展能改变这一点。要导出相机，请使用台式电脑，或带 USB-OTG 线的 Android 手机。',
  'support.noWebUsb.title': '**此浏览器无法访问 USB 设备。**',
  'support.noWebUsb.body':
    'WebUSB 可在 Windows、macOS、Linux 和 Android 上的 Chrome、Edge、Opera 及其他 Chromium 浏览器中使用。Firefox 和 Safari 都已拒绝实现它。',
  'support.noWebUsb.insecure': '此页面也不是通过安全连接提供的，仅这一点就会阻止 WebUSB。',
  'support.insecure.title': '**连接不安全。**此处已禁用 WebUSB。',
  'support.insecure.body':
    '请通过 HTTPS 或从 `http://localhost` 打开此页面。像 `http://192.168.1.10:8000` 这样的普通局域网地址不符合要求。',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    '你仍然可以使用 **{tab}** 标签页——它完全基于你选择的文件运行，不需要 USB 访问。',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**准备就绪。**插上你的 Seek 相机，然后按 *{connect}*。',
  'support.fileProtocol':
    '此页面是作为本地文件打开的，因此浏览器在重新加载后不会记住设备。这没有影响。',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: '注意：{note}。',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': '连接',
  'connect.actions': '设备操作',
  'connect.connect': '连接设备',
  'connect.change': '更换设备',
  'connect.test': '测试连接',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': '忘记设备',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    '会列出所有 Seek Thermal 设备（USB 厂商 `{vendor}`）——Compact、Compact PRO、Nano 等。请在浏览器的设备选择框中选择你的相机。',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': '平台说明',
  'platform.macos':
    '在 Chrome、Edge 或任何 Chromium 浏览器中开箱即用。无需安装驱动，无需管理员权限。请先退出任何正在与相机通信的其他程序——同一时间只能有一个进程占用 USB 接口。',
  'platform.linux.access': '给你的用户授予访问该设备的权限，然后拔下设备再重新插上：',
  'platform.linux.sandbox':
    'Snap 和 Flatpak 版的 Chromium 常被沙盒隔离，无法访问原始 USB 设备；`.deb` 或 `.rpm` 版才可靠。',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows 需要先为相机绑定 WinUSB 驱动，浏览器才能访问它。使用 <zadig>Zadig</zadig>：*Options → List All Devices*，然后在下拉列表中选择以你的相机命名的条目——例如 `CompactPRO FF`——驱动选择 **WinUSB**，再点击 Replace Driver。如果你的相机出现不止一次，请选择标有 *(Interface 0)* 的条目。这样做之后，厂商软件将无法使用该设备，直到你在设备管理器中撤销（*卸载设备 → 删除驱动程序*，然后重新插上）。',
  'platform.android':
    '在 Android 版 Chrome 中配合 USB-OTG 线使用，前提是手机能为相机提供总线供电。Android 会通过它自己的权限对话框授予 USB 访问权限。下载的文件会像其他文件一样保存到“下载”文件夹。',
  'platform.ios.name': 'iPhone 和 iPad',
  'platform.ios.cannot':
    '**无法读取相机**，而且这一点不会改变。Safari 没有实现 WebUSB，而在 iOS 和 iPadOS 上，所有浏览器——包括 Chrome 和 Firefox——都必须使用 WebKit 渲染，因此它们都不提供这个接口。没有任何开关、扩展或应用可以绕过这一点。请使用台式电脑或 Android 手机进行导出。',
  'platform.ios.decrypt':
    '可选的解密功能在这里可以使用：解密你已有的镜像文件不需要 USB 访问，所以你可以在 iPhone 或 iPad 上，或者在台式电脑的 Firefox 和 Safari 中进行。',
} satisfies Translation<'app'>;
