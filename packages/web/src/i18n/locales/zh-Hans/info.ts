/**
 * Namespace `info`, 简体中文 (zh-Hans), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': '尚未读取。',
  'status.reading': '正在读取…',
  'status.noVersion': '相机未报告版本。',
  'status.tooOld': '已读取。固件 {version} 早于 0.8.0.0——没有读取其他内容。',
  'status.read': '已读取。固件 {version}。',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': '读取相机',
  'read.description':
    '只读。询问相机运行什么固件、如何启动、持有哪些密钥、每个槽位存放了什么：与 seek-fw info 的读取相同。不会写入任何内容。',
  'read.actions': '信息操作',
  'read.button': '读取固件版本',
  'read.connectFirst': '请先在上方连接相机，然后按“读取固件版本”。',
  'read.showDetails': '在日志中显示详细信息',
  'read.panel': '固件版本',
  'result.title': '相机报告的内容',
  'result.version': '固件版本',
  'result.build': '构建',
  'result.range': '版本范围',
  'result.tab': '适用于这台相机的标签页',
  'result.rangeLegacy': '0.x / 1.x：2014 年和 2016 年的相机',
  'result.rangeModern': '2.x 及更新：4.x、Nano 和 Mosaic 相机',
  'result.rangeUnknown': '未知',
  'result.noVersion':
    '**相机没有报告固件版本。**没有发送其他任何内容。请拔下相机，再重新插上，等它完成启动后重新读取。',
  'result.noTab': '没有标签页能读取这个版本。',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    '请为这台相机打开<tab>{tab}</tab>标签页。该标签页在读取任何内容之前会再次询问相机属于哪个固件系列，并拒绝不属于其适用系列的相机。',

  /* views/InfoView: what each tab is for. */
  'tabs.title': '各标签页的用途',
  'tabs.intro':
    '共有五个标签页，按以下顺序排列。每个都是独立的页面，页头会显示你当前所在的标签页。',
  'tabs.caption': '各标签页的功能、适用的相机以及是否写入',
  'tabs.tab': '标签页',
  'tabs.does': '功能',
  'tabs.cameras': '相机',
  'tabs.writes': '是否写入相机？',
  'tabs.info.does':
    '读取相机报告的内容：它的固件、它的应答所对应的固件系列、启动方式、密钥以及每个槽位。与 seek-fw info 的读取相同。不写入任何内容。',
  'tabs.info.cameras': '任何 WebUSB 能打开的 Seek 相机。',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': '否。',
  'tabs.preserve.does':
    '为相机的 4 MB 闪存制作完整副本，每一步之后都保存一个运行文件，并能把打过补丁的固件还原回原样。它会一步一步地引导你完成。',
  'tabs.preserve.cameras':
    '运行 0.x 和 1.x 固件的相机：2014 年的 Compact 版本、2016 年的 Compact PRO 版本（1.0.3.x），以及 1.3.0.8 FF（16 Hz）Compact 版本。',
  'tabs.preserve.writes': '是，分两步，每一步都会先征求确认。它会让相机恢复原样。',
  'tabs.v4.does':
    '读取 4.x 或 Nano 相机的整片闪存，并解密找到的固件槽位。只读：它只发送六个读取命令，不发送任何写入命令。',
  'tabs.v4.cameras':
    '运行 4.x 固件的相机（Compact、Compact PRO、Compact XR）、Mosaic（10.x 和 2.x）以及 Nano（42.x 和 44.x），2018 年起。',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': '否。',
  'tabs.decrypt.does':
    '解密你已有的文件：完整的闪存镜像（逐个槽位解密），或单独一个 64 KB 固件槽位。结果可以下载。',
  'tabs.decrypt.cameras': '无。它不使用相机，因此不连接任何设备也能使用，在任何浏览器中都能使用。',
  'tabs.decrypt.writes': '否。它只写出下载的文件。',
  'tabs.slots.does':
    '读取三个固件槽位（槽位 A、槽位 B 和恢复槽位 R），显示每个槽位存放的内容以及相机从哪个槽位启动，并可以一次导出或写入一个槽位。',
  'tabs.slots.cameras': '运行 0.8.0.0 及更新固件的相机。',
  'tabs.slots.writes': '是，一次一个槽位，每次写入前都会先征求确认。',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': '2016 和 1.3.0.8 FF 版本在哪里',
  'split.where':
    '2016 年的 Compact PRO 版本（1.0.3.0 和 1.0.3.2，包括它们的 FF 变体）以及 1.3.0.8 FF（16 Hz）Compact 版本**不是** 4.x 相机，也不能按 4.x 相机的方式读取。它们使用的是 2014–2017 年那套加锁的协议；其固件存储槽位的方式，要么是另一种加密（2016），要么是 2014 年的明文链加上只能从恢复槽位启动的路径（FF）。因此它们归**导出并解密 0.x/1.x 2014/2016** 处理，4.x/Nano 标签页会在读取任何内容之前拒绝它们。',
  'split.evidence':
    '它们在 0.x/1.x 标签页上可用的证据：Preserve 流程为它们各自推导出了补丁，两者在模拟器中的运行都全部通过。1.0.3.0 版本在其原生的 2016 镜像上走完了备份、补丁、提交、全闪存读取、还原和验证；1.3.0.8 FF 走完了它的恢复槽位路径。在测试台的相机（一台 Compact PRO 1.0.3.0）上，Preserve 步骤 02 的读取已完成，期间没有重置、没有写入，相机被识别为 2016 加密。在这些版本上，4.x 选择器映射的 63 个选择器中有 38 个被拒绝，所以 4.x 标签页对它们只能返回空缺。',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    '所以它们留在 0.x/1.x 标签页；4.x/Nano 标签页也没有能把它们转过去读取的固件系列选择器。',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': '相机',
  'report.product': '产品',
  'report.manufacturer': '制造商',
  'report.serial': '序列号',
  'report.platform': '平台',
  'report.usbLink': 'USB 连接',
  'report.noProduct': '（无产品字符串）',
  'report.none': '（无）',
  'report.unreadable': '（无法读取）',
  'report.firmware': '固件',
  'report.running': '正在运行',
  'report.bootloader': '引导程序',
  'report.family': '固件系列',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': '读取所用系列',
  'report.detected': '检测结果',
  'report.boot': '启动',
  'report.booted': '本次启动',
  'report.lastStart': '上次启动',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': '正在运行（1.3.0.8）',
  'report.nextStart': '下次启动',
  'report.upgradeTarget': '升级目标',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '（未询问）',
  'report.targetConfirmed': '{slot}（已在通信中确认）',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    '未知：{why}。16 Hz FF 镜像需要相机说明它运行的是哪个版本（“固件槽位操作”标签页会询问）',
  'report.buildWhy': '{build}：{why}',
  'report.buildFf': '16 Hz FF 1.3.0.8 版本',
  'report.build8Hz': '8 Hz 1.3.0.8 版本',
  'report.keys': '密钥',
  'report.slots': '槽位',
  'report.slotsCaption': '读取时所见的每个槽位。只读：写入请使用“固件槽位操作”标签页。',
  'report.slot': '槽位',
  'report.address': '地址',
  'report.version': '版本',
  'report.size': '大小',
  'report.key': '密钥',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': '接受的密钥',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': '尾部校验',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': '可启动',
  'report.bytes': '{count} B',
  'report.plaintext': '无（明文）',
  /** A table value, lower case: "yes". */
  'report.yes': '是',
  /** A table value, lower case: "no". */
  'report.no': '否',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': '不适用',
  /* {reason} is core's. */
  'report.slotReason': '{slot}：{reason}',
  'report.writing': '写入',
  'report.noBankWritten': '这台相机的任何槽位都不会被写入：',
  /* {staged} is core's phrase for how a bank is written. */
  'report.oneBank':
    '一次一个槽位：“固件槽位操作”标签页一次写入或修补这台相机的一个槽位，每个槽位{staged}，每次写入前都会先征求确认。',
  'report.refusesEvery': '“固件槽位操作”标签页拒绝这台相机的所有槽位：',
} satisfies Translation<'info'>;
