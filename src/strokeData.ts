import fs from "fs";
import path from "path";

/**
 * Raw stroke-order data for one character, as published by the
 * hanzi-writer-data package (itself derived from the Make Me a Hanzi
 * project). `strokes` are SVG path `d` strings (one per stroke, in
 * drawing order); `medians` are each stroke's simplified centerline as
 * a list of [x, y] points, used here to find where each stroke begins
 * for numbering. Coordinates are in the fixed 1024x1024 box described
 * in strokeTransform.ts.
 */
export interface StrokeCharacterData {
  strokes: string[];
  medians: number[][][];
}

// Resolved once and cached: null means resolution failed (package not
// installed), a string is the directory containing per-character
// <char>.json files.
let cachedDataDir: string | null | undefined;

function resolveDataDir(): string | null {
  if (cachedDataDir !== undefined) return cachedDataDir;

  try {
    cachedDataDir = path.dirname(require.resolve("hanzi-writer-data/package.json"));
  } catch {
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
export function loadStrokeData(character: string): StrokeCharacterData | undefined {
  if (Array.from(character).length !== 1) return undefined;

  const dataDir = resolveDataDir();
  if (!dataDir) return undefined;

  try {
    const raw = fs.readFileSync(path.join(dataDir, `${character}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
