/**
 * 简体中文 (zh-Hans): every namespace, translated from ../en. Loaded on demand
 * (its own chunk) when the reader picks it. See ../../README.md, "How to add a language".
 *
 * Glossary (English → 中文). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → 固件; firmware family → 固件系列; firmware line ("the 0.x/1.x line") → 固件线
 * - slot, bank → 槽位 (both: "bank" is the code's word for the same slot). Slot A → 槽位 A;
 *   recovery R → 恢复槽位 R; the booted bank → 当前启动的槽位; empty bank → 空槽位
 * - flash (the memory) → 闪存; whole flash → 整片闪存; whole-flash read (the drain) → 全闪存读取
 * - dump (verb) → 导出 (the page saves the flash to a file; 导出 is what a camera owner reads as "save
 *   out"); a dump file → 闪存镜像 / 导出的镜像. Tab "Dump & decrypt …" → 导出并解密 …
 * - image (firmware image) → 镜像; decrypted image → 解密后的镜像; stock/factory image → 原厂镜像
 * - write, flash (verb), program → 写入; commit → 提交; erase → 擦除; read-back → 回读
 * - restore → 还原 (恢复 is kept for the recovery slot, so the two never mix); verify → 验证; check → 检查
 * - boot / start → 启动; next start → 下次启动; last start → 上次启动; bootable → 可启动;
 *   bootloader → 引导程序; boot config / boot-config word → 启动配置 / 启动配置字;
 *   active-slot word → 活动槽位字
 * - key → 密钥; Key A / Key B → 密钥 A / 密钥 B; per-device key → 设备专属密钥; key block 0 → 密钥块 0;
 *   store key → 存储密钥; keystream → 密钥流; plaintext → 明文; ciphertext → 密文; XOR stays XOR (or 异或)
 * - backup → 备份; run (one pass of the 0.x/1.x wizard) → 运行; run file → 运行文件;
 *   "the preservation run" → 0.x/1.x 标签页的完整备份流程 (Preserve stays as the wizard's name)
 * - power cycle → 断电重启; unplug and replug → 拔下再重新插上; power-up → 上电
 * - frame-rate patch → 帧率补丁; "Make N FPS" → 改为 N FPS; patch (verb) → 修补 / 打补丁
 * - acceptance sum → 校验和 (the sum the bootloader checks); word sum → 字累加和;
 *   transfer checksum → 传输校验和; footer → 尾部; header → 头部
 * - stage / staging (how a write's bytes are sent) → 暂存 / 暂存方式; payload → 载荷
 * - build → 版本 in sentences ("the 8 Hz build" → 8 Hz 版本); 构建 only for the "Build" row label,
 *   which stands next to a "Version" row
 * - selector → 选择器; read window → 读取窗口; arm (open a window for a read or write) → 打开 / 激活
 * - unlock token → 解锁令牌; wire id → 线路 ID; mode N → 模式 N
 * - Sizes: KB and MB (never KiB/MiB); B, Hz, FPS as they are. Tab and button names are quoted with “”
 *   in the exact words of app:tab.* and the buttons' own keys.
 * Kept in English: command and register names, family ids (legacy-auth …), UNTESTED (with 未经测试 next
 * to it), quoted run-log words such as "already holds the patched bytes", Zadig's menus, CLI options.
 */

import type { Dictionary } from '../../types';
import app from './app';
import common from './common';
import core from './core';
import decrypt from './decrypt';
import info from './info';
import preserve from './preserve';
import shared from './shared';
import slots from './slots';
import v4 from './v4';

const zhHans: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default zhHans;
