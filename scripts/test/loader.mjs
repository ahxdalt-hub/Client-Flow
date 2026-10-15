/**
 * ESM resolve hooks for `node --test`.
 *
 * The app code uses Next-style conventions that plain Node cannot resolve:
 *   * `@/*` path aliases (tsconfig "paths")
 *   * `import "server-only"` (throws outside React's server condition)
 *   * `next/server` (a bundler-style extensionless subpath)
 *
 * `scripts/test/register.mjs` registers this hook, which teaches Node just
 * enough to load the real route handlers and server modules under test.
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

const srcRoot = pathToFileURL(path.join(process.cwd(), "src") + path.sep).href;
const serverOnlyStub = pathToFileURL(
  path.join(process.cwd(), "scripts", "test", "server-only-stub.mjs"),
).href;

export async function resolve(specifier, context, next) {
  if (specifier === "server-only") {
    return { url: serverOnlyStub, shortCircuit: true };
  }
  if (specifier === "next/server") {
    return next("next/server.js", context);
  }
  if (specifier.startsWith("@/")) {
    const target = new URL(specifier.slice(2), srcRoot).href;
    try {
      return await next(target, context);
    } catch {
      // Next-style aliases omit the extension; Node's ESM loader requires it.
      return next(`${target}.ts`, context);
    }
  }
  return next(specifier, context);
}
