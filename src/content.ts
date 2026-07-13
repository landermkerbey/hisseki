import { CharacterConfig, CellEntry, generateCellSequence } from "./sequence";

/**
 * How multiple characters' cell sequences are combined into one flat
 * stream before pagination:
 *
 * - grouped:    all cells for character 1, then all cells for character
 *                2, etc. Good for drilling one character at a time.
 * - roundRobin: one cell from each character in turn, repeated. Good for
 *                interleaved practice (e.g. alternating kanji to avoid
 *                rote copying of a single shape).
 */
export type LayoutMode = "grouped" | "roundRobin";

export interface ContentParams {
  mode: LayoutMode;
  characters: CharacterConfig[];
}

/**
 * Builds the full, unpaginated stream of cells for a document.
 *
 * roundRobin tolerates characters with differing cellsPerCharacter: it
 * loops up to the length of the *longest* sequence, and on each round
 * skips any sequence that has already been exhausted rather than
 * pushing an undefined placeholder or cutting other sequences short.
 */
export function generateContent(params: ContentParams): CellEntry[] {
  const { mode, characters } = params;

  const sequences = characters.map(generateCellSequence);

  if (mode === "grouped") {
    return sequences.flat();
  }

  // roundRobin: interleave by taking one entry at a time from each
  // sequence, for as many rounds as the longest sequence needs. Shorter
  // sequences simply stop contributing once exhausted.
  const result: CellEntry[] = [];
  const maxLength = Math.max(...sequences.map((sequence) => sequence.length));

  for (let i = 0; i < maxLength; i++) {
    for (const sequence of sequences) {
      if (i < sequence.length) {
        result.push(sequence[i]);
      }
    }
  }

  return result;
}