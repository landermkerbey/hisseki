import fs from "fs";
import path from "path";

/**
 * Reads the `version` field from the nearest package.json found by
 * walking up from startDir. This avoids hardcoding a relative path
 * such as "../package.json", which would resolve correctly from
 * src/version.ts (one level below the project root) but incorrectly
 * from the compiled dist/src/version.js (two levels below the
 * project root, since only src/ and tests/ are mirrored under dist/).
 */
export function getVersion(startDir: string): string {
  let dir = path.resolve(startDir);

  while (true) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, "utf-8");
      return JSON.parse(raw).version;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(`package.json not found above ${startDir}`);
}
