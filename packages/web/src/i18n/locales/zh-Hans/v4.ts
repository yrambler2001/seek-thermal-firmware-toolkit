/**
 * Namespace `v4`, 简体中文 (zh-Hans), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OpcodeTable.tsx, components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': '正在开始…',
  'status.building': '正在生成压缩包…',
  'status.cancelling': '正在取消——将保存目前已读取的全部内容…',
  'status.refused': '已拒绝——没有读取任何内容。请查看日志上方的消息。',
  'status.sweepDone':
    '完成——已激活 {armed}/{total} 个选择器，其中 {withData} 个有数据。请查看你的下载。',
  'status.sweepDoneCancelled':
    '完成——已激活 {armed}/{total} 个选择器，其中 {withData} 个有数据（已取消）。请查看你的下载。',
  'status.dumpDone': '完成——已读取 {read}/{expected} 个窗口。请查看你的下载。',
  'status.dumpDoneCancelled': '完成——已读取 {read}/{expected} 个窗口（已取消）。请查看你的下载。',
  'status.dumpDoneIncomplete':
    '完成——已读取 {read}/{expected} 个窗口（不完整——请查看日志）。请查看你的下载。',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    '相机与 4.x/Nano 固件系列不符，而此标签页只读取该系列。没有读取任何内容。对于 0.x 或 1.x 相机（2014 或 2016 年的版本），请使用“{tab}”。',
  'refusal.otherFamily':
    '相机看起来是 {name}（{id}），不是 4.x/Nano 相机，而此标签页只读取 4.x/Nano。没有读取任何内容。对于 0.x 或 1.x 相机（2014 或 2016 年的版本），请使用“{tab}”。',
  'refusal.legacyLine':
    '相机运行的是 {version}，属于 0.x 或 1.x 版本（2014 或 2016 年），而此标签页只读取 4.x/Nano。除版本外没有读取任何内容。对于 0.x 或 1.x 相机，请使用“{tab}”。',

  /* views/V4View: step 2, the dump. */
  'dump.title': '导出',
  'dump.actions': '导出操作',
  'dump.start': '开始导出',
  'dump.panel': '导出',
  'dump.how':
    '两种导出都会先询问相机运行的是什么固件：用 `{getInfo}` 读取它的版本——所有 Seek 版本对这个读取的应答方式都相同——并且只有当该版本可以通过 USB 读取时，才发送一个普通的和一个带令牌的 `{begin}`，以及一次读取。本页就是这样判断相机属于哪个固件系列的。此标签页只读取 4.x 和 Nano 系列。应答表明属于其他系列的相机，会在读取任何内容之前被拒绝，本页会指出适合它的标签页。不报告版本、或运行早于 0.8.0.0 的版本的相机，完全不会被读取，本页会说明原因。',
  'dump.modes':
    '**开始导出**会读取该版本自身选择器表能访问到的每个块。下方*选项*中的**导出全部选择器**会探测 `{begin}` 的每个选择器 `{first}`–`{last}`，并保存每个选择器返回的内容——速度更慢，但也能获取精选映射跳过的块。',
  'dump.sweep': '导出全部选择器（{first}–{last}）',
  'dump.sweepNote': '探测每个选择器，并保存每个选择器返回的内容。比“开始导出”慢。',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': '你会得到什么',
  'output.intro': '一个 `{ext}` 下载文件，包含：',
  'output.caption': '下载的压缩包中的文件',
  'output.file': '文件',
  'output.what': '内容',
  'output.flash':
    '拼合后的 4 MB 闪存镜像（空缺填充值和解锁令牌——如果用到——记录在 manifest.json 中）',
  'output.windows': '每个 64 KB 块，保持传输时收到的原样',
  'output.decrypted': '每个固件镜像槽位，已解密（如果找到了密钥）',
  'output.reports': '每个槽位的报告：密钥、密钥位置、固件系列和加密方式、SP、入口地址、SHA-256',
  'output.manifest': '精确的读取/空缺/解密元数据',
  'output.readme': '这份采集是什么、有哪些局限',
  'output.keyFromDump': '密钥是从导出的镜像本身恢复的，因此不需要密钥文件或设备机密。',
  'output.bestEffort':
    '解密仍然是尽力而为。如果没有找到密钥——例如在引导程序从芯片 OTP 推导密钥的设备上，而 OTP 不在闪存镜像中——那个槽位就会被直接跳过，压缩包的其余部分不受影响。',

  /* views/V4View: the read-only guarantee. Command names are params, in `code`. <link> wraps the Slots tab's name. */
  'readonly.title': '只读保证',
  'readonly.intro':
    '本页只能发出恰好六个厂商命令。这就是它的全部词汇——没有任何代码路径能发出其他命令：',
  'readonly.caption': '六个只读厂商命令',
  'readonly.absent':
    '`{setData}`、`{complete}`、`{reset}` 以及所有上传、提交和擦除命令都不在此视图中。`{usbReset}` 也从不调用；重试路径只是关闭再重新打开句柄。解密完全在内存中、在你浏览器里的副本上进行，绝不触及设备。',
  'readonly.writing':
    '写入相机的功能在另一个标签页<link>{tab}</link>中，它一次写入一个槽位，并在每次写入前征求确认。*此*标签页上的任何内容都无法发出那些命令。',
  'readonly.firstReads':
    '在相机报告固件版本之前，六个命令中只会发送三个，而且只作为读取：`{getInfo}`、`{getMode}` 和 `{getError}`。在检查过的全部 36 个固件镜像中，这三个读取都位于相同的命令编号，含义也相同；同一个命令编号并非在每个版本上都含义相同，所以在确定版本之前不会发送任何其他命令。',
  'gap.summary': '{address} 空缺',
  'gap.where':
    'USB 命令集为 4 MB 闪存的每个 64 KB 块都提供了读取窗口选择器，唯独 `{range}` 除外。合并镜像中该块用 `{fill}` 填充，并记录在 `{manifest}` 中。',
  'gap.costs':
    '**实际上这对你没有任何损失。**在大多数相机上，该块只是已擦除的闪存，读出来本来就是 `{fill}`——所以填充值与实际内容一致，镜像是完整的。',
  'gap.redundant':
    '而当该块*确实*被使用时，其中存放的是一份冗余副本。这些相机会在多个 64 KB 槽位中保存同一个固件镜像：在制作本页时检查过的每一份多槽位镜像中，所有槽位解密后的固件都逐字节相同——其中一例是四个用两种不同密钥写入的槽位。在唯一一台在 `{address}` 处有真实镜像的设备上，它与 `{before}` 和 `{after}` 处的副本逐字节相同，所以压缩包中仍然包含该固件，只是从另一个地址读取的。',
  'gap.fine':
    '这种冗余也说明了为什么 `{address}` 读出为 `{fill}` 的相机没有问题：可启动的固件仍存在于其他槽位中。无论如何，本页都不会向设备写入任何内容——这个空缺只影响你下载的文件。',
  'gap.complete':
    '如果你确实需要严格完整、逐字节的镜像——比如要把闪存与参考镜像做比对——请通过 SWD/J-Link 或用 SPI 编程器读取。',

  /* components/OpcodeTable. Opcodes, names and IN/OUT stay as they are. */
  'opcodes.opcode': '操作码',
  'opcodes.name': '名称',
  'opcodes.dir': '方向',
  'opcodes.why': '用途',
  'opcodes.getInfo':
    '正在运行的固件版本，最先读取：它决定导出使用哪个版本的选择器表；不报告版本的相机不会被读取',
  'opcodes.getError': '每一步之后检查状态',
  'opcodes.setMode': '仅用于选择模式 0，且仅在当前不是该模式时',
  'opcodes.getMode': '读取当前模式',
  'opcodes.getData': '实际的闪存读取',
  'opcodes.begin':
    '仅为易失性的读取窗口选择器——它选择接下来的读取返回哪个 64 KB 块，不写入任何内容',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': '未读取：相机没有说明它运行的是哪个固件。',
  'identity.unsupported': '未读取：这台相机无法用这种方式读取。',
  'identity.title': '检测到的相机',
  'identity.firmware': '固件',
  'identity.scoreBasis': '根据相机的应答，在读取任何槽位之前',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': '选项',
  'options.subtitle': '——默认值是正确的；你无需更改这里的任何内容。',
  'options.chunk': 'chunk（control-IN 字节数）',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill 字节',
  'options.retries': '每个窗口的重试次数',
  'options.retryDelay': '重试间隔（毫秒）',
  'options.recipient': 'recipient（控制传输接收方）',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': '自动',
  'options.recipientInterface': 'interface（{requestTypes}）',
  'options.recipientDevice': 'device（{requestTypes}）',
  'options.decrypt': '解密固件',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': '是',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': '否',
  'options.help':
    '**chunk** 是每次 control-IN 读取的大小，最大 64：即一个 EP0 包。当相机在低时钟下空闲时，更长的读取可能会被相机的启动 ROM 丢掉一个包，所以更大的值会按每次 64 字节读取；更小的值按设定使用，如果相机停滞，本页会自动改用更小的值并继续。**gap-fill** 是写入 USB 无法访问的那个 64 KB 块中的字节。**recipient** 默认为 interface，如果浏览器无法占用接口 0，则退而使用 device——固件两者都接受。',
  'options.chunkRange': 'chunk 必须在 1 到 {max} 之间，当前为 {value}',
  'options.gapFillByte': 'gap-fill 必须是单个字节，当前为 {value}',
  'options.retriesMin': '重试次数必须为零或更多，当前为 {value}',
  'options.retryDelayMin': '重试间隔必须为零或更多，当前为 {value}',
} satisfies Translation<'v4'>;
