import { CharacterConfig, CellEntry, generateCellSequence } from "./sequence";

export type LayoutMode = "grouped" | "roundRobin";

export interface ContentParams {
  mode: LayoutMode;
  characters: CharacterConfig[];
}

export function generateContent(params: ContentParams): CellEntry[] {
  const { mode, characters } = params;

  const sequences = characters.map(generateCellSequence);

  if (mode === "grouped") {
    return sequences.flat();
  }

  // roundRobin: interleave by taking one entry at a time from each sequence
  const result: CellEntry[] = [];
  const length = sequences[0].length;

  for (let i = 0; i < length; i++) {
    for (const sequence of sequences) {
      result.push(sequence[i]);
    }
  }

  return result;
}