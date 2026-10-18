// The ESM resolve hook behind register.mjs. Two rewrites, both only when the target exists:
//   - a relative `./x.js` (or `../x.js`) whose `./x.ts` sibling exists resolves to the `.ts` file;
//   - the bare `@seek-fw/core` resolves to this worktree's packages/core/src/index.ts.
// Everything else passes through to Node's own resolver.
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CORE_INDEX = fileURLToPath(
  new URL('../../../../packages/core/src/index.ts', import.meta.url),
);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@seek-fw/core') {
    return nextResolve(pathToFileURL(CORE_INDEX).href, context);
  }
  if (
    specifier.endsWith('.js') &&
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    context.parentURL
  ) {
    const ts = new URL(specifier.slice(0, -3) + '.ts', context.parentURL);
    if (existsSync(fileURLToPath(ts))) return nextResolve(ts.href, context);
  }
  return nextResolve(specifier, context);
}
