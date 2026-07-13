"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = getVersion;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Reads the `version` field from the nearest package.json found by
 * walking up from startDir. This avoids hardcoding a relative path
 * such as "../package.json", which would resolve correctly from
 * src/version.ts (one level below the project root) but incorrectly
 * from the compiled dist/src/version.js (two levels below the
 * project root, since only src/ and tests/ are mirrored under dist/).
 */
function getVersion(startDir) {
    let dir = path_1.default.resolve(startDir);
    while (true) {
        const candidate = path_1.default.join(dir, "package.json");
        if (fs_1.default.existsSync(candidate)) {
            const raw = fs_1.default.readFileSync(candidate, "utf-8");
            return JSON.parse(raw).version;
        }
        const parent = path_1.default.dirname(dir);
        if (parent === dir)
            break;
        dir = parent;
    }
    throw new Error(`package.json not found above ${startDir}`);
}
