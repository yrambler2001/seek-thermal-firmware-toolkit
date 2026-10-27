/**
 * The names of the whole-flash images the read workflows write, in one place: the dump and Dump all
 * selectors write them, and the slots tab's restore takes them out of their ZIPs. The gap fill and whether
 * the unlock token was used are not in the names; manifest.json records both (`gapFill`, and for a dump
 * over the authenticated channel `algorithm`, `unlockToken` and `authChannelBanks`; for Dump all
 * selectors `mode`, `channel` and `unlockToken`).
 */

/** Dump & decrypt 4.x/Nano: the 4 MiB flash as read, every block no request reaches filled with the gap fill. */
export const FLASH_DUMP_ORIGINAL_FILE = 'flash_dump_original.bin';

/** Dump all selectors: the 4 MiB image of the selectors whose address is known, the rest gap fill. */
export const FLASH_DUMP_ALL_SELECTORS_FILE = 'flash_dump_all_selectors.bin';
