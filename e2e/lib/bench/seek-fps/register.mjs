// Node loader for the seek-fps checker: runs its TypeScript and the repo's own imports with no build step.
//   node --import ./e2e/lib/bench/seek-fps/register.mjs e2e/lib/bench/seek-fps/seek-fps.ts --fps
// The resolve hook (resolve-hook.mjs) maps the repo's `.js` import specifiers to their `.ts` sources, and
// `@seek-fw/core` to packages/core/src, so the code is the same one vitest and tsc see.
import { register } from 'node:module';

register(new URL('./resolve-hook.mjs', import.meta.url));
