/**
 * Namespace `slots`, 简体中文 (zh-Hans), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), Key A / Key B, 0xFF, KiB/MiB, .bin/.zip, SWD/J-Link
 *   and SPI stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': '固件槽位操作',
  'section.badge': '会写入闪存',
  'section.description':
    '“读取槽位”会询问相机运行的是什么固件，读取它的三个固件槽位——{a}、{b} 和{r}——并显示每个槽位存放的内容。读取和导出不会改变任何东西。写入按钮在发送任何字节之前都会先征求确认。',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**本页可以写入相机的闪存。**一次写入会擦除一个 64 KB 槽位，再写入新内容。结构上有效但无法运行的镜像会让相机无法启动，而引导程序不支持 USB——只有 SWD/J-Link 或 SPI 编程器才能救回。请先导出该槽位，并保存好文件。',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': '槽位操作',
  'actions.read': '读取槽位',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': '槽位',

  /* Before any read. */
  'empty.connected':
    '请按“读取槽位”。会先询问相机运行的是哪个版本；在本页不支持的版本上，不会打开任何读写窗口。',
  'empty.disconnected': '请连接相机，然后按“读取槽位”。',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title': '此处不支持这个版本，因此没有读取任何槽位，也不能写入任何槽位。',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title': '无法识别：本页无法判断相机运行的是哪个版本。',
  'refusal.notIdentified.body':
    '相机没有给出可用的固件版本，因此没有读取任何槽位，也没有打开任何读写窗口。本页适用于 {minVersion} 及更新的版本。早于 {minVersion} 的版本不在槽位页面的支持范围内，所以运行这些版本的相机永远不会在这里被读取。',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint': '如果相机运行的是受支持的版本，它可能只是还在启动。{hint}',
  'refusal.title': '已拒绝——没有打开任何读写窗口。',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': '正在读取…',
  'status.readingAgain': '正在重新读取槽位…',
  /* {count} banks in all, {read} of them read. */
  'status.read': { other: '已读取。已读取 {read}/{count} 个槽位。' },
  'status.unsupported': '此版本不受支持——没有读取任何槽位。',
  'status.refused': '已拒绝——没有打开任何读写窗口。请查看日志下方的消息。',
  'status.disconnected': '设备已断开——请重新读取槽位。',
  'status.newDevice': '已选择新设备——请重新读取槽位。',
  'status.dumping': '正在导出{bank}…',
  'status.dumped': '已导出{bank}。',
  'status.readingImage': '正在读取镜像…',
  'status.ready': '准备就绪——请检查计划，然后写入。',
  'status.rejected': '已拒绝——请查看上方的日志。',
  'status.writing': '正在写入…',
  'status.patching': '正在修补{bank}…',
  'status.patchingEvery': '正在修补所有槽位…',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': '已写入，但回读结果不一致——请查看结果。',
  'status.written.verified': '已写入。该槽位的回读结果与写入内容一致。',
  'status.written.notCompared': '已写入。回读结果未经比对——请查看结果。',
  /* After a frame-rate patch. */
  'status.patched.unexpected': '已修补，但回读结果的差异不只是计划中的那些——请查看结果。',
  'status.patched.ok': '已修补。该槽位的回读结果与计划相符。',
  'status.patched.unchecked': '已修补。回读结果未经检查——请查看结果。',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': { other: '在{bank} 处停止——已修补 {count} 个槽位；请查看结果。' },
  'status.every.unchecked': {
    other: '已修补 {count} 个槽位，但有一次回读未按计划检查——请查看结果。',
  },
  'status.every.ok': { other: '已修补 {count} 个槽位。每个槽位的回读结果都与计划相符。' },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': '已取消——没有写入任何内容。',
  'status.cancelled.one':
    '在向{bank} 发送提交命令之后取消——该槽位可能只写入了一部分。在依赖它之前，请先读取它。',
  'status.cancelled.many':
    '在向{banks} 发送提交命令之后取消——每个槽位都可能只写入了一部分。在依赖它们之前，请先读取它们。',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': '请先连接相机。',
  'gate.busy': '另一项操作正在进行——请等待它完成。',
  'gate.readFirst': '请先读取槽位。',
  'gate.cameraRefused': '由于上方横幅中所述的原因，无法从这里写入这台相机。不会发送任何内容。',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': '未读取：{reason}。写入之前请重新读取槽位。',
  'gate.notReadNoReason': '未读取：这个槽位没有被读取。写入之前请重新读取槽位。',
  'gate.emptyNotWritable': '这个槽位是空的，在此版本上无法写入：{reason}',
  'gate.noSuchBank': '此版本没有这个槽位。',

  /* The bank table. */
  'table.caption': '这台相机上的每个固件槽位——{a}、{b} 和{r}——在浏览器中读取并检查的结果',
  'table.col.bank': '槽位',
  'table.col.firmware': '固件',
  'table.col.size': '大小',
  'table.col.key': '密钥',
  'table.col.bootable': '可启动',
  'table.col.sha': '明文的 SHA-256',
  'table.col.actions': '操作',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': '未读取——{reason}',
  'table.notReadNoReason': '未读取——该槽位没有被读取',
  /* A badge: the bank holds no image. */
  'table.empty': '空',
  'table.emptyNote':
    '没有镜像：这个槽位的头部窗口读出全是 0xFF，因此不会从中解密任何内容，写入它也不会覆盖任何固件。',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': '可以写入。{why}',
  'table.emptyNotWritable': '在此版本上无法写入：{reason}',
  'table.unknownVersion': '版本未知',
  /* {id} is the image id in hex. */
  'table.imageId': '镜像 {id}',
  'table.noImage': '无镜像',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': '槽位 {size} B',
  'table.imageSize': '镜像 {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': '无（明文）',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '——没有可启动的内容',
  'table.boot.bootable': '可启动——引导程序能为它找到密钥',
  'table.boot.notBootable': '不可启动——启动时会被跳过',
  'table.boot.recoveryOnly':
    '仅作恢复——当 {letterA} 和 {letterB} 中都没有引导程序接受的内容时，才会运行 {letterR}（这是在一台相机上针对此镜像的较早形式测得的）；这种形式能否启动尚未测试',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': '未知——{why}',
  /* The row's buttons. */
  'table.dump': '导出',
  'table.flashPlain': '写入解密后的镜像…',
  'table.flashRaw': '写入原始字节…',
  'table.restore': '从完整闪存备份还原（.bin 或 .zip）…',
  'table.makeFps': '改为 {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': '复制到{bank}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}：{reason}',
  'table.copyOffNoReason': '{button}：不可用',
  'table.copyNote':
    '把这个槽位中的固件（按本次读取的解密结果）复制到你选择的槽位，无论那个槽位现在存放着什么。在发送任何内容之前，你会先检查计划。',
  'table.restoreNote':
    '选择一个完整的闪存备份：一个 .bin（完整的 4 MB 闪存镜像，例如用 J-Link 读出的），或包含这种镜像的 .zip（Preserve 运行文件，或“导出并解密 4.x/Nano”或“导出全部选择器”保存的 zip）。会从中截取出这个槽位并解密，在发送任何内容之前以计划的形式显示。',
  'table.fpsNote':
    '通过修改字节，把这个槽位从 {fromHz} Hz 提高到 {toHz} Hz。会先把该槽位保存为一个 zip 下载，其中的解密文件就是恢复原状的途径。',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), English until core's words are translated.
   */
  'table.risk.bootedRecovery': '{booted}，且是恢复槽位：写入它需要额外确认。',
  'table.risk.booted': '{booted}：写入它需要额外确认。',
  'table.risk.recovery': '{bank}：写入它需要额外确认。',
  'table.risk.bootUnnamed': '相机没有说明它从哪个槽位启动：写入它需要额外确认。',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': '已应用帧率补丁：此镜像以 {hz} Hz 运行。',
  'fps.earlierPatch':
    '不提供帧率补丁：这个槽位中是较早的、不含 USB 修复的 {hz} Hz 补丁。请先还原原厂镜像，再按“改为 {hz} FPS”。',
  'fps.atRate': '无需帧率补丁：此版本本来就以 {hz} Hz 运行。',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': '不提供帧率补丁：{reason}',
  'fps.readFirst': '请先读取槽位——补丁是根据该槽位自身的镜像规划的',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': '所有槽位',
  'everyBank.make': '所有槽位改为 {hz} FPS',
  'everyBank.faster': '让所有槽位更快',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    '只需一次确认，依次修补{order}；每个槽位都会先保存到同一个 zip 下载中，写入后再回读。',
  'everyBank.noteBootedLast':
    '只需一次确认，依次修补{order}，相机当前启动的槽位放在最后；每个槽位都会先保存到同一个 zip 下载中，写入后再回读。',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': '{bank} 的镜像',
  'what.restore': '{file} 中的{bank}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': '已为{bank}（{address}）准备好写入',
  'preview.file': '文件',
  'preview.source': '镜像来源',
  'preview.target': '目标',
  'preview.targetEmpty': '{bank} 是空的：其中没有镜像，所以这次写入不会覆盖任何固件',
  'preview.readAs': '文件识别为',
  'preview.readAs.ff': '解密后的 {version} FF 镜像',
  'preview.readAs.plain': '解密后的镜像',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': '原始字节',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': '暂存方式',
  'preview.key': '密钥',
  'preview.payload': '载荷',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': { other: '{size} B，分 {count} 块发送，每块最多 {chunk} B' },
  'preview.checksum': '传输校验和',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': '写入后存储的内容',
  'preview.storedNotPredicted': '无法预测——以回读结果为准',
  'preview.storedPredicted': '预计 {size} B',
  'preview.storedKeyB': '预计 {size} B——是镜像与密钥 B 异或的结果，而不是载荷本身',
  'preview.savedFirst': '先行保存',
  'preview.compareCaption': '{bank} 中会改变的内容',
  'preview.col.field': '字段',
  'preview.col.now': '当前',
  'preview.col.after': '写入后',
  'preview.readFirst': '写入前请阅读：',
  /* {note} is core's note about this write. */
  'preview.note': '注意：{note}',
  'preview.nothingSent': '尚未向相机发送任何内容。写入时会把这些载荷传送到{bank}并提交。',
  'preview.toolbar': '{bank} 的写入操作',
  'preview.write': '写入{bank}…',
  'preview.discard': '放弃',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': '将 {what} 写入{bank}（{address}）？',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", English until core's are translated. */
  'writeConfirm.booted':
    '{bootsNow}。写入它会替换相机当前正在运行的固件。如果新镜像无法运行，相机可能完全无法启动。',
  'writeConfirm.recovery':
    '{bank} 是恢复槽位，即引导程序最后退回使用的那份副本。写入它之后，在还原之前相机将没有这份副本。',
  'writeConfirm.bootUnnamed':
    '相机没有说明它从哪个槽位启动，因此{bank} 被视为它当前启动的槽位。写入它可能会替换相机正在运行的固件。',
  'writeConfirm.empty': '{bank} 是空的：其中没有镜像，所以不会覆盖任何固件。',
  'writeConfirm.eraseEmpty':
    '这次写入仍会擦除相机闪存中{bank} 处的 64 KB 块（本来就是空白的），再写入新内容。',
  'writeConfirm.erase': '这会擦除相机闪存中的一个 64 KB 块，并在{bank} 处写入新内容。',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine': '镜像写入时使用的密钥：{key}。其他每个槽位也以同样的方式写入。',
  'writeConfirm.backup':
    '在发送任何内容之前，会重新读取{bank}，并保存为一个 zip 下载：{file}。请在下载文件夹中确认它已存在。',
  'writeConfirm.noReset': '不会发送重置命令。写入后请拔下相机再重新插上，该槽位才会生效。',
  'writeConfirm.noUsbRecovery':
    '如果镜像无法运行，相机将无法通过 USB 恢复——只能用 SWD/J-Link 或 SPI 编程器恢复。',
  'writeConfirm.ackUnnamed':
    '我明白相机没有说明它从哪个槽位启动，因此这个槽位被视为当前启动的槽位；我也明白，有问题的镜像可能导致相机无法启动。',
  'writeConfirm.confirm': '是——写入{bank}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted': '我明白这是相机当前启动的槽位，有问题的镜像可能导致相机无法启动。',
  'ack.recovery': '我明白这是恢复槽位，有问题的镜像会让相机失去最后的备用副本。',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': '让{bank} 以 {hz} FPS 运行？',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}。打过补丁的镜像会替换它当前运行的固件。',
  'fpsConfirm.recovery': '{bank} 是恢复槽位，即引导程序最后退回使用的那份副本。',
  'fpsConfirm.what':
    '{bank} 中存放的是固件 {version}，这会让它的镜像以 {toHz} Hz 运行，而不是 {fromHz} Hz。',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '（未知）',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    other:
      '补丁会改变镜像中的 {count} 个字节以及校验和字，使引导程序检查的校验和保持不变。密钥对不会被改动。',
  },
  'fpsConfirm.wayBack':
    '那个 zip 中的解密文件就是恢复原状的途径：要撤销补丁，请在{bank} 上用“写入解密后的镜像”写入它。',
  'fpsConfirm.noReset': '不会发送重置命令。写入后请拔下相机再重新插上，打过补丁的槽位才会生效。',
  'fpsConfirm.ackUnnamed': '我明白相机没有说明它从哪个槽位启动，因此这个槽位被视为当前启动的槽位。',
  'fpsConfirm.confirm': '是——修补{bank}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': '让所有槽位以 {hz} FPS 运行？',
  'fpsEvery.titleMixed': { other: '修补 {count} 个槽位的帧率？' },
  'fpsEvery.intro': { other: '这会修补 {count} 个提供该补丁的槽位，固件为 {version}：' },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery': '{bank}（相机当前启动的槽位，也是恢复槽位）',
  'fpsEvery.role.booted': '{bank}（相机当前启动的槽位）',
  'fpsEvery.role.recovery': '{bank}（恢复槽位，即最后的备用副本）',
  'fpsEvery.role.bootUnnamed': '{bank}（相机没有说明它从哪个槽位启动）',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    other: '{bank}：{fromHz} Hz 改为 {toHz} Hz，改动 {count} 个字节和校验和字。',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}：{note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': '保持不变：{others}',
  'fpsEvery.orderOne': '它只写入{bank}，并回读检查。',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    '它们按以下顺序写入：{order}。每个槽位都会在写下一个之前回读，第一次失败就会停止其余的写入。',
  'fpsEvery.orderBootedLast':
    '它们按以下顺序写入：{order}。相机当前启动的槽位放在最后，因此一旦失败，会在写到它之前停止。每个槽位都会在写下一个之前回读，第一次失败就会停止其余的写入。',
  'fpsEvery.wayBack':
    '那个 zip 中的解密文件就是恢复原状的途径：要撤销某个槽位的补丁，请在该槽位上用“写入解密后的镜像”写入它对应的文件。',
  'fpsEvery.noReset': '不会发送重置命令。写入后请拔下相机再重新插上，打过补丁的槽位才会生效。',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack': '我明白这会写入{banks}，有问题的镜像可能导致相机无法启动。',
  'fpsEvery.confirm': { other: '是——修补 {count} 个槽位' },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank}——{what}：该槽位的回读结果与写入内容一致。',
  'outcome.mismatch': '{bank}——{what}：回读结果与写入的内容不一致。',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared': '{bank}——{what}：已回读，但没有比对，因此这次写入在这里未经验证。',
  /* {status} is a hex status code. */
  'outcome.commitStatus': '相机的提交返回状态 {status}。',
  'outcome.wasEmpty': '{bank} 在这次写入之前是空的，所以没有覆盖任何固件。',
  'outcome.provenVerified':
    '目前已证实：载荷已传送并提交，该槽位的回读结果与写入内容一致。尚未证实：引导程序会选择这个槽位，以及镜像能够运行。',
  'outcome.provenCommitted':
    '目前已证实：载荷已传送并提交。尚未证实：引导程序会选择这个槽位，以及镜像能够运行。',
  'outcome.replug':
    '**现在请拔下相机，再重新插上。**没有发送重置命令，所以该槽位只有在真正断电重启之后才会生效。然后重新读取槽位：只有相机报告的版本和活动槽位才能最终说明结果。',
  /* After a frame-rate patch. */
  'outcome.replugShort': '**现在请拔下相机，再重新插上。**没有发送重置命令。然后重新读取槽位。',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': '已先行保存为下载文件：{file}。',
  'outcome.wayBackOne':
    '其中的解密文件就是恢复原状的途径（在同一个槽位上使用“写入解密后的镜像”）。',
  'outcome.wayBackMany': '其中的解密文件就是恢复原状的途径（在各个槽位上使用“写入解密后的镜像”）。',
  'outcome.checkDownloads': '请在下载文件夹中确认它已存在。',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank}——已从 {fromHz} Hz 修补为 {toHz} Hz（固件 {version}）。',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    other: '回读结果与保存的镜像相比，只在计划中的 {count} 个字节（补丁位置和校验和字）处不同。',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    other:
      '回读结果的差异并不只是计划中的那些：有 {unexpected} 个字节发生了意外改变，{count} 个应改变的字节没有改变。',
  },
  'fpsOutcome.notTaken': '没有进行回读，因此这里没有检查补丁。',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    other: '所有槽位：已修补 {count} 个中的 {done} 个，顺序为：{order}。',
  },
  'fpsEveryOutcome.readBackOk': {
    other: '回读结果与保存的槽位相比，只在计划中的 {count} 个字节处不同。',
  },
  'fpsEveryOutcome.notTaken': '没有进行回读。',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': '已停止：{reason}。',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': '未写入：{banks}。',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': '无法从这里写入这台相机的任何槽位。',
  'keys.title': '写入所用的密钥',
  'keys.chain': '固件链',
  'keys.chainPlain': '2014 年的明文链：每个槽位都以明文存储，因此都不含密钥',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': '写入形式',
  'keys.writtenPlain': '镜像原样写入，不使用密钥，可写入任何槽位',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': '暂存为',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': '存储为',
  'keys.refused': '已拒绝',
  'keys.bootedBank': '当前启动的槽位',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} 持有{key}',
  'keys.theBootedBank': '当前启动的槽位',
  'keys.unnamedKey': '本页无法命名的密钥',
  'keys.bootedBanksKey': '当前启动槽位的密钥',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}；每个槽位都以同样的方式写入',

  /* "What these buttons do", below the tab. */
  'how.title': '这些按钮的作用',
  'how.read':
    '**读取槽位**和**导出**不会改变相机中的任何内容。在做任何其他事情之前，会先询问相机运行的是哪个版本；早于 {minVersion} 的版本会被报告出来，其槽位不会被读取。',
  'how.flash':
    '**写入解密后的镜像**接收一个明文镜像，在暂存之前按该槽位固件的要求加密，并显示计划。**写入原始字节**则完全按原样暂存文件。在你确认之前，两者都不会发送任何内容。',
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    '运行 1.3.0.8 的 Compact 可能是 8 Hz 版本，也可能是 16 Hz FF 版本，两者报告的版本号相同。相机自己能区分它们：它对每个槽位的应答会说明当前应答的应用程序是否接受该槽位，而每个版本会给出什么应答都可以预测。8 Hz 镜像可以写入任何槽位。FF 镜像按厂商应用的方式暂存（镜像 XOR 密钥 A），16 Hz 版本会以密钥 B 存储它，可写入任何槽位。本页不会拒绝它：在你确认之前，计划会说明预计相机会如何处理它（8 Hz 版本会在提交时拒绝它；其他版本的相机会按发送的原样写入，但无法从中启动）。FF 镜像能否启动尚未测试：资料库中没有这个版本的真实引导程序。写入恢复槽位 {letterR} 时，和任何恢复槽位的写入一样需要额外确认。**空**槽位（其头部窗口读出全是 0xFF，就像许多 2014 年相机的{b}）是一种状态，而不是故障。导出时它就是原始的 64 KB 0xFF，没有可解密的内容；它的写入方式与其他槽位完全相同，计划和确认对话框会说明不会覆盖任何固件。',
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    '槽位行上的 **{copyA}**、**{copyB}** 和 **{copyR}** 会把该槽位中的固件（按本次读取的解密结果）写入另一个槽位，无论那个槽位现在存放着什么。镜像的暂存方式与任何解密后的镜像相同，所以计划和确认都与写入文件时一样。**从完整闪存备份还原**接收一个 .bin（完整的 4 MB 闪存镜像，例如用 J-Link 读出的）或包含这种镜像的 .zip（Preserve 运行文件，或“导出并解密 4.x/Nano”或“导出全部选择器”保存的 zip），从中截取出这个槽位，解密并显示计划；如果备份看起来来自另一台相机或另一个固件，计划中会说明。在备份中为空的槽位，或导出时没有读到的槽位，无法通过写入来还原，本页会说明这一点。',
  'how.fps':
    '槽位行上的**改为 N FPS**会把该槽位的镜像修改为更高的帧率；**所有槽位改为 N FPS**则只需一次确认，对每个提供该补丁的槽位都这样修改，相机当前启动的槽位放在最后。无法提供补丁的槽位会说明原因。',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**每次写入都会先保存该槽位**：重新读取该槽位，并保存为一个 zip 下载，文件名包含时间、相机序列号、固件、槽位和写入操作（例如 `{example}`），其中有槽位的存储内容、解密后的镜像，以及说明每个文件是什么的备注。写入会等到下载开始之后才进行。浏览器不会告诉你下载何时真正写入磁盘，所以请检查你的下载文件夹。要恢复原状，请用**写入解密后的镜像**写入 zip 中的解密文件。',
  /* {address} is the bootloader's flash address. */
  'how.write':
    '一次写入会擦除一个 64 KB 槽位，再写入新内容。位于 `{address}` 的引导程序和启动配置在这里永远不会被写入，也没有用于选择活动槽位的控件。只有在拔下相机再重新插上之后，该槽位才会生效。',
} satisfies Translation<'slots'>;
