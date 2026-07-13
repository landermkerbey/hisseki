"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStrokeData = loadStrokeData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Resolved once and cached: null means resolution failed (package not
// installed), a string is the directory containing per-character
// <char>.json files.
let cachedDataDir;
function resolveDataDir() {
    if (cachedDataDir !== undefined)
        return cachedDataDir;
    try {
        cachedDataDir = path_1.default.dirname(require.resolve("hanzi-writer-data/package.json"));
    }
    catch {
        cachedDataDir = null;
    }
    return cachedDataDir;
}
/**
 * Looks up stroke-order data for a single character. Returns undefined
 * (never throws) when:
 * - `character` isn't exactly one Unicode code point,
 * - the hanzi-writer-data package isn't installed, or
 * - that character isn't covered by the dataset (e.g. hiragana,
 *   katakana, and non-CJK scripts aren't included \u2014 this dataset is
 *   Chinese-hanzi-derived, though it covers most Japanese kanji since
 *   the two scripts share the vast majority of their characters).
 *
 * Callers should treat undefined as "fall back to plain font
 * rendering for this character" rather than as an error.
 */
function loadStrokeData(character) {
    if (Array.from(character).length !== 1)
        return undefined;
    const dataDir = resolveDataDir();
    if (!dataDir)
        return undefined;
    try {
        const raw = fs_1.default.readFileSync(path_1.default.join(dataDir, `${character}.json`), "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
}
