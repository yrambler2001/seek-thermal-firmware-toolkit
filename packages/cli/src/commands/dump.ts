/**
 * `seek-fw dump` — the Dump & decrypt tab for 4.x and Nano.
 *
 * The family is not chosen here: the camera's own answers choose it (the probe in
 * `chooseProfileByProbe`), and this command reads only the families the 4.x line
 * uses. A locked 2014–2017 camera is refused before anything is read, and its
 * flow is `seek-fw preserve`.
 *
 * `--all-selectors` (Dump all selectors) probes every BeginFirmwareUpgrade
 * selector instead of reading the map, and writes what each one exposes.
 *
 * The interesting behaviour is the cancel path. Core does NOT throw when the
 * caller aborts: a dump takes minutes, so it stops where it is and returns a
 * complete result with `cancelled: true`, a partial image whose unread windows
 * are gap-filled and recorded as unread, and a manifest that says so. The CLI's
 * job is therefore to write that archive exactly as it writes a finished one,
 * say plainly that it is partial, and still exit 130 — a cancelled run is not
 * a successful one, and it is not a reason to throw the bytes away either.
 */

import { DUMP_COMMAND_FAMILIES, readRunningFirmware, runDump, runSweep } from '@seek-fw/core';
import type { CommandContext, CommandResult } from '../cli.js';
import { CliError } from '../errors.js';
import {
  chooseProfileByProbe,
  dumpOptionsFrom,
  openSession,
  uniqueArtifacts,
  writeRun,
  workflowContext,
} from './shared.js';

/* The families this command reads are core's `DUMP_COMMAND_FAMILIES` (the 4.x map, and the map a
 * camera whose answers name no family is read with); `info --families` lists the same set. The
 * locked 2014–2017 line (legacy-auth, compact-2016) and the pre-0.8 Compact (early-compact) are read
 * by `seek-fw preserve`. */

export async function dumpCommand(ctx: CommandContext): Promise<CommandResult> {
  const session = await openSession(ctx);
  try {
    /* The version first, and nothing else: the probe below reads a bank open on every
     * line, which a 0.x or 1.x camera must not be asked for. */
    const running = await readRunningFirmware(session.device);
    const major = Number.parseInt(running.version?.split('.')[0] ?? '', 10);
    if (running.version !== null && major <= 1) {
      throw new CliError(
        `this camera runs ${running.version}, a 0.x/1.x 2014–2017 build, which \`seek-fw dump\` ` +
          'does not read; nothing was read but the version',
        {
          code: 'dump/refused',
          hint: 'Use `seek-fw preserve` for this camera. `seek-fw info` shows what it answers as.',
        },
      );
    }
    const choice = await chooseProfileByProbe(ctx, session);
    if (!DUMP_COMMAND_FAMILIES.has(choice.profile.id)) {
      throw new CliError(
        `this camera answers as ${choice.profile.name} (${choice.profile.id}), a camera of the ` +
          '0.x/1.x 2014–2017 line, which `seek-fw dump` does not read; nothing was dumped',
        {
          code: 'dump/refused',
          hint: 'Use `seek-fw preserve` for this camera. `seek-fw info` shows what it answers as.',
        },
      );
    }
    ctx.reporter.log(
      `acting under family ${choice.profile.id}${choice.forced ? ' (--family)' : ''}`,
      'detail',
    );
    const workflow = workflowContext(session, choice.profile, choice.detection, ctx);
    const options = dumpOptionsFrom(ctx.options);

    if (ctx.options.allSelectors) {
      const [first, last] = choice.profile.sweepRange;
      ctx.reporter.log(
        `dumping all selectors ${String(first)}..${String(last)} under family ${choice.profile.id}`,
        'detail',
      );
      const result = await runSweep(workflow, options);
      const written = await writeRun(ctx, 'all-selectors', uniqueArtifacts(result.artifacts));

      if (ctx.human) {
        ctx.out(
          `${String(result.selectorsArmed)} selector(s) armed, ` +
            `${String(result.selectorsWithData)} returned data, ` +
            `${String(result.placedInImage)} placed in the assembled image`,
        );
        if (result.cancelled)
          ctx.out('cancelled: this dump of all selectors is PARTIAL — see manifest.json');
      }

      return {
        mode: 'all-selectors',
        family: choice.profile.id,
        selectorsArmed: result.selectorsArmed,
        selectorsWithData: result.selectorsWithData,
        placedInImage: result.placedInImage,
        cancelled: result.cancelled,
        output: { directory: written.directory, zip: written.zip, files: written.files },
        manifest: result.manifest,
      };
    }

    const result = await runDump(workflow, options);
    const written = await writeRun(ctx, 'dump', uniqueArtifacts(result.artifacts));

    if (ctx.human) {
      ctx.out(
        `read ${String(result.windowsRead)}/${String(result.windowsExpected)} windows` +
          ` under family ${choice.profile.id}`,
      );
      if (result.cancelled) {
        ctx.out(
          'cancelled: this archive is PARTIAL — every window that did not run is gap-filled ' +
            'and recorded as unread in manifest.json, and the decrypt stage was skipped',
        );
      }
    }

    return {
      mode: 'map',
      family: choice.profile.id,
      windowsRead: result.windowsRead,
      windowsExpected: result.windowsExpected,
      bytes: result.combined.length,
      cancelled: result.cancelled,
      output: { directory: written.directory, zip: written.zip, files: written.files },
      manifest: result.manifest,
    };
  } finally {
    await session.close();
  }
}
