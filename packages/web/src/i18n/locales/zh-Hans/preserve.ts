/**
 * Namespace `preserve`, 简体中文 (zh-Hans), translated from the English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   and stay English for now, as do the sentences core writes ({why}, {reason}, {what}, {build}…).
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': '会发生什么',
  'how.descriptionIdle': '连接相机，然后从步骤 02 开始。',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': '运行 {runId}。',
  'how.descriptionRunVersion': '运行 {runId}——固件 {version}。',
  'how.restarts':
    '相机在每个步骤中都会**重启**。重启后 Chrome 不再认得它（它没有 USB 序列号），所以本页会请你按**连接设备**并再次选择相机。这是正常流程——你完成后，该步骤会自动继续。',
  'how.noFile': '不需要选择任何固件文件：所有内容都从相机本身读取。',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    '相机把固件保存在三个**槽位**中（{a}、{b} 和{r}）。步骤 02 会读取全部三个槽位，并判断相机下次从哪个槽位启动；只有那个槽位中有补丁时，补丁才会起作用。由你选择步骤 03 修补哪些槽位——默认是下次启动进入的那个——步骤 04 会把它们全部还原。',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    '每个步骤之后，浏览器都会下载一个**运行文件**，文件名包含本次运行的开始时间、保存时间和已到达的步骤（`{example}`），其中每个步骤一个文件夹。请保留最新的那个——它可以让你以后继续。',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**步骤 03 和 04 会写入相机的闪存**，每一步都会先请你确认。在其中任一步骤运行期间，请保持相机连接（除非本页要求你重新插拔），并让电脑保持唤醒，最好接上电源。写入一旦中断，相机就只能用硬件编程器（SPI 或 SWD/J-Link）修复。',
  'how.phone':
    '**在手机上：**在步骤 03 之前，打开飞行模式并关闭 Wi-Fi 和移动数据，以免来电或通知在写入过程中把浏览器切走——并保持屏幕常亮。页面打开后可以离线继续工作。',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**本次运行没有写入的记录，因此之后的步骤已关闭。**相机可能已经在运行打过补丁的镜像（写入被中断），也可能没有（写入从未开始）——运行文件无法证明是哪一种。在没有写入记录的情况下，不要对已打补丁的相机执行全闪存读取或还原；正确的做法是步骤 03，它在写入前的检查会读取槽位，并拒绝盲目地再次写入。只有当该检查已经以 *already holds the patched bytes*（“已含有补丁字节”）拒绝时，才适用跳过——而且要通过它自己的对话框。',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': '读取并生成',
  'phase.readBuild.inSentence': '读取并生成',
  'phase.readBuild.description':
    '读取原厂相机允许读出的全部内容——31 个 64 KB 块——作为你的备份保存，再把每个固件槽位读取第二遍，判断相机下次从哪个槽位启动，并准备下一步要写入的小补丁。不会向相机写入任何内容。通常不到一分钟。如果相机中途需要重启，本页会请你按“连接设备”并再次选择它——这是预料之中的。',
  'phase.patchDump.label': '写入并读取全闪存',
  'phase.patchDump.inSentence': '写入并读取全闪存',
  'phase.patchDump.description':
    '把一个小的临时补丁写入步骤 02 中选定的固件槽位（默认是相机下次启动的那个槽位），使相机能读出它的全部闪存。然后相机会重启——本页提示时，请按“连接设备”并再次选择它——接着读取整个 4 MB 闪存。步骤 04 会把原始固件放回去。',
  'phase.restoreVerify.label': '还原并验证',
  'phase.restoreVerify.inSentence': '还原并验证',
  'phase.restoreVerify.description':
    '把你的原始固件写回去，重启相机（提示时请按“连接设备”并再次选择它），然后把所有内容再读一遍，检查它与备份是否逐字节一致。',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    '读取原厂相机能读取的 31 个 64 KB 块，然后把每个槽位再读一遍（两次读取必须逐字节一致），从相机存储的内容中取出每个槽位的固件（加密存储的会先解密）并加以检查，再判断相机下次从哪个槽位启动。这是本次运行对这台相机的唯一一份副本，在写入任何内容之前获取。',
  'step.patch.description':
    '离线进行，不使用相机。为本次运行可以写入的每个槽位生成补丁：它让相机的读取能访问整个 4 MB 闪存，并且以相机存储的形式写入，所以只有补丁本身的字节会改变。',
  'step.commit.description':
    '写入。先回读每个选定的槽位，只有当每个槽位仍然是备份记录的内容时才会写入（已经完成的写入绝不会重复），然后逐个写入，相机最先尝试的槽位放在最后。这里不会重启相机：下一步会重启它。',
  'step.drain.description':
    '重启相机，让它启动打过补丁的固件（它会大约十秒没有响应；本页会等待并重新找到它），检查它是从哪个槽位启动的（如果是没有补丁的槽位，该步骤会在读取任何内容之前停止），然后一次读取整个 4 MB 闪存，并把备份中每个已写入槽位的原始固件放进保存的镜像中。不会写入任何内容。',
  'step.restore.description':
    '另一次写入。在打过补丁的固件仍在运行时，把每个已写入槽位的原始固件写回去，然后重启相机。',
  'step.verify.description':
    '在重新启动之后，再次读取这 31 个块，其中包括每个槽位：0 个不同字节即证明相机的闪存与备份逐字节相同。只读。',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': '开始{phase}',
  'phase.retry': '重试{phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': '继续步骤 04：还原槽位',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': '跳过未记录的写入继续运行',
  'phase.skipWrite': '跳过写入——从全闪存读取开始',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}操作',
  /* The badges beside the step's title. */
  'badge.writes': '会写入相机',
  'badge.running': '正在运行',
  'badge.done': '完成',
  'badge.plannedStop': '按计划停止——接下来是还原',
  'badge.failed': '已停止——请查看日志',
  /** A badge on the step that runs next. */
  'badge.upNext': '下一步',
  /* Why the start button is off. */
  'notReady.noRun': '步骤 02 之后可用——它会开始本次运行。',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': '步骤 {step}（{phase}）之后可用。',
  /* {reason} is gate.needs. */
  'notReady.gate': '尚未就绪——{reason}。',
  /* {section} is how.title. */
  'phase.pastCommit': '适用于写入没有记录的情况——相机可能已经打过补丁。请参阅“{section}”下的说明。',
  'phase.noDrain':
    '全闪存读取尚未运行——此步骤会在没有它的情况下让相机恢复原样。除非全闪存读取对你无关紧要，否则请先运行步骤 03。',
  'phase.keepPlugged': '在此步骤完成之前，请保持相机连接，并让电脑保持唤醒。',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': '进度',
  'phase.showDetails': '在日志中显示详细信息',
  'phase.inDetail': '此步骤的详细内容',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': '轮到你了',
  'yourTurn.reconnect.title': '轮到你了：请按“连接设备”并选择相机。',
  'yourTurn.reconnect.body':
    '相机已按计划重启。Chrome 自己无法再次认出它（它没有 USB 序列号），所以需要你再选择一次。你选择后，该步骤会立即继续。',
  'yourTurn.replug.title': '轮到你了：请拔下相机，再重新插上，然后按“连接设备”。',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    '本次运行的补丁是在读取修复之前制作的，因此在还原之前，相机需要重新上电。运行文件已经保存。',
  'yourTurn.replugBeforeRestore.title': '步骤 04 之前：请拔下相机，再重新插上，然后按“连接设备”。',
  'yourTurn.powerCycle.title': '轮到你了：请拔下相机，再重新插上，按“连接设备”——然后重试。',
  'yourTurn.powerCycle.body':
    '相机的读取功能需要重新上电后才能再次读取。本次运行仍保留在页面中；没有丢失任何内容。',
  'yourTurn.powerCycleAssert.title': '轮到你了：请拔下相机，再重新插上，按“连接设备”——然后继续。',
  'yourTurn.powerCycleAssert.body':
    '上一次备份尝试已停止，相机需要重新上电后才能再次运行。相机自己无法报告这一点，所以由下方的按钮告诉本页你已经完成。',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': '我已重新插拔——继续{phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': '步骤 03 修补哪些槽位',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': '启动配置字',
  'banks.lastStart': '上次启动',
  'banks.nextStart': '下次启动',
  'banks.caption': '步骤 02 读取到的三个固件槽位',
  'banks.col.bank': '槽位',
  'banks.col.address': '地址',
  'banks.col.holds': '存放的内容',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': '下次启动',
  'banks.choiceLabel': '要修补的槽位',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': '下次启动进入的槽位',
  'choice.all': '所有槽位',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice}——{banks}',
  'choice.notOffered': '{choice}——不提供',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': '尚未选择槽位：{what}。请在上方按名称选择一个槽位。',
  'banks.writes': '步骤 03 会写入{what}。',
  'banks.fixed': '写入已经运行，因此选择已固定：步骤 04 只会还原这些槽位。',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}：不提供——{why}。',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': '没有正在进行的运行——步骤 02 会开始一次',
  'banks.refusedBusy': '有步骤正在运行——请在它完成后再选择槽位',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': '计划——{build}，修补{banks}',
  'plan.summaryNone': '计划——{build}，尚未选择槽位',
  'plan.yourCamera': '你的相机',
  'plan.intro':
    '根据相机自身的字节生成。在步骤 03 运行之前不会写入任何内容，步骤 04 会把它写入的每个字节都还原。',
  /* The rows; their values are core's. */
  'plan.build': '构建',
  'plan.version': '固件版本',
  'plan.written': '写入',
  'plan.route': '去向',
  'plan.restore': '还原',
  'plan.wholeFlash': '全闪存读取',
  'plan.outro':
    '在相机存储的形式中，改变的正是这些字节，没有其他字节改变，所以相机固件的变化恰好就是这些差异，别无其他。',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': '{bank} 的补丁',
  'bankPlan.titleChosen': '{bank}——由本次运行写入',
  'bankPlan.titleNotChosen': '{bank}——未选择',
  'bankPlan.source': '镜像来源',
  'bankPlan.sourceValue': '{bank} 的存储内容',
  'bankPlan.sourceTwoReads': '{bank} 的存储内容，两次读取一致（sha256 {sha}）',
  'bankPlan.edit': '镜像修改',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '原厂镜像上的 {label}（{id}）。它的平衡值 {balance} 位于调整字中；补丁在此基础上再做平衡，步骤 04 会把镜像连同这项修改一起还原。',
  'bankPlan.factorySha': '原厂明文 sha256',
  'bankPlan.patchedSha': '补丁后 sha256',
  'bankPlan.diffCount': '闪存芯片上改变的字节',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': '暂存长度',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': { other: '{size} B，分 {count} 块' },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': '平衡字',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word}（原为 {balance}，即该修改的平衡值）',
  'bankPlan.caption': '补丁在{bank} 中改变的确切字节',
  'bankPlan.col.what': '改变的内容',
  'bankPlan.col.offset': '偏移',
  'bankPlan.col.before': '之前',
  'bankPlan.col.after': '之后',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    other:
      '**验证通过——完全一致。**重新启动后再次读取了相机：{read}/31 个块，{count} 个不同字节。它的闪存与第一次写入之前完全相同。',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    other:
      '**验证通过——完全一致。**重新启动后再次读取了相机：{read}/31 个块，{count} 个不同字节（不完整的块：{blocks}）。它的闪存与第一次写入之前完全相同。',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**检查发现与备份存在差异。**{error}',
  unknownReason: '未知原因',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase}——写入{banks}？',
  'confirm.titleJump': '{phase}——跳过未记录的写入？',
  'confirm.chosenBanks': '选定的槽位',
  'confirm.jump':
    '本次运行没有写入记录，而你是在声明这些写入已经完成、只是没有留下检查点：该步骤会跳过写入开始，而不是再写一次。各步骤自己的检查仍会运行——版本读取、槽位检查——猜错的代价是白白浪费一次全闪存读取，而不会让相机变砖。',
  'confirm.jumpKeepPlugged': '在该步骤完成之前，请保持相机连接，并让电脑保持唤醒。',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    '这会把一个小补丁写入{banks}。步骤 04 会把原始固件放回去。随后的全闪存读取只读不写。',
  'confirm.patchInOrder':
    '这会按顺序把一个小补丁写入{banks}——相机最先尝试的槽位放在最后。步骤 04 会把原始固件放回去。随后的全闪存读取只读不写。',
  /* Step 04. */
  'confirm.restore': '这会把你的原始固件写回{banks}。',
  'confirm.restoreInOrder': '这会按顺序把你的原始固件写回{banks}——相机最先尝试的槽位放在最前。',
  'confirm.keepPlugged':
    '写入期间请保持相机连接，并让电脑保持唤醒——写入一旦中断，相机就只能用硬件编程器（SPI 或 SWD/J-Link）修复。在手机上，请打开飞行模式并保持屏幕常亮。随后相机会重启；本页提示时，请按“连接设备”并再次选择它。这是预料之中的。',
  'confirm.yesJump': '是——跳过写入',
  'confirm.yesWrite': '是——写入相机',

  /* ---- the last screen: the proof ---- */
  'summary.proof': '证明',
  'summary.complete': '完整镜像（4 MB）',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': '未生成',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': { other: '与备份相比，{count} 个块中有 {differing} 个不同：{blocks}' },
  'summary.matches': { other: '与备份的全部 {count} 个块一致' },
  'summary.onlyInFull': '仅在全闪存读取中',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': { other: '{count} 个原厂读取无法访问的块：{blocks}' },
  'summary.rawDump': '全闪存读取（原样）',
  'summary.rawDumpBadge': '内容相同，但补丁仍在其中',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': '固件镜像（已解密，{bank}）',
  'summary.verify': '验证',
  'summary.toolbar': '压缩包操作',
  'summary.download': '下载完整压缩包（运行文件）',

  /* ---- the run file section ---- */
  'runFile.eyebrow': '可选——用于以后继续运行',
  'runFile.title': '运行文件',
  'runFile.description':
    '本次运行的唯一记录。每个步骤之后（以及提前停止的步骤之后）都会自动下载；请保留最新的那个。要以后继续，或在出现问题后继续，请在这里加载它，本页会从中断的地方接着进行。',
  'runFile.run': '运行',
  'runFile.file': '文件',
  'runFile.lastSaved': '上次保存',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': '在 {step} 之后——{at}（{bytes} B）',
  'runFile.nextStep': '下一步',
  'runFile.none': '没有正在进行的运行。步骤 02 会开始一次，你也可以在这里加载运行文件。',
  'runFile.toolbar': '运行文件操作',
  'runFile.load': '加载运行文件…',
  'runFile.save': '再次保存运行文件',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': '继续运行',

  /* ---- status lines of the run panels ---- */
  'status.noFile': '未选择运行文件。',
  'status.notRun': '尚未运行。',
  'status.running': '正在运行…',
  'status.runningRestarts': '正在运行——相机会在此步骤中重启…',
  'status.restarting': '相机正在重启——大约需要十秒…',
  'status.waitConnect': '等待你的操作——请按“连接设备”并选择相机…',
  'status.waitPlugBack': '等待你的操作——请重新插上相机，然后按“连接设备”…',
  'status.waitReplug': '等待你的操作——请拔下相机再重新插上…',
  'status.back': '相机已重新连接——正在继续…',
  'status.swapped': '已停止——相机变了。请检查相机，然后重新运行该步骤。',
  'status.noRun': '没有运行。',
  'status.notCreated': '未创建——请查看上方的日志。',
  'status.refused': '已拒绝——上方的步骤列表说明了缺少什么。',
  /* {phase} is phase.*.label. */
  'status.done': '{phase}——完成。你下载的运行文件是最新的。',
  'status.doneReplug':
    '{phase}——完成，运行文件已保存。还原之前：请拔下相机，再重新插上，然后按“连接设备”。',
  'status.backupRefused': '已拒绝——没有写入任何内容。请查看上方的日志。',
  'status.failed': '失败——请查看上方的日志。',
  'status.cancelled': '已取消——运行文件仍记录着运行停在何处。',
  'status.readingFile': '正在读取运行文件…',
  'status.doneEarlier': '之前已完成——从运行文件加载。',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': '之前失败：{error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': '已从 {step} 继续。步骤列表会从那里接着进行。',
  'status.notResumed': '未能继续——请查看上方的日志。',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by "; ". {build}, {why} and {reason} are core's.
   */
  'gate.needs': '需要{missing}',
  'gate.noRun': '没有正在进行的运行——第一个步骤会创建运行',
  'gate.runDone': '本次运行已完成——所有步骤都已完成',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': '已完成——继续运行将从 {step} 开始',
  'gate.banksRead': '备份读取的槽位',
  'gate.choice': '选择槽位——{why}',
  'gate.bankRefused': '{bank} 无法写入：{reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute': '恢复槽位路径（此版本只从{r} 运行，而不是{bank}）',
  'gate.backupFirst': '闪存备份（在此步骤中最先运行）',
  'gate.backup': '闪存备份',
  'gate.patchStep': '补丁步骤',
  'gate.patchOf': '{bank} 的补丁',
  'gate.backupFile': '备份窗口文件',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank} 的采集数据',
  'gate.derived': '{bank} 的推导镜像',
  /* "Write" is the step's name on its chip (core's, English for now). */
  'gate.writeStep': '“写入”步骤（请先运行它，或从它继续）',
  'gate.drainRefused': '全闪存读取在 {build} 上拒绝运行——{why}',
  'gate.patchSummary': '{bank} 的补丁摘要（暂存长度）',
  'gate.restoreRefused':
    '还原在 {build} 上拒绝运行——原始固件没有任何一种形式能存回为原始字节；本次运行将以完整镜像结束，补丁仍保留在相机中',
  /* {file} is a file name in the run file. */
  'gate.plaintext': '{bank} 的原厂明文（{file}，来自备份步骤）',
  'gate.restoreFirst': '还原（在此步骤中最先运行）',
  'gate.powerCycle':
    '断电重启的确认——请给相机断电重启（拔下再重新插上，或使用它的电源开关），然后使用重新运行的控件',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    '重试 {minutes} 分钟后相机仍未重新连接：{error}——如果 Chrome 没有弹出任何询问，请重新插拔相机并再次运行该步骤；如果日志提示重新连接，那么它等待的正是你点击“连接设备”',
} satisfies Translation<'preserve'>;
