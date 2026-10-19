/* ==================================================================== *
 * The hosted build, run offline — `npm run e2e:offline` (emu by default;
 * camera with SEEK_E2E_TARGET=camera, read-only).
 *
 * Serves the committed `docs/` bundle (what GitHub Pages serves) over plain
 * HTTP — no dev server, no module graph — then, once the page has loaded, goes
 * offline (CDP) and runs Dump & decrypt and Preserve step 02. Both finish
 * offline, which is what the page's airplane-mode advice promises. Every
 * network request the page makes AFTER it has loaded is recorded and reported,
 * so a stray fetch (a font, an analytics ping) would show up.
 *
 * Step 02 runs as it does in `camera.e2e.ts` (`runStep02`): its plain reset is
 * allowed while it runs, and no guard may refuse anything. The bundle is the
 * committed one, so what it runs is the code `docs/` was last built from.
 *
 * The 4.x line has its own offline dump, the second spec in this file (TESTING.md
 * 42.39): the emulator boots a 4.8.2.1 Compact dump from `SEEK_FULL_DUMPS_BY_CAMERA`,
 * and the page dumps it offline. It skips without that corpus root.
 * ==================================================================== */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { checkDumpArchive, checkStep02RunFile } from './lib/camera-flow.js';
import { sha256 } from './lib/checks.js';
import { targetSpec } from './lib/spec.js';
import { runStep02 } from './lib/target-tools.js';

interface Req {
  readonly url: string;
  readonly afterLoad: boolean;
}

targetSpec(
  { title: 'the hosted docs/ bundle, offline', slug: 'offline', source: 'docs' },
  (ctx) => {
    const requests: Req[] = [];
    let loaded = false;

    it('loads from the static bundle and connects', async () => {
      const t = ctx.target();
      t.page.on('request', (req) => {
        requests.push({ url: req.url(), afterLoad: loaded });
      });
      /* The whole page and its assets are in by now (networkidle on open). */
      loaded = true;
      await t.wizard.connect();
    });

    it('goes offline and the 4.x dump page still refuses this 0.x/1.x camera before it reads', async () => {
      const t = ctx.target();
      await t.setOffline(true);
      try {
        /* The dump page is v4-only (TESTING 42.17, pinned by 42.18): a 1.3.0.0 camera is refused on its
         * version, before any read, and the refusal does not need the network. The 0.x/1.x line's own
         * offline flow is the next test. A v4 camera's offline dump is the second spec in this file. */
        await expect(t.wizard.dumpAndDecrypt(60_000)).rejects.toThrow(/Refused — nothing was read/);
      } finally {
        await t.setOffline(false);
      }
    });

    it('goes offline and still runs Preserve step 02', async () => {
      const t = ctx.target();
      await t.setOffline(true);
      try {
        checkStep02RunFile(await runStep02(t));
      } finally {
        await t.setOffline(false);
      }
    });

    it('made no network request after it had loaded', () => {
      const after = requests.filter((r) => r.afterLoad);
      /* Blob downloads use blob: URLs, not the network; the dev server (emu) adds
       * its own client requests, so this bites hardest on the docs bundle. */
      const external = after.filter(
        (r) =>
          !r.url.startsWith('blob:') &&
          !r.url.startsWith('data:') &&
          !r.url.startsWith(ctx.target().serverUrl),
      );
      for (const r of after) say(`post-load request: ${r.url}`);
      expect(
        external,
        `the page fetched from the network after load: ${external.map((r) => r.url).join(', ')}`,
      ).toEqual([]);
    });
  },
);

/* ---- The 4.x line, offline ----------------------------------------------------
 * The emulator boots a corpus dump of a 4.8.2.1 Compact (the dump file is the part), and the hosted page
 * dumps it with the network off, through the same Dump & decrypt the spec above runs on its own part. The
 * dump's image must be that file, byte for byte: the emulated part is the file, and a 4.x dump reads every
 * block of it (TESTING.md 42.18). Needs SEEK_FULL_DUMPS_BY_CAMERA; without it the spec is not registered.
 * -------------------------------------------------------------------------------- */

const CORPUS_ROOT = process.env.SEEK_FULL_DUMPS_BY_CAMERA?.trim() ?? '';
/** The 4.8.2.1 Compact dump in the corpus tree (one tree per camera, then family, then version folder). */
const V4_DUMP =
  CORPUS_ROOT === ''
    ? null
    : path.join(
        CORPUS_ROOT,
        'Compact',
        'Compact',
        '2020.02.26-11.23.26-4.8.2.1',
        'full_dump_original.bin',
      );

if (V4_DUMP === null || !existsSync(V4_DUMP)) {
  process.stderr.write(
    `\n[skip] the 4.x offline dump: ${V4_DUMP === null ? 'SEEK_FULL_DUMPS_BY_CAMERA is not set' : `no dump at ${V4_DUMP}`}\n`,
  );
} else {
  const dumpPath = V4_DUMP;
  targetSpec(
    {
      title: 'the hosted docs/ bundle, offline: a 4.x camera dumps and decrypts',
      slug: 'offline-v4',
      source: 'docs',
      flash: dumpPath,
    },
    (ctx) => {
      const requests: Req[] = [];
      let loaded = false;

      it('loads from the static bundle and connects', async () => {
        const t = ctx.target();
        t.page.on('request', (req) => {
          requests.push({ url: req.url(), afterLoad: loaded });
        });
        loaded = true;
        await t.wizard.connect();
      });

      it('goes offline and dumps the 4.8.2.1 camera, whose image is the corpus dump, and decrypts its slots', async () => {
        const t = ctx.target();
        await t.setOffline(true);
        try {
          const dump = await t.wizard.dumpAndDecrypt(20 * 60_000);
          checkDumpArchive(dump, sha256(new Uint8Array(readFileSync(dumpPath))));
          /* A decrypted slot is `<stem>_decrypted_<address>.bin`, with `-KeyA-…-KeyB-…` when its key pair is in the image. */
          const decrypted = dump.entries.filter((e) =>
            /_decrypted_1[0-9A-F]{7}(-KeyA-[0-9A-Fa-f]+-KeyB-[0-9A-Fa-f]+)?\.bin$/.test(e.name),
          );
          say(`decrypted slots: ${decrypted.map((e) => e.name).join(', ') || 'none'}`);
          expect(decrypted.length, 'the dump decrypts at least one slot').toBeGreaterThanOrEqual(1);
          const manifest = dump.entries.find((e) => /^[^/]+\/manifest\.json$/.test(e.name));
          const parsed = JSON.parse(
            new TextDecoder().decode(manifest?.data ?? new Uint8Array()),
          ) as {
            readonly selectorTable?: { readonly firmwareVersion?: string | null };
          };
          expect(parsed.selectorTable?.firmwareVersion, 'the dump names the 4.8.2.1 build').toBe(
            '4.8.2.1',
          );
        } finally {
          await t.setOffline(false);
        }
      });

      it('made no network request after it had loaded', () => {
        const after = requests.filter((r) => r.afterLoad);
        const external = after.filter(
          (r) =>
            !r.url.startsWith('blob:') &&
            !r.url.startsWith('data:') &&
            !r.url.startsWith(ctx.target().serverUrl),
        );
        for (const r of after) say(`post-load request: ${r.url}`);
        expect(
          external,
          `the page fetched from the network after load: ${external.map((r) => r.url).join(', ')}`,
        ).toEqual([]);
      });
    },
  );
}
