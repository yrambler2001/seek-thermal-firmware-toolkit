/**
 * English: the source language, bundled with the page. Every other language
 * is checked against this one (see ../../types.ts) and falls back to it key by
 * key. One file per namespace, so the agents filling different areas never
 * edit the same file.
 */

import app from './app';
import common from './common';
import core from './core';
import decrypt from './decrypt';
import info from './info';
import preserve from './preserve';
import shared from './shared';
import slots from './slots';
import v4 from './v4';

export const en = {
  common,
  app,
  core,
  shared,
  info,
  decrypt,
  v4,
  slots,
  preserve,
} as const;

export default en;
