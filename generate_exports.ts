import { expandGlob } from "@std/fs";
import { parse } from "@std/jsonc";
import { fromFileUrl, join, relative, SEPARATOR } from "@std/path";

if (import.meta.main) {
  /**
   * exports is the list of generated export entries.
   * @see https://jsr.io/docs/package-configuration#exports
   */
  const exports: [string, string][] = [];
  const glob = new URL(import.meta.resolve("./src/**/*.ts"));
  for await (const entry of await expandGlob(glob)) {
    if (!entry.isFile || !entry.name.endsWith(".ts")) {
      continue;
    }

    if (entry.name.endsWith("_test.ts")) {
      continue;
    }

    const relativePath = relative(
      join(fromFileUrl(import.meta.url), "../"),
      entry.path,
    ).replaceAll(SEPARATOR, "/");
    if (relativePath.startsWith("src/example")) {
      continue;
    }

    const trimmedName = relativePath
      .replace(/^src\//, "./")
      .replace(/\.ts$/, "");

    if (trimmedName.endsWith("mod")) {
      exports.push([
        trimmedName.replace(/\/mod$/, ""),
        `./${relativePath}`,
      ]);
    } else {
      exports.push([trimmedName, `./${relativePath}`]);
    }
    const denoConfigLocation = new URL(import.meta.resolve("./deno.jsonc"));
    // deno-lint-ignore no-explicit-any
    const denoConfig: any = parse(
      await Deno.readTextFile(denoConfigLocation),
    );
    denoConfig.exports = Object.fromEntries(exports);
    await Deno.writeTextFile(
      denoConfigLocation,
      JSON.stringify(denoConfig, null, 2) + "\n",
    );
  }
}
