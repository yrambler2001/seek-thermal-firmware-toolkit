/**
 * Namespace `core`, 简体中文 (zh-Hans), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}` (joined with your common:list.* words, or
 *     "; " where the English uses a semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    '相机在断电重启之前会一直保持解锁状态，在此之前其他工具可能会误读它；使用其他工具之前，请先给相机断电重启',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '先 {first}，然后 {second}，最后 {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': '没有被读取',
  'boot.verdict.checkKeyUnnamed': '无法检查：没有指明其引导程序检查槽位时使用的密钥',
  'boot.cfg0NotRead': '没有读取启动配置字（cfg[0]），因此不知道下次启动会运行哪个槽位',
  'boot.select.unknown':
    '启动配置字为 {word}，因此引导程序先尝试{first}，但{bank} {verdict}，所以不知道会运行哪个槽位',
  'boot.select.first': '启动配置字为 {word}，因此引导程序先尝试{first}，其中有引导程序接受的镜像',
  'boot.select.second':
    '启动配置字为 {word}，因此引导程序先尝试{first}；{first} 中没有引导程序接受的镜像，所以它会使用{second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    '启动配置字为 {word}，因此引导程序先尝试{first}；{first} 和{second} 中都没有引导程序接受的镜像，所以它会启动{last}，且不对其进行检查',
  'boot.select.lastTakes':
    '启动配置字为 {word}，因此引导程序先尝试{first}；{first} 和{second} 中都没有引导程序接受的镜像，所以它会使用{last}，且不对其进行检查',
  'boot.bootsNow': '{bank} 是相机当前启动的槽位',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': '当前启动',
  'boot.notBooted': '未启动',
  'boot.unknownWhy.checkKeyUnnamed': '本次读取没有指明其引导程序检查槽位时使用的密钥',
  'boot.unknownWhy.noKeyTable': '没有读取引导程序的密钥表，因此无法说出它会尝试哪些密钥',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': '相机启动的是{bank}。{why}。',
  'fpsBoot.holdsOne': '{bank} 中有帧率补丁，但它不会运行，所以补丁不会生效。',
  'fpsBoot.holdsTwo': '{banks} 中有帧率补丁，但它们都不会运行，所以这些补丁不会生效。',
  'fpsBoot.wouldNotRun': '修补{target} 并不会让它运行，因为相机启动的是{bank}。',
  'fpsBoot.patchRunning': '也请修补{bank}（运行的那个槽位）：这样帧率补丁才会生效。',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} 无法在这里修补（{reason}），所以其他槽位中的帧率补丁在这台相机上不会生效。',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
  'backup.bank.notInPlan': '{name}（不在此版本的计划中：zip 中有说明）',
  'backup.bank.unsupported': '{name}（此版本无法读取它，{reason}：zip 中有说明）',
  'backup.bank.empty': '{name}（空，每个字节都是 0xFF：zip 中有说明，这次写入不会覆盖任何固件）',
  'backup.bank.unread': '{name}（槽位读取没有读到它：zip 中会说明写入前的读取是否读到）',
  'backup.bank.noKey': '{name}（按存储原样；本次读取恢复的密钥都无法打开它，所以没有解密文件）',
  'backup.bank.decrypted': '{name}（按存储原样，并已解密）',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    '在写入任何内容之前，会重新读取{banks}，并与说明每个文件内容的备注一起保存到一个 zip 中：{file}。',
  'backup.plan.many':
    '在写入任何内容之前，会重新读取{banks}，并与说明每个文件内容的备注一起保存到一个 zip 中：{file}。',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext': '加密后使设备以当前启动槽位持有的密钥存储它',
  'staging.detail.slotKeystreamCiphertext':
    '以镜像自己的暂存密钥（密钥块 0）加密；相机会以该槽位自己的密钥存储它',
  'staging.detail.plain': '明文，不加密',
  'staging.detail.keyAKeystream':
    '按厂商应用暂存 1.3.0.8 FF 镜像的方式（XOR 密钥 A）——16 Hz 版本会以密钥 B 存储它，而不是存储这些字节',
  'staging.detail.verbatim': '原样——字节完全按给定的内容',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': '没有读取',
  'copy.source.notInPlan': '{name} 不在此版本的计划中',
  'copy.source.notRead': '{name} 没有被读取（{reason}），所以没有可复制的镜像',
  'copy.source.empty': '{name} 是空的：没有可复制的镜像',
  'copy.source.foreign': '{name} 中没有本次读取能识别的固件镜像，所以没有可复制的内容',
  'copy.source.noKey': '本次读取恢复的密钥都无法打开{name}，所以没有可复制的解密镜像',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name}（{address}），按槽位读取时的解密结果',
  'copy.fromVersion': '{name}（{address}），固件 {version}，按槽位读取时的解密结果',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note': '镜像来自{name}，按槽位读取时的解密结果：{size} B，sha256 {sha256}。',
  'copy.noteVersion':
    '镜像来自{name}，按槽位读取时的解密结果：固件 {version}，{size} B，sha256 {sha256}。',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's Slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '备份中的{name}（{address}）',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}，位于完整闪存备份 {file} 中',
  'restore.fromVersion': '{where}，位于完整闪存备份 {file} 中，固件 {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': '一个 4 MB 闪存镜像',
  'restore.kind.preserve-run': '一个 Preserve 运行文件',
  'restore.kind.dump': '一个“导出并解密 4.x/Nano”的 zip',
  'restore.kind.all-selectors': '一个“导出全部选择器”的 zip',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': '一个镜像',
  'restore.decryptedTo.firmware': '固件 {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    '镜像是 {file}（{kind}）中的{where}：存储内容 sha256 {stored}，解密为 {size} B 的{decrypted}（sha256 {sha256}）。',
  'restore.note.imageEntry':
    '镜像是 {file}（{kind}，其中的 {entry}）中的{where}：存储内容 sha256 {stored}，解密为 {size} B 的{decrypted}（sha256 {sha256}）。',
  'restore.note.readBack': '写入之后，会把回读的槽位与备份中存储的槽位字节进行比对。',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera': '备份的身份信息块指明的正是这台相机（序列号 {serial}）。',
  'restore.note.sameBytes': '{name} 中已经是备份存储的字节：这次写入会把同一个镜像放回去。',
  'restore.warn.otherCamera':
    '这个备份看起来来自另一台相机：它的身份信息块中的序列号是 {theirs}，而这台相机是 {camera}。只会写入{name} 的镜像；那台相机的身份信息和校准数据都不会写入。',
  'restore.warn.noIdentity':
    '这个备份在 {address} 处没有身份信息块，因此无法判断它是从谁的相机读取的。',
  'restore.warn.serialNotRead':
    '没有读取相机的序列号，因此无法把备份（序列号 {serial}）与它对应起来。',
  'restore.warn.otherFirmware':
    '{where}中是固件 {version}，而相机运行的是 {camera}：这次还原会把另一个固件放进该槽位。',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared': '{bank} 没有回读，因此没有与备份比对。',
  'restore.readBack.equal': '{bank} 的回读结果与备份中存储的内容逐字节相同。',
  'restore.readBack.differs':
    '{bank} 的回读结果与备份中存储的字节有 {count} B 不同（第一处在 {offset}）。',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}，由当前启动的{bank} 推导得出',
  'keys.derived.holds': '{key}（存储密钥），由当前启动的{bank} 推导得出，该槽位持有{holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}，由当前启动的槽位推导得出',
  'keys.derived.holdsUnnamed': '{key}（存储密钥），由当前启动的槽位推导得出，该槽位持有{holds}',
  'keys.ffVendor.staged':
    '按厂商应用暂存的方式处理 1.3.0.8 FF（16 Hz）镜像：镜像 XOR 它自己的密钥块 0（密钥 A），头部窗口保持原样，可写入任何槽位；不使用这台相机的密钥',
  'keys.ffVendor.stored': '密钥 B：相机用密钥块 1 重新加密上传的数据，并以它存储镜像',
  'keys.imageBlock0.staged':
    '以镜像自己的密钥块 0（按值在镜像中找到）加密，可写入任何槽位；不使用这台相机的密钥',
  'keys.imageBlock0.storedUnnamed':
    '其引导程序检查槽位时使用的密钥（本次读取未指明）；相机会以它重新加密上传的数据',
  'keys.imageBlock0.stored':
    '{key}，即其引导程序检查槽位时使用的密钥；相机会以它重新加密上传的数据',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED（未经测试）：还没有从任何相机上读取过 16 Hz FF 版本的引导程序，因此不知道写入的槽位能否启动。在 0.9.0.0 引导程序上，这个镜像的较早形式曾从恢复槽位 R 启动；这种形式则不会，因为该引导程序按存储原样启动恢复槽位 R，不会对其解码。',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    '16 Hz FF 镜像以只有 16 Hz {version} 版本才能读取的形式发送。这台相机写入槽位时不检查镜像（它的固件源代码如此，一台 1.3.0.0 Compact 在试验中也是这样），因此预计它会按发送的原样写入这些字节：之后该槽位中存放的镜像是这台相机无法启动的形式。',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested}这里没有任何内容声称相机能启动它。',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': '相机自己的应答表明它运行的是 16 Hz FF 版本：{why}。',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    '会在擦除槽位之前检查载荷，而这个载荷能通过检查，所以它可能会按原样写入这些字节，而这种形式是其引导程序无法启动的：该槽位可能无法启动（未经尝试；写入前保存的备份可以把它恢复回去）',
  'write.ff.outcome.refuses':
    '会在擦除槽位之前检查载荷，而这个载荷无法通过检查，所以预计它会在写入任何内容之前拒绝这次写入（一台运行该版本的相机曾以同样的方式拒绝过这个镜像的较早形式）',
  'write.ff.runsSlow': '相机运行的是 8 Hz {version} 版本：{why}。该版本{outcome}。',
  'write.ff.buildUnknown':
    '相机自己的应答没有表明它运行的是哪个 {version} 版本：{why}。如果它运行的是 16 Hz FF 版本，它会接受这个载荷。如果它运行的是 8 Hz 版本，该版本{outcome}。',
  'write.raw.asGiven': '原始载荷：完全按给定的内容发送。这里不会检查它是否可启动。',
  'write.raw.ffStagedForm':
    '这个载荷是 1.3.0.8 FF 的暂存形式（镜像 XOR 密钥块 0，字累加和 0xFFFF）。相机会以密钥 B 存储镜像，所以回读结果会与那些字节比对。',
  'write.raw.noStaging': '此版本没有为该槽位指定暂存形式，因此无法说明引导程序的检查情况。',
  'write.raw.reencrypts':
    '设备会解码这个载荷，并重新加密它保存的内容，所以无法预测存储的字节。在能够判断的情况下，回读结果会按它解密后的镜像进行检查。',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': '引导程序会拒绝这个载荷：{failure}。',
  'write.raw.stageKeyUnchecked':
    '原始字节中不含 2016 年的暂存密钥（密钥块 0），所以这里不检查这个载荷解密后的字累加和。',
  'write.image.rekeyRisk':
    '{name} 中已经存放着引导程序无法接受的镜像。这次写入的结果会是同样的状态。',
  'write.ack.recovery': '恢复槽位 R：写入它需要你确认已了解风险。这里不会检查相机之后能否启动。',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}：写入它需要你确认已了解风险，下一次断电重启后，相机会运行其中存放的任何内容。',
  'write.ack.bootUnnamed': '无法确定当前启动的槽位，因此这个槽位被视为当前启动的槽位',
  'write.ack.recoveryFallback': '恢复槽位 R 是引导程序最后退回使用的副本',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': '空白/0：优先槽位 A，然后 B，然后恢复槽位',
  'boot.cfg0.modernB': '优先槽位 B，然后 A，然后恢复槽位',
  'boot.cfg0.modernRecovery': '优先恢复槽位，然后 A，然后 B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': '未知——{why}',
  'report.nextStart.runs': '{bank}——{why}',
  'upgrade.targetBooted':
    '{name} 既是相机本次启动的槽位，也是它自身升级时写入的槽位。从这台相机运行升级会覆盖它正在运行的镜像。这只是警告：这里不会阻止升级。',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    '相机正在运行它的恢复槽位，而它自身的升级会写入{name}，即它没有在运行的那个槽位。{verdict}这只是警告：这里不会阻止升级。',
  'upgrade.verdict.notRead': '本次检查无法读取{name}，因此不知道其中存放的内容。',
  'upgrade.verdict.blank': '{name} 是空白的，因此升级会写入一个空槽位。',
  'upgrade.verdict.bootableSame':
    '{name} 中存放的可启动镜像与正在运行的槽位相同，升级会替换它；如果升级中途停止，{name} 将无法启动。',
  'upgrade.verdict.bootable':
    '{name} 中存放着可启动的镜像，升级会替换它；如果升级中途停止，{name} 将无法启动。',
  'upgrade.verdict.unknown':
    '本次读取无法确定{name} 是否可启动，因此升级可能会替换一个相机能够启动的镜像。',
  'upgrade.verdict.notBootable':
    '本次读取没有显示{name} 可启动，因此升级不会替换任何相机能够启动的镜像。',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered': '{bank}——引导程序本次启动时进入的槽位（按其记录）',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': '未读取',
  'report.lastStart.noBank': '相机报告 {word}，它不对应任何槽位',
  'report.lastStart.entered': '相机报告它进入了{bank}（活动槽位字 {word}）',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': '无版本',
  'running.why.otherVersion': '相机报告的是 {version}，而只有 {only} 才分两个版本',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts': '相机没有应答槽位判定（GetFirmwareInfo 选择器 6、7、8）',
  'running.why.notRead': '判定所依赖的某个槽位没有被读取，因此无法预测应答',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': '相机应答 {answers}',
  'running.answers.each': 'A {a}，B {b}，R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain': '{answers}，这正是 8 Hz 1.3.0.8 版本对这些槽位的应答（{predicted}）',
  'running.why.ff': '{answers}，这正是 16 Hz FF 1.3.0.8 版本对这些槽位的应答（{predicted}）',
  'running.why.both': '{answers}，而两个版本对这些槽位的应答完全相同，所以这些槽位无法区分它们',
  'running.why.neither': '{answers}，与两个版本都不符（8 Hz：{plain}；16 Hz FF：{ff}）',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    '这个镜像的头部没有注明固件版本，因此无法判断它是否就是相机运行的版本（{camera}）。请确认这是你要写入的镜像。',
  'imageBuild.otherVersion': '这个镜像是固件 {image}；相机运行的是 {camera}。',
  'imageBuild.otherVersionTaken':
    '这个镜像是固件 {image}；相机运行的是 {camera}。在这条固件线上，相机只检查镜像格式是否正确（头部和字累加和），不检查版本，所以它会接受这个镜像，并且从这个槽位启动时运行的就是 {image}。',
  'imageBuild.otherVersionUnchecked':
    '这个镜像是固件 {image}；相机运行的是 {camera}。这台相机是否接受并运行不同的版本，尚未检查过。',
  'imageBuild.otherBuild':
    '这个镜像是 8 Hz {version} 版本；相机运行的是 16 Hz {version} FF 版本。16 Hz 版本在提交载荷时会按自己的 FF 形式检查它，并在擦除槽位之前拒绝不符合的载荷（依据其源代码）。尚未在相机上试过向它写入 8 Hz 版本。',
  'imageBuild.runningUnknown':
    '这个镜像是 8 Hz {version} 版本。相机运行的是 {version}，它有 8 Hz 和 16 Hz FF 两个版本，而相机自己的应答没有表明它运行的是哪一个，因此无法判断这是否就是它的版本。',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': '载荷为 {size} B，太短，无法在 0x200 处容纳头部',
  'bootFail.noMagic': '0x200 处没有镜像魔数（找到的是 {found}，引导程序需要 {needs}）',
  'bootFail.lengthOutside': 'header.length {length} 超出了 {size} B 的载荷',
  'bootFail.lengthNotPayload': 'header.length {length} 不等于载荷长度 {size}',
  'bootFail.overStage': '{size} B 超过了 {max} B 的暂存区',
  'bootFail.plainSum': '存储的字累加和为 {sum}，2014 年的引导程序要求为 0',
  'bootFail.noFooter': '{offset} 处没有尾部：载荷在 {end} 处结束',
  'bootFail.footerNotCode': '{offset} 处的尾部不是“CODE”——引导程序会采用其分段加载器',
  'bootFail.footerLength': '尾部长度不等于 header.length {length}',
  'bootFail.keyASum': '用这台相机的密钥 A 解密后，字累加和为 {sum}，引导程序需要 {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': '已通过校验和验证',
  'keyConfidence.structural': '仅通过向量表验证',
  'keyConfidence.unverified': '未验证',
  /** `{sum}` is hex. */
  'keyCheck.family': '密钥已通过校验和 {sum} 验证',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': '密钥{phrase}；校验和 {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': '按相机自身的密钥暂存',
  'staging.phrase.slotKeystreamCiphertext': '按镜像自身的密钥暂存',
  'staging.phrase.plain': '以明文暂存',
  'staging.phrase.keyAKeystream': '按厂商应用暂存 FF 镜像的方式暂存（XOR 密钥 A）',
  'staging.phrase.verbatim': '按给定内容发送',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed': '已向{name}（{address}）提交 {size} B，{staged}；提交状态 {status}',
  'written.noReadWindow': '此版本没有为该槽位指定读取窗口，因此没有回读任何内容',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': '回读失败：{error}',
  'written.readBack': '已回读 {size} B，SHA-256 {sha256}',
  'written.verifyOff': '验证已关闭：没有回读该槽位',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    '计划预测该槽位会存放的字节（16 Hz 版本存储的镜像形式，而不是发送的字节）',
  'readBack.reference.asSent': '计划预测该槽位会存放的字节（即发送的字节）',
  'readBack.sizeDiffers':
    '回读结果为 {size} B，计划预测为 {predictedSize} B：该槽位与{reference}并不一致',
  'readBack.matchesFolded':
    '该槽位存放的是 16 Hz 版本存储形式的镜像（而不是发送的字节），槽位的其余部分已擦除',
  'readBack.matches': '该槽位与计划预测的字节一致（2014 年的明文链写入的正是它收到的内容）',
  'readBack.differs': '该槽位与{reference}并不一致（第一处差异在 {offset}）',
  'readBack.noHeader':
    '回读结果在 {offset} 处没有镜像头部（魔数 {magic}），因此该槽位解密后并不是预期的镜像',
  'readBack.lengthDiffers':
    '回读结果的头部表明长度为 {length} B，而计划中的镜像为 {imageLength} B：该槽位解密后并不是预期的镜像',
  'readBack.tooShort':
    '回读结果为 {size} B，对 {length} B 的镜像来说太短：该槽位解密后并不是预期的镜像',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': '从回读结果中恢复的密钥流（{check}）',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': '使用{recovered}，该槽位解密后正是预期的镜像（{length} B）',
  'readBack.decryptDiffers':
    '使用{recovered}，该槽位解密后并不是预期的镜像：第一处差异在镜像偏移 {offset}',
  'readBack.rawNotCompared':
    '原始字节：已报告回读结果，但没有比对（这些字节在这种形式下不能解密为可预测的明文镜像，而且设备会重新加密它保存的内容）',
  'readBack.notCompared': '无法比对：计划既无法预测存储的字节，也无法预测明文镜像',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': '密钥 A',
  'keyName.keyB': '密钥 B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': '设备专属密钥',
  'keyName.thePerDevice': '该设备专属密钥',
  'keyName.applicationKeyA': '应用程序的密钥 A',
  'keyName.applicationKeyB': '应用程序的密钥 B',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': '密钥块 1',
  'keyName.theDeviceKey': '设备密钥',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': '未知密钥',
  'keys.noKnownKey': '没有已知密钥',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    '2014 年的明文链：每个槽位都以明文存储，因此不推导上传密钥；上传的就是镜像本身',
  'keys.evidence.ffVendor':
    '1.3.0.8 FF（16 Hz）版本：本次读取打开的槽位都不是以明文存储的，因此不能表明相机属于 2014 年的明文链；FF 镜像以厂商形式写入，原始字节按给定内容发送，不会写入 8 Hz 明文镜像',
  'keys.evidence.ffUntested':
    '提供 FF 镜像的写入，但附有 UNTESTED（未经测试）警告：资料库中没有这个版本的真实引导程序，因此写入的槽位能否启动尚未测得',
  'keys.evidence.line2016':
    '2016 年的 Compact PRO 固件线：上传的数据是镜像与其自身密钥块 0（按值在镜像中找到）的密钥流异或的结果，因此不需要这台相机的任何密钥来构造',
  'keys.evidence.checkKeyUnnamed':
    '相机用该密钥解密上传的数据，再以其引导程序检查槽位时使用的密钥重新加密；本次读取没有指明那个密钥，而写入也不需要它：会按槽位解密后的镜像来回读检查',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    '相机用该密钥解密上传的数据，再以其引导程序检查槽位时使用的密钥重新加密；本次读取没有指明那个密钥（{why}），而写入也不需要它：会按槽位解密后的镜像来回读检查',
  'keys.evidence.checkKeyNamed':
    '相机用该密钥解密上传的数据，再以{key} {hex}（其引导程序检查槽位时使用的密钥）重新加密，因此它写入的每个槽位都以引导程序接受的方式存储',
  'keys.evidence.checkKeyInferred':
    '相机用该密钥解密上传的数据，再以{key} {hex}（其引导程序检查槽位时使用的密钥，是从{bank} 推断得出的——相机报告它进入了该槽位，而引导程序进入它时没有检查）重新加密，因此它写入的每个槽位都以引导程序接受的方式存储',
  'keys.evidence.checkKeyNamedFrom':
    '相机用该密钥解密上传的数据，再以{key} {hex}（其引导程序检查槽位时使用的密钥，根据相机报告它进入的{bank} 指明）重新加密，因此它写入的每个槽位都以引导程序接受的方式存储',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    '正在运行的应用程序（{bank}，固件 {firmware}）在 {keyAAt} 处带有它的密钥 A {keyA}，来自{source}',
  'keys.evidence.applicationKeys':
    '正在运行的应用程序（{bank}，固件 {firmware}）在 {keyAAt} 处带有它的密钥 A {keyA}，来自{source}，并在 {keyBAt} 处带有它的密钥 B {keyB}',
  'keys.source.keyTable': '引导程序的密钥表',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': '{builds} 的已解码应用程序密钥对',
  'keys.evidence.perDevice': '已烧录设备专属密钥，因此应用程序会以它重新加密',
  'keys.evidence.noPerDevice': '没有烧录设备专属密钥，因此应用程序会以它自己的密钥 B 重新加密',
  'keys.evidence.storeKey':
    '应用程序的存储密钥就是引导程序的{key}（{hex}），因此写入时每个槽位都以它存储；当前启动的{bank} 持有{held}，引导程序同样接受',
  'keys.evidence.bootedKey':
    '当前启动的{bank} 可用{key}（{hex}）解密，这是引导程序会尝试的密钥；应用程序的存储密钥不是引导程序的密钥，因此写入时每个槽位都以当前启动槽位的密钥存储',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks': '上传的数据是镜像与{masks} 的密钥流异或的结果；设备以{key} 存储镜像',
  /** `{held}` is a key name or keys.noKnownKey. */
  'keys.evidence.otherBank': '{bank} 可用{held} 解密；按同样的规则，它以{key} 写入，并回读检查',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed': '无法确定当前启动的槽位，因此无法从中读出槽位存储所用的密钥',
  'keys.refused.notDerived': '无法推导出密钥',
  'keys.refused.notDecrypted': '当前启动的{bank} 无法解密为镜像，因此无法读出它存储所用的密钥',
  'keys.refused.noBootKey':
    '当前启动的{bank} 无法用引导程序会尝试的任何密钥（它的密钥 A 或存储密钥）解密，因此无法从中读出槽位存储所用的密钥',
  'keys.refused.keyNotInTable':
    '当前启动的{bank} 可用{key} 解密，但这台相机的密钥表中没有该密钥，因此无法以它写入',
  'keys.refused.noApplicationPair':
    '正在运行的应用程序（{bank}，固件 {firmware}）中没有任何已知密钥对（引导程序的密钥对和已解码的应用程序密钥对）是两半各恰好出现一次的，因此无法在其镜像中定位它的密钥 A',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    other:
      '正在运行的应用程序（{bank}，固件 {firmware}）中没有任何已知密钥对（引导程序的密钥对和已解码的应用程序密钥对）是两半各恰好出现一次的，因此无法在其镜像中定位它的密钥 A（引导程序的密钥 A 出现 {count} 次，密钥 B 出现 {keyB} 次）',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    '正在运行的应用程序（{bank}，固件 {firmware}）在写入上传的数据之前会用自己的密钥检查它（这个版本解码后的源代码会用它的密钥 A 和存储密钥尝试上传的数据，就像其引导程序检查槽位一样），而写入所用的存储密钥{key}（{hex}）既不是它的密钥 A，也不是它的存储密钥，因此相机会在擦除任何内容之前以 0x50000 拒绝这次上传',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum': '没有任何槽位解密后得到 {family} 的校验和 {sum}',
  'writeRefusal.keyTable': '无法确认这台相机的密钥表',
  'writeRefusal.whitening': '这台相机的密钥表在 K={k} 下解析，但 {family} 在 K={expected} 下加密',
  /** `{reasons}`: the detection's evidence (detect.*), joined with "; ". */
  'writeRefusal.otherFamily': '证据表明这台相机是 {detected}，而不是 {family}（{reasons}）',
  /** `{reasons}`: writeRefusal.* joined with "; ". */
  'writeRefusal.camera': '无法从这里写入这台相机：{reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Seek 2018 年及以后的版本（2.x、4.x、10.x、42.x、44.x）：Compact 4.8/4.16、Compact Pro 4.9/4.18、Compact Pro FF、Compact XR、Mosaic 2.27/10.9、Nano 200 和 Nano 300。导出无需任何解锁即可读取闪存 64 个块中的 63 个；在这些版本上，任何读取都无法访问 {block} 处的块。固件以加密形式存储。在“固件槽位操作”标签页上一次写入一个槽位。',
  'family.summary.early':
    '早于 0.8.0.0 的 2014 年 Compact：0.3.0.1、0.5.0.2、0.5.1.0、0.5.1.3、0.6.0.4、0.7.0.7 和 0.7.0.8。它们的固件无法应答导出发送的读取命令，因此“导出”、“导出全部选择器”、“信息”标签页的完整读取以及“固件槽位操作”标签页会在读取版本后拒绝它们；在 0.3.0.1 上，导出开头发送的命令反而会启动一次固件升级。0.x/1.x 标签页的完整备份流程会通过这两个版本能应答的另一个命令读取 0.7.0.7 和 0.7.0.8。用其他方式导出的镜像照常可以解密。',
  'family.summary.compact2016':
    'Compact PRO 1.0.3.x 版本（1.0.3.0 和 1.0.3.2）。它们应答读取的方式与 2014 年的 Compact 完全相同，包括解锁令牌，因此要靠版本号和槽位的存储方式来区分：它们是加密存储的，而 2014 年的槽位是明文。1.0.3.x 相机从一开始就按这个固件系列读取。0.x/1.x 标签页的完整备份流程会读取整片闪存，槽位在“固件槽位操作”标签页上一次写入一个。',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    '0.8.0.0 到 1.3.0.8 的 2014 年 Compact，包括 16 Hz 的 1.3.0.8 FF 版本。原厂相机只允许读出不到一半的闪存，其中一部分还需要本工具箱发送解锁令牌才能读出；0.x/1.x 标签页的完整备份流程会通过一个临时补丁读取其余部分。除 FF 版本外，槽位都以明文存储。Compact PRO 1.0.3.x 相机按 compact-2016 读取，只有当某个槽位以明文存储或解密后得到 {sum}（就像 FF 版本的槽位那样）时，才会归到这里。在完整备份流程测量过的版本上，可以在“固件槽位操作”标签页上写入槽位；其他 0.x 或 1.x 版本只能读取。',
  'family.summary.generic':
    '不符合任何其他固件系列的相机。`seek-fw dump` 会用 4.x 的块列表读取它（4.x/Nano 标签页会拒绝它），解密则从镜像本身求出密钥，所以两者都不依赖这个猜测。不会写入任何槽位：在识别出相机之前，“固件槽位操作”标签页会拒绝它。',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with "; ".
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': '镜像头部表明',
  'detect.source.camera': '相机报告',
  'detect.plainArmedNotInForce':
    '一个普通的 2 字节 BeginFirmwareUpgrade 打开了受保护的槽位，因此认证读取通道并未生效',
  'detect.modern.plainRefused':
    '一个对受保护槽位的普通 2 字节 BeginFirmwareUpgrade 被拒绝了，而这条固件线上没有任何版本会这样做——它的处理程序没有令牌检查，在每个槽位上都接受普通通道',
  'detect.modern.authArmed':
    '一个受保护的槽位在 18 字节的认证选择器上被打开；那里没有尝试普通选择器，所以这并不能把这台相机排除在这条固件线之外',
  'detect.modern.legacyVersion':
    '{said}固件 {version}，它属于 0.x / 1.x 旧固件线（这是另一套编号，不是更早的 4.x——而且其中一个版本也会得到 {sum} 这个和值）',
  'detect.modern.noSum': '没有任何槽位解密后得到该固件系列引导程序要求的校验和 {sum}',
  'detect.modern.sum': '有槽位解密后得到校验和 {sum}',
  'detect.modern.version':
    '固件 {version} 属于这个选择器映射适用的 2018 年后固件线（2.x / 4.x / 10.x / 42.x / 44.x：Compact、Compact Pro、Compact XR、Mosaic、Nano）',
  'detect.modern.plainWorks':
    '一个普通的 2 字节 BeginFirmwareUpgrade 打开了受保护的槽位，因此这不是加锁的旧固件',
  'detect.modern.none': '没有证据表明这台相机属于 2018 年后的固件线',
  'detect.early.noVersion': '没有报告固件版本，镜像头部中也没有找到',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    '固件 {version} 为 {first} 或更新的版本，因此它的 RPC 表中有 GetFeaturedFirmwareData 的读取处理程序（getter），可以走普通读取路径',
  'detect.early.older':
    '{said}固件 {version}，早于 {first}——这是第一个在 RPC 方法表中带有 GetFeaturedFirmwareData 读取处理程序（getter）的版本',
  'detect.early.noWindow': '而且无法读取任何窗口，这正符合上述推断',
  'detect.generic.fallback': '后备：没有固件系列能可靠匹配，因此仍可读取，但不能写入',
  'detect.compact2016.early':
    '固件 {version} 早于 0.8.0.0，没有 GetFeaturedFirmwareData 的读取处理程序——那是 early-compact，不是这个固件系列',
  'detect.compact2016.modernSum': '有槽位解密后得到校验和 {sum}，这不是这一代的目标值',
  'detect.compact2016.plainArmed':
    '一个普通的 2 字节 BeginFirmwareUpgrade 打开了受保护的槽位，因此这台相机不在这个固件系列与 legacy-auth 共用的加锁固件线上',
  'detect.compact2016.notLine': '固件 {version} 不属于 0.x / 1.x 固件线',
  'detect.compact2016.storedPlain':
    '有槽位以明文存储——密钥流求解得到的是恒等状态，所以它存储的字就是镜像本身——这是 2014 年的明文链；这一代的槽位是用真实密钥进行 xorshift128 加密的',
  'detect.compact2016.keyedZero':
    '一个以真实 xorshift128 密钥流存储的槽位解密后得到校验和 {sum}，这正是这一代的加密方式',
  'detect.compact2016.zeroSum': '有槽位解密后得到校验和 {sum}，这正是这一代的目标值',
  'detect.compact2016.refused': '而且受保护的槽位拒绝了普通的 2 字节打开请求，这是加锁的处理程序',
  'detect.compact2016.proLine': '{said}固件 {version}，属于 2016 年 Compact PRO 的 1.0.3.x 固件线',
  'detect.compact2016.compactLine':
    '{said}固件 {version}，这是 Compact 的版本，不属于 Compact PRO 的 1.0.3.x 固件线',
  'detect.compact2016.lockedLine':
    '{said}固件 {version}，属于这一代与加锁的旧固件共用的 0.x / 1.x 固件线',
  'detect.compact2016.bootloader2016':
    '引导程序报告 {version}，这是 2016 年一代的引导程序（1.2.0.0 是在 Compact PRO 1.0.3.0 上测得的；2014 年 Compact 的是 0.9.0.0）',
  'detect.compact2016.bootloader2014':
    '引导程序报告 {version}，这是 2014 年一代的编号，而不是这一代的',
  'detect.compact2016.none': '没有观察到任何槽位在真实密钥下解密得到为零的校验和',
  'detect.legacy.proLine':
    '但固件 {version} 属于 2016 年 Compact PRO 的 1.0.3.x 固件线，其槽位使用 compact-2016 的加密方式：这个固件系列的校验会让它们全部不通过',
  'detect.legacy.early':
    '固件 {version} 早于 0.8.0.0：它的 RPC 表中没有 GetFeaturedFirmwareData 的读取处理程序（0.7.0.7 之前完全没有，0.7.0.7 和 0.7.0.8 上只有 setter）——那是 early-compact，不是这个固件系列',
  'detect.legacy.keyedZero':
    '一个以真实 xorshift128 密钥流存储的槽位解密后得到 {zero}——这是 2016 年 Compact PRO 的加密方式（compact-2016）。这条固件线的槽位要么以明文存储、字累加和为 0（2014 年的明文链），要么加密后和值为 {sum}（Compact 1.3.0.8），这样的槽位无法通过它的校验',
  'detect.legacy.plainChain':
    '有槽位以明文固件存储，其字累加和为 0，正如这条固件线的 2014 年引导程序启动它的方式',
  'detect.legacy.refused':
    '在没有解锁的情况下请求为升级打开加锁的槽位时，相机拒绝了，而只有这一代固件会这样做',
  'detect.legacy.unlocked':
    '而在带解锁请求时，它打开了同一个槽位，所以这个固件系列发送的解锁正是这台相机检查的那一个',
  'detect.legacy.notLine': '{said}固件 {version}，它不属于 0.x / 1.x 旧固件线',
  'detect.legacy.authOnly':
    '在带解锁请求时，它为升级打开了加锁的槽位，这一代固件正是如此；没有尝试不带解锁的请求，所以仅凭这一点无法证明是这一代',
  'detect.legacy.version':
    '固件 {version} 属于 0.x / 1.x 旧固件线，这与 2018 年后的应用程序版本是不同的编号体系，并不是更早的 4.x',
  'detect.legacy.none': '没有观察到任何迹象指向认证读取通道',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    '在一台相机上运行后暂不提供：在那台相机上，补丁没有提高发布帧率，而且写入后每一帧都会触发快门',
  'fps.table.predates':
    '固件 {version} 早于 0.8.0.0：它的 RPC 表中没有 GetFeaturedFirmwareData（槽位读取发送的命令）的读取处理程序，因此槽位功能不会读取或写入这个版本的任何槽位，也不提供补丁',
  'fps.table.stageTwoFf':
    'stage two：16 Hz FF 版本按厂商应用的方式暂存（镜像 XOR 密钥 A，以密钥 B 存储），而不是以明文字节暂存，因此它的暂存检查尚未完成，暂不提供补丁',
  'fps.table.stageTwo':
    'stage two：这个条目不在 stage two 集合中，因此它的暂存检查尚未完成，暂不提供补丁',
  'fps.table.notOffered': '不提供',
  'fps.table.notImage': '这不是固件镜像，因此不适用任何帧率补丁',
  'fps.table.otherBuild':
    '镜像是 {image} 版本（“{id}”），但相机报告的是 {camera}；补丁不会应用到与它不匹配的版本上，因此被拒绝',
  'fps.table.otherBuildNoVersion':
    '镜像是 {image} 版本（“{id}”），但相机没有报告版本；补丁不会应用到与它不匹配的版本上，因此被拒绝',
  'fps.table.patched': '帧率补丁已经应用：此镜像以 {hz} Hz 运行',
  'fps.table.earlierPatch':
    '此镜像带有较早的、不含 USB 修复的 {hz} Hz 帧率补丁，而补丁绝不会应用到已打过补丁的镜像上：请先还原原厂镜像，再打补丁',
  'fps.table.atRate': '此版本不打补丁就已经以 {hz} Hz 运行',
  'fps.table.not4821':
    '此镜像报告为 Compact 4.8.2.1 版本（或 Compact XR 4.8.2.1，同一个版本），但它不是帧率补丁所针对的原厂镜像（f96ac57eda75：68 字节的命令页，稳定页 13），因此不会为它制作帧率补丁',
  'fps.table.notInTable':
    '此镜像不在帧率补丁表中，因此不会为这个版本制作帧率补丁。该表列出的是 Compact 0.7.0.8 到 1.3.0.8（8 Hz；0.7.0.8 会被槽位功能的代码拒绝）、1.3.0.8（16 Hz FF）、4.8.1.7、4.8.1.9、4.8.2.1 和 4.16.1.7 FF 版本，以及 Compact PRO 1.0.3.x 和 4.9.x 版本；其他版本都没有条目',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': '此版本的计划中没有{bank}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '在此版本上，{bank} 不能接受解密后的镜像：{reason}',
  'fps.plan.empty': '{bank} 中没有可修补的解密镜像（它是空的）',
  'fps.plan.noImage': '{bank} 中没有可修补的解密镜像（它没有被读取，或者没有密钥能打开它）',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} 已写入，但它的回读结果与保存的槽位相比，差异不只是计划中的那些，因此其后的槽位都没有写入',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}：{error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    '在这条固件线上，所说的当前启动槽位是相机上次启动时进入的槽位，按活动槽位字的记录（0 为槽位 A，1 为槽位 B，2 为恢复槽位 R）。下次启动由启动配置字决定：0 或 0xFFFFFFFF 先选 A，1 先选 B，其他任何值先选恢复槽位 R。只要 A 和 B 中都没有 2014 年引导程序接受的内容（字累加和为 0 的槽位），无论 R 中存放的是什么，都会运行恢复槽位 R（已在相机上测得）。',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    '在这条固件线上，所说的当前启动槽位是相机上次启动时进入的槽位，由引导程序记录在活动槽位字中（0 为槽位 A，1 为槽位 B，2 为恢复槽位 R）。下次启动由启动配置字决定：0 或 0xFFFFFFFF 先选 A，1 先选 B，其他任何值先选恢复槽位 R。2016 年的引导程序只有在槽位用它检查槽位的密钥（其 1.2.0.0 引导程序上为密钥块 1）解密后字累加和为 0 时才接受该槽位；当另外两个都不通过时，该顺序中的最后一个槽位会不经检查直接运行。由于存放该密钥的引导程序块在所有通道上都被拒绝读取，本次读取根据相机进入的槽位来指明该密钥（已在相机上测得）。',
  'notes.ep0of1032':
    '1.0.3.2：EP0 会话在大约 64 到 81 KB 时中断，128 B 是无损读取单位，因此每个会话读取一个 64 KB 槽位是测得的上限。这个版本拒绝整片闪存读取（PRESERVATION.md：不存在单次打开的整片读取）。槽位导出一次读取一个槽位，每次请求 64 字节。',
  'notes.token':
    '这条固件线上的槽位是加锁的：只有在请求附带该固件线的解锁时，相机才会为写入打开槽位；在已记录的这条固件线的全部 22 个固件镜像中，这个解锁都相同。使用其他解锁的相机会拒绝打开它的槽位。',
  'notes.staging.lockedPlain':
    '暂存：镜像本身，最多 56 KB（相机一次写入最多接受的大小）。写入会擦除 64 KB 槽位并准确写入这些字节，槽位的其余部分读出为已擦除状态。引导程序只有在槽位的字累加和为 0 时才会启动它，所以镜像在发送之前会被平衡到这个和值。',
  'notes.staging.locked2016':
    '暂存：镜像与其自身密钥块 0（暂存密钥，按值在镜像中找到）的 xorshift128 密钥流异或，仅为镜像长度（最多 0xE000 字节）。设备用该密钥解密载荷，再以其引导程序检查槽位时使用的密钥（密钥块 1）存储，因此存储的字节与暂存的字节不同。暂存时不会从目标槽位读取任何内容：该槽位的密钥流只用于回读槽位。',
  'notes.staging.modern':
    '暂存：整个 64 KB 槽位，即镜像 + 0xFF 填充 + “CODE”尾部。镜像会与特定的密钥流异或，使正在运行的应用程序自己的两轮处理最终以当前启动槽位持有的密钥存储它：当提交命令（CompleteMemoryUpgrade）收到数据类型 7、8 或 9 时，应用程序用它的密钥 A 解密上传的数据，再以它的存储密钥重新加密并写入槽位。正是尾部让引导程序接受该槽位，所以缺少尾部的槽位会被拒绝。',
  'notes.modernGap':
    '在这条固件线上，槽位 B 位于 0x14050000（模式 8）。在任何 2.x、4.x、10.x、42.x 或 44.x 版本上，都没有选择器能访问 0x14060000（根据 14 个 2018 年后的资料库镜像解码得出），所以那里没有槽位。0x14060000 的布局属于加锁的 0.x/1.x 固件线。',
  'notes.modernNamedWrite':
    '命名写入（模式 7 到 9）是从固件中解码出来的。模拟器在 4.x 版本上通过它们写入 A、B 和 R；在相机上，帧率补丁曾通过模式 7 写入一台 Compact XR 4.8.2.1 的槽位 A。槽位写入绝不会打开模式 0，即升级目标。',
  'notes.unverified':
    '只读。槽位布局采用加锁固件线的已解码表，但还没有为这个版本测得任何暂存形式，所以不规划任何写入。',
  'notes.empty.plain':
    '空槽位接受镜像的方式与已用槽位完全相同。明文链按原样暂存镜像字节，不使用密钥，提交时会先擦除该块，所以不会从目标槽位读取任何内容。已在一台 Compact 上测得：写入空槽位 B 的镜像回读结果完全相同，并且仅凭 B 就能启动。',
  'notes.empty.modern':
    '空槽位接受镜像的方式与已用槽位完全相同。载荷使用由当前启动槽位和正在运行的应用程序推导出的密钥加密，而不是由目标槽位推导，设备会重新加密它，并在不读取的情况下擦除该块。尾部从存有有效尾部的槽位复制，否则构造一个空白尾部。已在模拟器上证实；尚未在相机上测得。',
  'notes.empty.locked2016':
    '空槽位接受镜像的方式与已用槽位完全相同。暂存密钥是镜像自身密钥对中的密钥块 0，而不是从目标槽位读取的密钥；设备用它解密载荷，以自己的密钥存储，并在不读取的情况下擦除该块。已在模拟器上证实；尚未在相机上测得。',
  'notes.mode2of080':
    '0.8.0.0：在这个版本上，模式 2（0x14000000）有导致崩溃的风险，打开后的读取会越出 SRAM 范围（PRESERVATION.md）。槽位读取或写入只会打开模式 7 到 9，绝不会打开模式 2。',
  'notes.keyPairs2016':
    '1.0.3.0 和 1.0.3.2 的 9 Hz 版本共用一对密钥，FF 版本共用另一对。版本字符串无法区分它们，所以密钥流是从槽位本身恢复的，由槽位自己的镜像决定。',
  'notes.board1030':
    '1.0.3.0 应用程序在 Compact Pro 以外的任何主板上都会重启，所以只有槽位中带有主板补丁时，Compact 主板才能运行它。',
  'notes.bank.modernA':
    '通过现代映射遗漏的一种槽位打开方式写入；在相机上，一台 Compact XR 4.8.2.1 曾通过它接受写入。',
  'notes.bank.recovery2016':
    '已在一台 Compact PRO 1.0.3.0 上测得：恢复槽位 R 接受了它自己的镜像、一个改动一个字节的镜像，以及按发送原样的原始字节，每次写入都没有出错。',
  'notes.bank.ff1308A':
    '1.3.0.8 FF（16 Hz）镜像以厂商应用发送的形式写入这里，相机会以它自己的密钥存储。2014 年的引导程序只有在槽位的字累加和为 0 时才会启动它，因此启动时会跳过这个槽位；16 Hz 版本能否从槽位 A 启动尚未测试（UNTESTED）。8 Hz 镜像按原样写入。',
  'notes.bank.ff1308B':
    '1.3.0.8 FF（16 Hz）镜像以厂商应用发送的形式写入这里，相机会以它自己的密钥存储。2014 年的引导程序只有在槽位的字累加和为 0 时才会启动它，因此启动时会跳过这个槽位；16 Hz 版本能否从槽位 B 启动尚未测试（UNTESTED）。8 Hz 镜像按原样写入。',
  'notes.bank.ff1308R':
    '1.3.0.8 FF（16 Hz）镜像以厂商应用发送的形式写入这里，相机会以它自己的密钥存储。0.9.0.0 引导程序按存储原样启动恢复槽位 R，不会对其解码，所以这种形式可能无法启动：尚未测试（UNTESTED），而这个镜像的较早形式曾从这里启动（已在相机上测得）。8 Hz 镜像按原样写入。',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 和 Compact XR 4.8.2.1（同一个镜像）：现代的 63 窗口映射；模拟器在 Compact 和 Compact XR 的完整导出上都确认了 63 个窗口中的全部 63 个。',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31：现代的 63 窗口映射，在模拟器上测得每个窗口都已确认。',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33：现代的 63 窗口映射，在模拟器上测得每个窗口都已确认。',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10：现代的 63 窗口映射，在模拟器上测得每个窗口都已确认。它的提交命令（CompleteMemoryUpgrade）没有数据类型 32 的处理程序，而通过模式 7、8 或 9 的写入从不请求该类型。',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10：现代的 63 窗口映射，在模拟器上测得每个窗口都已确认。它的打开命令（BeginFirmwareUpgrade）会把超出其接受范围（0x7F）的数据类型当作错误的第一个参数拒绝，而模式 7 到 9 在该范围之内。',
  'notes.ff1308':
    '1.3.0.8-FF（16 Hz）报告的版本号与 8 Hz 版本相同。读取时由相机来区分它们：相机会逐个槽位说明它的应用程序是否接受该槽位，而每个版本都会根据槽位预测自己的应答。FF 镜像以厂商应用发送的形式发送，相机会以它自己的密钥存储。它可以写入槽位 A、槽位 B 或恢复槽位 R。预计 8 Hz 版本会在写入任何内容之前拒绝它；当相机的应答无法区分这两个版本时，计划会说明每个版本会如何处理它。{untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    '相机没有报告它的固件版本（{note}）；同一个命令编号并非在每个 Seek 固件上含义都相同——在 Compact 0.3.0.1 上，用于打开读取窗口的线路 ID 0x52 是 EnterBootloaderMode——因此在知道版本之前，除了 GetErrorCode、GetOperationMode 和 GetFirmwareInfo（所有版本应答方式都相同的读取）之外，不会发送任何命令',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with "; ". */
  'identity.note.startup':
    'GetFirmwareInfo 在间隔 {spacing} ms 的 {reads} 次读取中都没有应答（{error}），启动等待窗口为 {window} ms；仍在启动的相机会在此窗口内应答',
  'identity.note.neverTwice': '在 {reads} 次读取中，GetFirmwareInfo 从未连续两次应答',
  'identity.note.noAnswer': 'GetFirmwareInfo 没有应答（{error}）',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo 没有应答（{error}）；{reads} 次读取中有 {answered} 次应答，但从未连续两次，因此无法把其中任何一次与之前的命令遗留选中的记录区分开',
  'identity.note.tooShort': { other: 'GetFirmwareInfo 只应答了 {count} 个字节，不足以构成版本号' },
  'identity.note.tooShortContext': {
    other: 'GetFirmwareInfo 只应答了 {count} 个字节，不足以构成版本号；{context}',
  },
  'identity.note.otherRecord':
    '第一次读取应答的是另一条记录（{version}），这是之前的命令让固件信息选择器停留在那里造成的——那次读取已将其清除',
  'identity.note.afterStartup': { other: '它在启动期间拒绝了 {count} 次读取之后才应答' },
  'identity.predates':
    '固件 {version} 早于导出协议：它的 RPC 方法表中没有 GetFeaturedFirmwareData 的读取处理程序（在 0.7.0.7 和 0.7.0.8 上它只注册为 setter，更早的版本中线路 ID 0x4F 是 UploadFirmwareRowSize），因此无法用它读取任何窗口；在 0.3.0.1 上，线路 ID 0x52 是 EnterBootloaderMode，而不是 BeginFirmwareUpgrade。0.x/1.x 标签页的完整备份流程改为通过线路 ID 0x58（GetFeaturedData）读取 0.7.0.7 和 0.7.0.8',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': '拒绝{operation}：{reason}',
  'identity.refusingNoVersion':
    '拒绝{operation}：{reason}。没有打开任何读写窗口。请拔下相机，再重新插上，等它完成启动后重试。',
  'identity.operation.dump': '导出',
  'identity.operation.dumpAll': '导出全部选择器',
  'identity.operation.readInfo': '读取设备信息',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup': '槽位要在备份读取它们之后才能选择——请先运行备份',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    '提交一旦运行或尝试过，槽位就不能再更改：本次运行写入{banks}，还原时也只会放回这些槽位',
  'preserve.banks.none': '没有槽位',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': '已写入。',
  /** `{count}` of `{of}` slots answered. */
  'status.read': '已读取。{of} 个槽位中有 {count} 个可读。',
  'status.readRefused': '已读取，但无法从这里写入这台相机的任何槽位——请查看日志。',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': '固件版本',
  'compare.field.imageId': '镜像 ID',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': '初始 SP',
  'compare.field.resetVector': '复位向量',
  'compare.field.size': '大小',
  'compare.field.shaExpected': '预期明文镜像的 SHA-256',
  'compare.field.sha': '镜像的 SHA-256',
  'compare.field.shaNotStored': '预期明文镜像的 SHA-256（无法预测存储的字节）',
  'compare.field.key': '密钥',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '（无镜像）',
  'compare.notImage': '（不是镜像）',
  'compare.notPredicted': '（无法预测：由设备决定存储什么）',
  'compare.plaintext': '无（明文）',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': '两次读取的结果不一致',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why}（引导程序检查槽位所用的密钥是从{bank} 推断得出的，引导程序进入该槽位时没有检查）[inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}，按相机的记录（活动槽位字 {word}）',
  'preserve.lastStart.notRead': '未知——无法读取活动槽位字',
  'preserve.lastStart.noBank': '未知——活动槽位字为 {word}，它不对应任何槽位',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank}——{why}',
  'preserve.nextStart.unknown': '未知——{why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': '不写入——{reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': '一个镜像',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build}——可以写入',
  'preserve.bank.writablePatch': '{build}——可以写入；补丁会改变 {count} 个字节',
  'preserve.bank.writableEdit': '{build}——可以写入；带有 {edit}',
  'preserve.bank.writablePatchEdit': '{build}——可以写入；补丁会改变 {count} 个字节；带有 {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead': '备份尚未读取槽位，因此还不能选择槽位',
  'preserve.choice.every': '每个存有镜像的槽位：{banks}',
  'preserve.choice.everyBlocked': '无法写入每个存有镜像的槽位：{bank} 不能——{reason}',
  'preserve.choice.noImage': '没有任何槽位存有本次运行可以写入的镜像',
  'preserve.choice.nextStart': '{bank}，即下次启动进入的槽位：{why}',
  'preserve.choice.nextStartRefused':
    '下次启动会进入{bank}（{why}），而本次运行无法写入它：{reason}',
  'preserve.choice.everyUnknownStart':
    '每个存有镜像的槽位（{banks}）：不知道下次启动会进入哪个槽位（{why}）',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    '不知道下次启动会进入哪个槽位（{why}），而且{reason}；请按名称选择一个槽位',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} 无法写入：{reason}',
  'preserve.choice.byName': '{banks}，即按名称选择的槽位',
  'preserve.choice.warnNotPatched':
    '下次启动会进入{bank}（{why}），而这个选择不会修补它：重启后相机运行的是该槽位自己的镜像，所以全闪存读取会在读取任何内容之前停止。还原仍会把每个已写入的槽位放回原样。',
  'preserve.choice.warnUnknownStart':
    '不知道下次启动会进入哪个槽位（{why}）。如果它进入的是这个选择不修补的槽位，全闪存读取会在读取任何内容之前停止。',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': '尚不知道',
  'preserve.build.firmware': '固件 {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain': '按相机存储的原样（这台相机以未加密形式保存固件）',
  'preserve.stagedForm.oneKey': '按相机存储的形式（以相机的密钥加密）',
  'preserve.stagedForm.twoKeys': '按相机存储的形式（以相机的两个密钥加密）',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim': '每个已写入的槽位都会恢复为备份从中读出的原样字节',
  'preserve.restoreForm.factoryStaged':
    '每个已写入的槽位都会恢复其原始固件，以相机存储的形式写入，因此槽位最终与备份读出的内容逐字节相同',
  'preserve.restoreForm.none':
    '在此版本上无法做到：原始固件没有任何一种形式既能通过相机自身的检查、又能存回为原始字节，所以本次运行将以完整镜像结束，补丁仍保留在相机中',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with "; ". */
  'preserve.drain.notPossible':
    '在此版本上无法做到：打过补丁的固件无法读取整片闪存，所以本次运行无法提供完整镜像',
  'preserve.drain.rotated': '相机提供的数据是轮转过的，本次运行会把它恢复为正确顺序',
  'preserve.drain.hazard': '补丁避开了此版本上会导致相机崩溃的一种读取',
  'preserve.drain.whole': '一次读取整个 4 MB 闪存，每次 {size} 字节',
  'preserve.drain.wholeNotes': '一次读取整个 4 MB 闪存，每次 {size} 字节；{notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash': '让相机的读取命令能访问整个 4 MB 闪存，而不只是前 64 KB',
  'preserve.site.countPast': '让读取位置可以计数超过 64 KB，使读取不会绕回开头',
  'preserve.site.keepPosition': '每次读取后前移时保留完整的读取位置',
  'preserve.site.savePosition': '完整保存前移后的读取位置',
  'preserve.site.clearPosition':
    '每次开始读取时清除完整的读取位置，使相机在全闪存读取之后仍可被读取',
  'preserve.site.modeTwoGuard': '让全闪存读取像其他读取一样开始（原厂固件会拒绝它）',
  'preserve.site.modeTwoIndirection':
    '让全闪存读取指向闪存的开头（原厂固件让它指向一个会导致相机崩溃的值）',
  'preserve.site.armTail': '去掉此版本上读取开始时会让相机卡死的一个调用',
  'preserve.site.other': '修改全闪存读取所需的一条指令',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': '备份',
  'preserve.step.patch': '补丁',
  'preserve.step.commit': '写入',
  'preserve.step.drain': '全闪存读取',
  'preserve.step.restore': '还原',
  'preserve.step.verify': '检查',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': '补丁步骤',
  'preserve.stepId.commit': '写入步骤',
  'preserve.stepId.drain': '全闪存读取',
  'preserve.stepId.restore': '还原',
  'preserve.stepId.verify': '检查',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}：按计划停止——相机启动的是{bank}，本次运行没有修补它，因此没有读取任何内容。',
  'preserve.result.noReason': '没有记录原因',
  'preserve.result.stopped': '{label}：已停止——{error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': '没有任何槽位存有本次运行可以修补的固件',
  'preserve.result.writable.one': '{banks} 存有本次运行可以修补的固件',
  'preserve.result.writable.many': '{banks} 存有本次运行可以修补的固件',
  'preserve.result.backup': '{label}：普通读取能访问的每个块都已保存；{writable}。',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': '一个未知的槽位',
  'preserve.result.backupNext':
    '{label}：普通读取能访问的每个块都已保存；{writable}；下次启动会进入{next}。',
  'preserve.result.patch': '{label}：已为{banks} 生成。',
  'preserve.result.patchNone': '{label}：未生成补丁：没有任何槽位存有本次运行可以修补的固件。',
  'preserve.result.patchCount': '{label}：已为{banks} 生成；每个槽位改变 {count} 个字节。',
  'preserve.result.commitOne': '{label}：已用补丁写入{banks}，相机已接受。',
  'preserve.result.commitMany': '{label}：已用补丁写入{banks}，相机已逐一接受。',
  'preserve.result.drainNotRead': '{label}：未读取。',
  'preserve.result.drain': '{label}：已读取整个 4 MB 闪存；完整镜像的 sha256 为 {sha256}。',
  'preserve.result.drainThrough':
    '{label}：已通过{bank} 读取整个 4 MB 闪存；完整镜像的 sha256 为 {sha256}。',
  'preserve.result.restore': '{label}：已写回{banks}。',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}：已{form}写回{banks}。',
  'preserve.result.verifyDone': '{label}：完成。',
  'preserve.result.verifyIdentical':
    '{label}：重新读取了 {blocks} 个块，0 个字节不同——相机的闪存与备份逐字节相同。',
  'preserve.result.verifyDiffers': '{label}：重新读取了 {blocks} 个块，有 {bytes} 个字节不同。',
  'preserve.result.verifyDiffersUnread': {
    other: '{label}：重新读取了 {blocks} 个块，有 {bytes} 个字节不同，{count} 个块无法读取。',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    '在全闪存读取之前停止：相机启动的是本次运行没有修补的槽位，因此没有读取任何内容。',
  'preserve.unpatchedStart.next':
    '下一步：还原会把每个已写入的槽位放回原样。不会再次尝试全闪存读取：相机仍会启动同一个槽位。',
  /** The last screen's title and text. */
  'preserve.done.title': '完成——你的固件已完整保存',
  'preserve.done.detail': '完整镜像就是相机原始的整片闪存，而相机本身也已完全恢复原样。',
  'preserve.done.titleNoImage': '完成——相机已恢复原样；没有完整镜像',
  'preserve.done.detailNoImage':
    '全闪存读取没有运行，因此本次运行没有闪存的完整镜像。每个已写入的槽位都已放回原样，重新读取普通导出能访问的块，结果与备份一致。要获得完整镜像，请开始一次新的运行，并选择包含下次启动进入的那个槽位。',
  'preserve.done.detailNoImageCount':
    '全闪存读取没有运行，因此本次运行没有闪存的完整镜像。每个已写入的槽位都已放回原样，重新读取普通导出能访问的 {blocks} 个块，结果与备份一致。要获得完整镜像，请开始一次新的运行，并选择包含下次启动进入的那个槽位。',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    '相机的窗口读取功能每次启动只有有限的额度，这些读取返回时额度已经用尽——请给相机断电重启（拔下再重新插上，或使用它的电源开关），然后重新运行 `preserve --resume <run-directory>`。特征：{signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    '相机的窗口读取功能每次启动只有有限的额度，这些读取返回时额度已经用尽——请给相机断电重启（拔下再重新插上，或使用它的电源开关），然后重新运行 `preserve --resume <run-directory>`。特征：{signature}——无法从这些字节推导出原厂明文。已尝试所有读取方式：\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup': '备份中没有{bank}（{address}）——原厂读取窗口无法提供它',
  'preserve.fail.readsDisagree':
    '对{bank} 的两次读取不一致（sha256 {sha256} 与 {other}）——无法连续两次一致地提供它正在运行的槽位的相机，不是可以写入的相机；采集数据既是还原的来源，也是推导补丁的输入',
  'preserve.fail.notFactory':
    '{bank} 中不是按此版本加密方式存储的原厂镜像（预期的镜像前缀与采集数据不符）——在记录任何内容之前就拒绝，更不用说写入',
  'preserve.fail.ffSum':
    '打过补丁的固件以相机存储的形式无法通过此版本自身的检查（其和值必须为 {sum}）——拒绝发送一个相机会在擦除后拒收的槽位',
  'preserve.fail.headChanged':
    '{bank} 的开头部分自备份以来已经改变（既不是原始采集数据，也不是打过补丁的字节）——拒绝覆盖状态未知的槽位；没有写入任何内容。开头部分十六进制：当前 {live}，采集 {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} 中已经是打过补丁的字节——提交已在之前的尝试中完成，不能再次执行。请从全闪存读取步骤继续（--resume），它会启动打过补丁的镜像并从那里继续。',
  'preserve.fail.landed':
    '{banks} 中已经是打过补丁的字节——提交已在之前的尝试中完成，不能再次执行。请从全闪存读取步骤继续（--resume），它会启动打过补丁的镜像并从那里继续。',
  'preserve.fail.drainRebootRefused':
    '全闪存读取的重启命令在发出之前就被主机拒绝了（SecurityError：浏览器策略或测试防护），因此相机仍在运行它启动时的镜像，而不是已提交的补丁。全闪存读取只能通过打过补丁的镜像所扩大的窗口进行，所以它在打开任何读写窗口之前就停止了；没有读取任何内容。请在主机允许重启命令通过的环境中再次运行全闪存读取。',
  'preserve.fail.shiftedRebootRefused':
    '全闪存读取返回的数据偏高了一页，而用于再启动一次的重启命令在发出之前就被主机拒绝了（SecurityError：浏览器策略或测试防护）——再试一次也只会读取同样偏移的启动。没有保留任何内容；请在重置命令能够发出的环境中再次运行全闪存读取。',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    other:
      '验证读取在 {read}/{total} 个窗口中发现 {count} 个不同字节——芯片重新读取的结果与备份并不逐字节相同',
  },
  'preserve.fail.verifyIn': {
    other:
      '验证读取在 {read}/{total} 个窗口中发现 {count} 个不同字节（位于 {places}）——芯片重新读取的结果与备份并不逐字节相同',
  },
  'preserve.fail.verifyShort': {
    other:
      '验证读取在 {read}/{total} 个窗口中发现 {count} 个不同字节（不完整的窗口：{short}）——芯片重新读取的结果与备份并不逐字节相同',
  },
  'preserve.fail.verifyInShort': {
    other:
      '验证读取在 {read}/{total} 个窗口中发现 {count} 个不同字节（位于 {places}）（不完整的窗口：{short}）——芯片重新读取的结果与备份并不逐字节相同',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': '启动配置块',
  'preserve.fail.dataBlock': '一个数据块',

  'preserve.refused.secondRead': '它的第二次读取失败（{error}）',
  'preserve.refused.readsDisagree': '它的两次读取不一致（sha256 {sha256} 与 {other}）',
  'preserve.refused.erased': '它已被擦除',
  'preserve.refused.watchdogMark':
    '它在 +0x200 处的头部字为 {word}，这是启动早期看门狗复位后引导程序写在槽位上的标记；引导程序不再接受这个槽位，本次运行在那里没有可修补的镜像',
  'preserve.refused.noHeader': '它在 +0x200 处没有镜像头部',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild': '它存放的是 {image}（{id}），而不是相机运行的版本（{camera}）',
  'preserve.refused.otherKey':
    '引导程序的检查会拒绝它：它是以另一个密钥存储的，而不是这台相机的引导程序检查槽位时使用的密钥；通过相机写入会以那个密钥存储它，因此还原无法放回它的原样字节',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    '相机报告的固件是 {camera}，需要的是 {version}——补丁是从一个版本的字节推导出来的，绝不能发送给另一个版本',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    '固件 {version} 不是 0.x 或 1.x 版本，而本次运行只适用于 2014 年和 2016 年的版本。除版本外没有读取任何内容。请改用“导出并解密 4.x/Nano”读取这台相机：它无需补丁即可读取闪存中除 0x14060000 处之外的每个块，在这些版本上没有任何读取窗口能访问那个块。',
  'preserve.refused.preWidening':
    '固件 {version} 早于扩大读取范围的方法，本次运行宁可拒绝，也不覆盖一个它无法回读的槽位。在这一代上，相机会拒绝该方法所需的每一种启动读取的方式（在 0.3.0.1 上测得），它的读取命令无法访问闪存的开头，而补丁要修改的大小也以不同的方式存储。它也没有标准导出可以使用的读取。除版本外没有读取任何内容。',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    '存放着未知的镜像（既不是原厂 {version} 固件，也不是 Preserve 认识的对它的修改），因此 Preserve 不会修补它，也不会把它放回',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    '存放着已知的帧率版本：带有 {hz} Hz 帧率补丁的原厂 {version} 固件。Preserve 只修补原厂固件，绝不修补打过补丁的镜像，因此不会修补这个槽位，也不会把它放回',
  'preserve.image.frameRateEarlier':
    '存放着已知的帧率版本：带有较早的 {hz} Hz 帧率补丁（在加入 USB 修复之前制作）的原厂 {version} 固件。Preserve 只修补原厂固件，绝不修补打过补丁的镜像，因此不会修补这个槽位，也不会把它放回',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '它{what}。要包含这个槽位，请先把原厂镜像写回其中（例如从修改之前做的完整闪存备份中），然后开始一次新的运行',
  'preserve.image.frameRateWords':
    '它{what}。要包含这个槽位，请先把原厂镜像写回其中（例如从打帧率补丁之前做的完整闪存备份中），然后开始一次新的运行；之后可以在原厂镜像上重新打帧率补丁',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}。本次运行要从这个槽位获取它所修补的固件，所以在写入任何内容之前就在这里停止。要完整保存这台相机，请先把原厂镜像写回{bank}（例如从修改之前做的完整闪存备份中），然后开始一次新的运行。',
  'preserve.image.frameRateRefusal':
    '{name} {what}。本次运行要从这个槽位获取它所修补的固件，所以在写入任何内容之前就在这里停止。要完整保存这台相机，请先把原厂镜像写回{bank}（例如从打帧率补丁之前做的完整闪存备份中），然后开始一次新的运行；之后可以在原厂镜像上重新打帧率补丁。',
  'preserve.image.otherFirmware': '它存放的是固件 {image}，而不是相机运行的 {camera}',
  'preserve.image.otherFirmwareRefusal':
    '{name} 存放的是固件 {image}，而不是相机运行的 {camera}，因此本次运行在那里没有可修补的镜像，宁可拒绝也不覆盖它。',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage': '无法从中推导出本次运行可以修补的镜像（{error}）',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': '本次运行已完成——所有步骤都已完成（运行 {run}）',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} 在本次运行中已经完成（完成于 {finished}）——继续运行将从 {next} 开始',
  'preserve.gate.stepDoneUnknownTime':
    '{step} 在本次运行中已经完成（完成时间未知）——继续运行将从 {next} 开始',
  'preserve.gate.backupRerun':
    '备份不能重新运行：本次运行已经完成了 {steps}，下一步是 {next}——请使用 --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    '上一次备份尝试失败了，在再次运行此步骤之前，必须先给相机断电重启——在同一次启动中重试，可能会读到过时或空白的字节（实测：一次重试的备份读到的是引导程序的启动字，而不是启动配置记录）。请给相机断电重启（拔下再重新插上，或使用它的电源开关），然后再次运行备份，并在询问时确认已断电重启：本次运行无法自己察觉这一点。记录的失败：{error}',
  'preserve.gate.noErrorText': '（无错误文本）',
  'preserve.gate.patchAfterBackup':
    '{step}在备份之后运行：本次运行会先导出原厂方案能读取的每个区域并保存下来，然后才做其他任何事——那份备份是这台相机唯一的副本。请先运行备份步骤。',
  'preserve.gate.commitAfterBackup': '{step}在备份之后运行（参见补丁步骤）',
  'preserve.gate.commitAfterPatch': '{step}在补丁步骤之后运行，补丁步骤会记录它要暂存的内容',
  'preserve.gate.commitNeedsPatch':
    '{step}需要{banks} 的补丁，而补丁步骤没有记录任何补丁——请重新运行补丁步骤',
  /** `{files}`: file names, joined with ", ". */
  'preserve.gate.commitFiles':
    '{step}需要运行目录中的备份文件，但它们缺失了：{files}——没有它们，提交就没有还原来源，因此拒绝执行',
  'preserve.gate.drainNoCommit':
    '{step}要通过扩大的窗口读取打过补丁的芯片，而本次运行没有已完成的提交——在原厂相机上全闪存读取会停滞。请先运行提交（或从提交继续）；如果提交已经完成但没有留下检查点，请明确跳过（allowJump）。',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': '全闪存读取步骤在 {build} 上拒绝运行：{note}',
  'preserve.gate.detectedBuild': '检测到的版本',
  /** `{sites}`: hex offsets, joined with ", ". */
  'preserve.gate.drainHazard':
    '全闪存读取步骤在 {build} 上拒绝运行：在这个版本未打补丁的固件上开始全闪存读取会让相机崩溃（它从一个不是闪存地址的值读取；在模拟器上测得：提供 32 KB 后相机出错）。使读取安全的修改位于 {sites}，但它不在本次运行为{bank} 记录的修改之中——请在全闪存读取之前运行补丁步骤（并完成写入）。',
  'preserve.gate.drainFiles':
    '{step}需要 {files}（读出的镜像要用每个已写入槽位的采集数据做后处理），但运行目录中没有它',
  'preserve.gate.restoreNoCommit':
    '{step}会把原始槽位写回到补丁之上，而本次运行没有已完成的提交——没有任何可以还原的内容。请先运行提交（或从提交继续），或者明确跳过（allowJump）以还原一台已经打过补丁的相机。',
  'preserve.gate.restoreNeedsPatch':
    '{step}需要每个已写入槽位的补丁摘要（用于暂存长度）——请先运行补丁步骤',
  'preserve.gate.restoreNoForm':
    '还原步骤在 {build} 上拒绝运行：原始固件没有任何一种形式既能通过相机自身的检查、又能存回为原始字节——原始固件的校验和是 0xB7AB9D17（实测），而不是相机要求的 0xFFFF。本次运行将以手中的完整镜像结束，补丁仍保留在相机中；原始内容只能用全闪存编程器写回。',
  'preserve.gate.restoreFiles':
    '{step}需要 {files}（每个已写入槽位的原始内容，来自备份步骤），但运行目录中没有它',
  'preserve.gate.verifyNoRestore':
    '{step}会把重新启动后的读取与备份比较，而本次运行没有已完成的还原——打过补丁的槽位会显示为差异。请先运行还原（或从还原继续）；如果还原已经完成但没有留下检查点，请明确跳过（allowJump）。',
  'preserve.gate.verifyNeedsBackup': '{step}需要 {file}（比较的参照），但运行目录中没有它',
  'preserve.gate.needsBanks': '{step} 需要备份步骤读取的槽位，但当前状态中没有',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': '本次运行没有选择任何槽位：{what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} 无法写入：{why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    '此版本的补丁只能从恢复槽位 R 启动：{note}——本次运行会写入{bank}，而引导程序永远不会从那里运行它',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': '文件太小，无法容纳镜像头部',
  'slots.image.notWordSized': '镜像大小必须是 4 的倍数（实际为 {size} B）',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    '镜像为 {size} B；引导程序会拒绝任何 header.length >= {limit} 的镜像，所以它永远无法启动',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    '{at} 处没有镜像头部（魔数 {magic}，预期为 {expected}）——这必须是解密后的 Seek 固件镜像，而不是加密的槽位或闪存镜像',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    '初始栈指针 {address} 不在 LPC43xx 的 SRAM 中——这看起来不像是解密后的镜像',
  'slots.image.stackUnaligned': '初始栈指针 {address} 没有按字对齐',
  'slots.image.notThumb': '复位向量 {address} 不是 Thumb 地址',
  'slots.image.noKeyPair':
    '这个文件的名称中不含它的密钥对，而这台相机的密钥对和已解码的应用程序密钥对在镜像中都没有恰好出现一次，因此无法判断这个镜像是为哪些密钥构建的。解密出的文件，其名称中会带有它所包含的密钥。',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    '文件名声称密钥 A 为 {keyA}、密钥 B 为 {keyB}，但 {mismatch}。两个密钥都必须存在，且各恰好出现一次。',
  'slots.image.keyInHeader': '这个镜像在 {at} 处保存了一个密钥，位于明文头部窗口之内——拒绝修补它',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    '文件名中的密钥 A 和密钥 B 对应到 {at} 和 {other} 处重叠的字节——它们必须是两个不同的 16 字节值',
  'slots.image.retargetLost':
    '重定向之后，镜像中这台相机的密钥对没有恰好出现一次——拒绝构建一个其后续升级无法由引导程序找到密钥的载荷',
  'slots.image.noStageKey': '镜像中没有 2016 固件线的密钥对，因此没有可用于编码它的暂存密钥',
  'slots.image.ffSumNoKeys':
    '这个镜像的字累加和是 16 Hz FF 的 0xFFFF，但它没有 1.3.0.8-FF 密钥对（两半各出现一次），因此无法构建它的暂存形式。没有写入任何内容。',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    '这是 1.3.0.8 FF（16 Hz）镜像，它以自己的密钥 A 形式暂存（ff-form.ts），而不是作为明文镜像。没有写入任何内容。',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    '计划是为固件 {firmware} 生成的，但分析读到的是 {version}。计划已过时；请重新生成。没有写入任何内容。',
  'slots.plan.otherFirmwareUnknown':
    '计划是为版本未知的固件生成的，但分析读到的是 {version}。计划已过时；请重新生成。没有写入任何内容。',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    '计划所针对的相机序列号：{planSerial}；分析读到的序列号：{serial}。拒绝在这里写入。没有写入任何内容。',
  'slots.plan.cameraUnknownSerial': '未知',
  'slots.plan.unknownSerial': '未知',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, as a label. */
  'slots.plan.otherAddress': '计划的目标地址是 {address}，但此版本的{name} 位于 {at}',
  'slots.plan.notRead': '分析不再读取{name}。没有写入任何内容。',
  'slots.plan.edited': '计划的校验和与其载荷不符，说明计划被修改过。没有写入任何内容。',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': '载荷为 {size} B，超出了{name} 的范围',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}。写入它需要 acknowledgeRisk: true。没有发送任何内容。',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging': '这台相机无法从这里接受以明文暂存的镜像：{reason}。没有写入任何内容。',
  'slots.plan.noKeyTable': '分析没有指明这台相机引导程序的密钥表，因此无法把镜像重定向到它',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, as a label. CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'CompleteMemoryUpgrade 之后无法读取提交状态，因此{name} 可能只写入了一部分。在做任何其他操作之前，请重新读取槽位，并保留好你导出的镜像。',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    '相机在提交时以 {status} 拒绝了对{name} 的写入：{cause}。没有写入任何内容；该槽位没有改变。在做任何其他操作之前，请重新读取槽位。',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade 对{name} 返回了 {status}（{cause}）：没有写入任何新内容，但擦除可能已经开始，因此该槽位可能已被部分擦除。在做任何其他操作之前，请重新读取槽位，并保留好你导出的镜像。',
  'slots.commit.partial':
    'CompleteMemoryUpgrade 返回了 {status}（{cause}）——{name} 可能只写入了一部分。在做任何其他操作之前，请重新读取槽位，并保留好你导出的镜像。',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    '相机在偏移 {offset} 处暂存{name} 时报告了 {status}——已在 CompleteMemoryUpgrade 之前中止，因此没有向闪存写入任何内容',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': '传输校验和与暂存的字节不符',
  'commit.cause.unsupported': '镜像无法用相机的密钥解密，或者数据类型被拒绝',
  'commit.cause.acceptance': '镜像在擦除任何内容之前就被其校验拒绝（校验方式取决于版本）',
  'commit.cause.notArmed': '没有打开任何槽位升级',
  'commit.cause.eraseFailed': '擦除阶段失败',
  'commit.cause.programFailed': '写入阶段失败',
  'commit.cause.verifyFailed': '校验阶段失败',
  'commit.cause.unknown': '一个此处未知的状态',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} 不会复制到它自己。没有写入任何内容。',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}。没有写入任何内容。',
  'copy.refused.noPlain': '{name} 没有可复制的解密镜像。没有写入任何内容。',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} 是一个在这里无法读取的 ZIP（{error}）。没有写入任何内容。',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} 中没有完整闪存。可接受的 ZIP 是：含有 {preserve} 的 Preserve 运行文件（在其完整导出步骤运行之后）、“导出并解密 4.x/Nano”的 zip（{dump}）或“导出全部选择器”的 zip（{selectors}）；这个 ZIP 中的内容：{names}。没有写入任何内容。',
  'restore.refused.noWholeFlashPatched':
    '{file} 中没有完整闪存。可接受的 ZIP 是：含有 {preserve} 的 Preserve 运行文件（在其完整导出步骤运行之后）、“导出并解密 4.x/Nano”的 zip（{dump}）或“导出全部选择器”的 zip（{selectors}）；这个 ZIP 中的内容：{names}。其中的 {patched} 是带有本次运行临时补丁的闪存，因此不予接受。没有写入任何内容。',
  'restore.refused.zipEmpty': '无',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    '完整闪存备份为 {full} B（4 MB，即 J-Link 读取的整片芯片）；{file} 为 {size} B。没有写入任何内容。',
  'restore.refused.noBank': '此版本的计划中没有{bank}。没有写入任何内容。',
  'restore.refused.outsideFlash': '{name} 不在 4 MB 闪存范围之内。没有写入任何内容。',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where}没有被 {file} 所来自的那次导出读取：根据其 manifest.json，{address} 是一个空缺。没有可还原的镜像。没有写入任何内容。',
  'restore.refused.gapReason':
    '{where}没有被 {file} 所来自的那次导出读取：根据其 manifest.json，{address} 是一个空缺（{gap}）。没有可还原的镜像。没有写入任何内容。',
  'restore.refused.gapFill':
    '{where}没有被 {file} 所来自的那次导出读取：根据其 manifest.json，{address} 是一个空缺，以 {fill} 填充。没有可还原的镜像。没有写入任何内容。',
  'restore.refused.gapReasonFill':
    '{where}没有被 {file} 所来自的那次导出读取：根据其 manifest.json，{address} 是一个空缺（{gap}），以 {fill} 填充。没有可还原的镜像。没有写入任何内容。',
  'restore.refused.empty':
    '{where}是空的：每个字节都是 0xFF。写入会写入一个镜像，无法让槽位保持擦除状态，因此空槽位无法通过写入来还原。没有写入任何内容。',
  'restore.refused.fill':
    '{where}的每个字节都是 {fill}，这是导出在没有读到内容的地方写入的填充值：这次导出没有读取这个槽位。没有可还原的镜像。没有写入任何内容。',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with "; ", or its status word. */
  'restore.refused.notDecrypted': '无法从这个文件还原{where}：{why}。没有写入任何内容。',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': '此版本没有该槽位的写入打开方式',
  'support.noStagingEmpty': '此版本没有暂存形式，因此不会写入空槽位',
  'support.buildUnknown': '版本未知',
  'support.unverifiedStaging':
    '此版本属于加锁的 0.x/1.x 固件线，但不是测量过完整备份补丁表的版本之一（0.8.0.0 .. 1.3.0.8 以及 1.0.3.0 / 1.0.3.2），因此它的槽位采用的暂存形式未知，不会写入任何内容',
  'support.unknownFamily':
    '相机的固件系列未知，因此它的槽位写入时使用的密钥也未知；而相机会接受用错误密钥写入的槽位，之后却无法从中启动。请导出并解密这台相机，根据导出的镜像识别它，然后用 --family 指定它的固件系列。',
  'support.noReadCommand':
    '早于 0.8.0.0 的固件没有 GetFeaturedFirmwareData（导出读取闪存所用的命令）的读取处理程序。在 0.7.0.7 和 0.7.0.8 上，它位于 RPC 方法表的 0x4F 处，但只注册为 setter（写入处理程序），因此导出发送的 control-IN 读取无法被分派（0.x/1.x 标签页的完整备份流程改为通过线路 ID 0x58，即 GetFeaturedData，读取这两个版本）；在 0.7.0.7 之前，线路 ID 0x4F 是 UploadFirmwareRowSize；在 0.3.0.1 上，线路 ID 0x52——导出用来打开窗口的那个——是 EnterBootloaderMode，而不是 BeginFirmwareUpgrade：相机仍停留在它的应用程序中，但每次打开都会设置一个闪存目标并开启该版本的固件升级阶段（之后 GetErrorCode 读到 0x00400000），这并不是读取窗口。这些信息是从镜像自身的方法表（两个处理程序列）中恢复出来的；参见 test/firmware/facts.json。',
  'support.noWritePath':
    '这些版本通过本工具箱不会发送的一种较旧的升级流程接收新固件，而且它们的槽位从未被映射过，因此不会写入任何内容。',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    '无法读取固件版本，因此版本、它的槽位及其暂存形式都未知；不会对它进行任何读取或写入',
  'support.versionNotDotted':
    '固件版本“{version}”不是点分格式的版本号，因此版本、它的槽位及其暂存形式都未知；不会对它进行任何读取或写入',
  'support.olderThanFirst':
    '固件 {version} 早于 {first}：它的 RPC 表中没有 GetFeaturedFirmwareData（槽位读取发送的命令）的读取处理程序，因此既不会向它发送读取，也不会发送写入（证据见 early-compact）',
  'support.modernOnLocked':
    '固件系列 modern-4x 适用于 2.x、4.x、10.x、42.x 和 44.x；{version} 属于 0.x / 1.x 加锁固件线，需要 legacy-auth 或 compact-2016',
  'support.lockedOnModern':
    '固件系列 legacy-auth 适用于 0.x / 1.x 加锁固件线；{version} 属于现代固件线，需要 modern-4x',
  'support.notCompactPro':
    '固件系列 compact-2016 适用于 Compact PRO 1.0.3.x 固件线；{version} 不在其中',
  'support.earlyCompact':
    '固件系列 early-compact 只适用于早于 {first} 的版本，而 {version} 按 legacy-auth 读取',
  'support.generic':
    '相机的固件系列尚未识别（family generic），因此槽位布局和暂存形式都未知；请在读取或写入槽位之前先识别相机',
  'support.noPlan': '固件系列 {family} 没有槽位计划：它的槽位布局和暂存形式都未知',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain': '此版本的表在普通通道上不会打开 {address} 处的模式 {mode}',
  'support.noArmToken': '此版本的表在令牌通道上不会打开 {address} 处的模式 {mode}',
  'support.windowElsewhere': '{bank} 在完整备份流程中的槽位窗口位于 {at}，而不是 {address}',
  'support.noDumpWindow': '此版本的 BeginFirmwareUpgrade 表中没有{bank} 在 {address} 处的窗口',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} 不支持{capability}：{reason}',
  'support.capability.dump': '导出',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '“导出全部选择器”',
  'support.capability.decrypt': '解密',
  'support.capability.deviceInfo': '“信息”标签页的完整读取',
  'support.capability.flash': '槽位写入',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name}（{address}）在此版本上无法读取：它的选择器表在那里没有窗口，因此没有为它打开任何读取',
  'slots.unread.missing': '相机分析中缺少{name}',
  'slots.unread.notRead': '{name} 没有被读取',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}。没有写入任何内容。',
  'slots.refused.versionUnknown':
    '分析没有说明相机运行的是哪个固件，而槽位命令在不同版本上的含义不同。请重新读取设备信息。',
  'slots.refused.versionUnknownWrite': '分析没有说明相机运行的是哪个固件。没有写入任何内容。',
  'slots.refused.emptyInput': '输入为空',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable': '{name} 是空的，在此版本上无法写入：{reason}',
  'slots.refused.noRaw': '在此版本上，{name} 不能接受原始字节：{reason}',
  'slots.refused.noPlain': '在此版本上，{name} 不能接受解密后的镜像：{reason}',
  'slots.refused.noStaging': '{name} 在此版本上没有暂存形式，因此无法为它编码镜像',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B 超过了{name} 的大小（{bankSize} B）',
  'slots.refused.imageTooLong': '镜像为 {size} B，超过了{name} 的大小（{bankSize} B）',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    '2014 年的引导程序不接受此版本在槽位 A 或 B 中的校验和，而会不经检查直接启动恢复槽位 R（0x14070000），因此补丁会写入恢复槽位 R，且只写入那里',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': '此版本只从恢复槽位 R 运行：{note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size as "64 KiB". */
  'decryptFile.wrongSize': '固件槽位为 {size} B（{kib} KB）；这个文件为 {count} B',
  'decryptFile.erasedBank': '空，没有可解密的内容：全部 {size} B 读出都是 0xFF（已擦除的槽位）',
  'decryptFile.erasedHeader': '已擦除：头部窗口全是 0xFF，因此该槽位中没有镜像；不会解密任何内容',
  'decryptFile.noHeader': '没有镜像头部（魔数 {magic}），因此没有可解密的镜像',
  'decryptFile.lengthOutOfRange': 'header.length {length} 超出范围；没有可解密的镜像',
  'decryptFile.ffKeyB':
    '已用 FF 1.3.0.8 密钥 B 解密 {size} B：镜像存储为镜像与其密钥块 1 密钥流的异或，头部窗口保持原样',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    '密钥未能恢复：镜像解密后的复位向量不是 Cortex-M 入口（密钥{check}）；不会解密任何内容',
  'decryptFile.storedPlain':
    '以明文存储：槽位中存放的是运行时原样的镜像（2014 年的明文链，恒等密钥流），因此没有密钥，解密后的镜像就是镜像本身',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': '已用从这个槽位恢复的密钥解密 {size} B（{check}）',
  'decryptFile.decryptedNamed': '已用从这个槽位恢复的密钥解密 {size} B（{check}；它是{key}）',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': '读取不完整（{size} B）',
  'read.reason.noParse': '无法解析镜像头部',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': '没有镜像头部（魔数 {magic}）',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} 超出范围',
  'read.reason.stopped': '槽位读取在 {count}/{size} B 处停止',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    '在固件 {version} 上无法读取：它的计划（{table}）在 {address} 处没有窗口，因此没有为它打开任何读取',
  'read.reason.notInPlanUnknown':
    '在版本未知的固件上无法读取：它的计划（{table}）在 {address} 处没有窗口，因此没有为它打开任何读取',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    '该窗口提供的是过时的读取描述符的字节——字 0 为 {word}、复位向量为 {hex}，这是 0x14000000 的向量表，而不是这个槽位的内容，因此没有对它做任何分析：{remedy}',
  'read.reason.spentReader': '无法读取相机的槽位——{remedy}',
  'read.spentRemedy': '本次启动的窗口读取额度可能已经用尽；请给相机断电重启，然后重试',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead': '无法读取相机的活动槽位字（fw info roots，选择器 10）',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank': '相机的活动槽位字为 {word}，它不对应任何槽位',
  'checkKey.unnamed.cfg0NotRead':
    '没有读取启动配置字，因此不知道引导程序在进入{bank} 之前是否检查过它',
  'checkKey.unnamed.noZeroSum':
    '相机报告它进入了{bank}，但在本次读取中，{bank} 解密后的字累加和不为零',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    '相机报告它进入了{bank}，而启动配置字 {word} 把它排在最后，所以引导程序进入它时没有检查；但在本次读取中，{bank} 解密后的字累加和不为零',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family}（读取后得分 {score}，依据下方的证据）',
  'report.detectedAmbiguous': '{family}（读取后得分 {score}，依据下方的证据；不确定）',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': '是',
  'report.cell.no': '否',
  'report.cell.notApplicable': '不适用',
  'report.cell.unknown': '未知',
  'report.cell.recoveryOnly': '仅恢复',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': '白化常数 K',
  'report.keyRow.store': '存储密钥',
  'report.keyRow.check': '检查密钥',
  'report.keyRow.table': '密钥表',
  'report.keyRow.keys': '密钥',
  'report.keyRow.a': '密钥 A',
  'report.keyRow.b': '密钥 B',
  'report.keyRow.tableAt': '密钥表位置',
  'report.key.notIdentified': '（未识别）',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': { other: '{count} 个候选，均未确认' },
  'report.key.tableAt': '引导程序块中的 {offset}，已与某个槽位核对确认',
  'report.key.plainChain': '不需要：槽位以明文固件存储，因此槽位按原样读取和写入',
  'report.key.tableRefused2016':
    '未读取——在这条固件线上，引导程序块（0x14000000）在所有通道上都被拒绝读取',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}，根据{bank} 指明——相机报告它在引导程序检查之后进入了该槽位',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}，从{bank} 推断得出——相机报告它进入了该槽位：引导程序进入该槽位时不检查，并以它检查其他槽位所用的密钥运行它',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': '（{pair}的密钥块 1）',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'Compact PRO 1.0.3.x 9 Hz 密钥对',
  'keyPair.cp1032ff': 'Compact PRO 1.0.3.x FF 密钥对',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': '未指明——{why}',
  'report.checkKey.couldNotName': '本次读取无法指明它',
  'report.storeKey.checkKeyUnnamed':
    '其引导程序检查槽位时使用的密钥（本次读取未指明）：应用程序写入的每个槽位都以该密钥存储',
  'report.storeKey.checkKey': '{key}：应用程序写入的每个槽位都以其引导程序检查时使用的密钥存储',
  'report.storeKey.unknown': '未知——没有读取存放设备专属密钥槽的引导程序块',
  'report.storeKey.keyBUnidentified': '密钥 B（没有烧录设备专属密钥；密钥 B 本身未识别）',
  'report.storeKey.keyB': '密钥 B（没有烧录设备专属密钥）',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': '以明文暂存（镜像原样，不使用密钥）',
  'report.staged.slotKeystream': '以其镜像自身的密钥块 0 暂存',
  'report.staged.keyA': '以由当前启动槽位和正在运行的应用程序推导出的密钥暂存',
  'report.staged.ffVendor':
    '按厂商应用暂存 16 Hz FF 镜像的方式暂存（镜像 XOR 其自身的密钥块 0），由相机以密钥 B 存储',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': '备份：块 {address}',
  'progress.backupDone': '备份：已读取每个块',
  'progress.checkBlock': '检查：块 {address}',
  'progress.checkDone': '检查：已读取每个块',
  'progress.writingBank': '正在写入{bank}',
  'progress.restoringBank': '正在还原{bank}',
  'progress.staged': '{label}：已暂存 {done}/{total} B',
  'progress.wholeFlash': '全闪存读取：{got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': '读取 {address} subcmd={subcmd} …',
  'progress.readWindowAuth': '读取 {address} subcmd={subcmd}（需解锁令牌）…',
  'progress.windowsRead': '完成——已读取 {ok}/{total} 个窗口。',
  'progress.readingBank': '正在读取{bank}…',
  'progress.analysing': '正在分析…',
  'progress.probeSelector': '探测选择器 {selector} …',
  'progress.selectorsArmed': '完成——已激活 {armed}/{span} 个选择器，其中 {withData} 个有数据。',
  'progress.recoveringKey': '解密：正在为 {address} 恢复密钥…',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address}（subcmd {subcmd}）无法读取：{error}',
  'slots.read.refusedBuild':
    '拒绝读取固件槽位：{reason}。除了版本读取外没有发送任何命令，因此没有触及任何槽位。',
  'slots.backup.notSaved':
    '备份 {file} 没有保存，因此没有写入任何内容。没有先保存备份，写入就绝不会运行；请在可以保存备份时重试。',
  'slots.backup.notSavedWhy':
    '备份 {file} 没有保存（{error}），因此没有写入任何内容。没有先保存备份，写入就绝不会运行；请在可以保存备份时重试。',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': '高速（480 Mbit/s）',
  'usb.speed.full': '全速（12 Mbit/s）',
  'usb.speed.code': '代码 {code}',
} satisfies Translation<'core'>;
