/**
 * Namespace `decrypt`, 简体中文 (zh-Hans), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': '未选择文件。',
  'status.reading': '正在读取文件…',
  'status.notUsable': '不是可用的闪存镜像。',
  'status.building': '正在生成压缩包…',
  'status.nothingDecrypted': '没有解密出任何镜像——原因请查看日志。清单文件已在你的下载中。',
  /* {count} is the number of slots found. */
  'status.done': { other: '完成——已解密 {done}/{count} 个槽位。请查看你的下载。' },

  /* views/DecryptView: a whole dump. */
  'offline.title': '解密你已有的闪存镜像',
  'offline.description': '完整的闪存镜像，逐个槽位解密。',
  'offline.intro':
    '4.x/Nano 标签页的第 2 步已经会解密它读取的所有内容，所以只有当你的闪存镜像来自别处——之前的运行、J-Link 或 SPI 编程器——时才需要这里。文件在本地读取，绝不上传。**这部分在所有浏览器中都能使用**，包括 Safari 和 iOS，因为它不需要 USB 访问。',
  'offline.actions': '离线解密操作',
  'offline.choose': '选择镜像文件…',
  'offline.panel': '离线解密',
  'offline.detectedTitle': '检测到的固件系列',
  'offline.detectedIntro':
    '没有连接相机，所以固件系列是根据文件中的镜像本身评分得出的。无论哪种情况，密钥都是从每个槽位的密文中求出的；这里只决定报告中写的是哪个固件系列。',
  'offline.scoreBasis': '根据文件中的镜像',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': '解密一个固件槽位',
  'slot.description': '来自文件的一个槽位：64 KB，与相机中的存储形式相同。',
  'slot.intro':
    '选择一个存有单个固件槽位的文件——即一个 65,536 字节的槽位，就像在<link>{tab}</link>标签页导出槽位时保存的那样，或者完整闪存镜像中某个槽位地址处的 64 KB。本页会从该槽位自身的字节中找出密钥，解密镜像，并提供下载，同时显示密钥、大小和 SHA-256。不使用相机，所以不连接任何设备也能使用。',
  'slot.refusedIntro':
    '如果文件不是一个槽位、不含固件镜像或无法解密，就会被拒绝并给出原因。已擦除的槽位会如实说明，没有可解密的内容。',
  'slot.actions': '槽位文件操作',
  'slot.choose': '选择槽位文件…',
  'slot.decrypting': '正在解密 {file}…',
  'slot.unreadable': '无法读取该文件。',
  'slot.notDecrypted': '未解密：{file} 不是本页能解密的固件槽位。',
  'slot.nothingWritten':
    '没有向任何地方写入任何内容。请选择一个 64 KB 的槽位文件，或在上面的部分中选择完整的闪存镜像。',
  'slot.erased': '{file} 是一个已擦除的槽位。',
  'slot.resultTitle': '已解密的固件槽位',
  'slot.file': '文件',
  'slot.fileSize': '文件大小',
  'slot.fileSha': '文件的 SHA-256',
  'slot.imageVersion': '镜像版本',
  'slot.imageSize': '镜像大小',
  'slot.imageSha': '镜像 SHA-256',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': '校验和',
  'slot.notComputed': '此形式不计算',
  'slot.family': '固件系列',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name}（从镜像中检测得出）',
  'slot.familyMismatch':
    '{name}——该和值不是此固件系列要求的校验目标值，所以引导程序不会按现状接受这个镜像',
  'slot.unknown': '未知',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': '密钥',
  'slot.keyPlain': '无：该槽位以明文存放镜像（2014 年的明文链）',
  'slot.keyFfB': '1.3.0.8 FF 密钥对中的密钥 B',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': '存储形式',
  'slot.storedAsFfB': '镜像与密钥 B 的密钥流异或（XOR），头部窗口保持原样',
  'slot.keyNone': '无',
  'slot.keyNamed': '{key}——{name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': '密钥形式',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k}——镜像本身恰好包含一次这种形式，由此确定',
  'slot.keyFormDefault': '{k}——镜像中没有只出现一次的形式，因此显示该固件系列的默认值',
  'slot.resultActions': '解密后镜像的操作',
  'slot.download': '下载 {file}',
  'slot.downloadFallback': '解密后的镜像',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': '检测结果',
  'detection.score': '评分',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score}（满分 1.00），{basis}',
  'detection.readAs': '按此系列读取',
  'detection.summary': '摘要',
  'detection.why': '原因：',
  'detection.ambiguous':
    '**证据不足以确定这是哪个固件系列。**要么得分最高者并不比通用后备方案更好，要么第二名与它太接近，无法判定。解密不受影响——无论哪种情况，密钥都是从密文中求出的——但报告中写的固件系列，以及任何依赖它的内容，都只是猜测。',
} satisfies Translation<'decrypt'>;
