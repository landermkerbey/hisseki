/**
 * How ink opacity varies across the cellsPerCharacter repetitions of a
 * single character. This is the mechanism behind the "trace, then fade,
 * then write from memory" progression common to handwriting drills:
 *
 * - fixed:          every cell uses the same opacity.
 * - fade:            opacity ramps linearly from start to end across all
 *                     cells (first cell = start, last cell = end).
 * - modelThenFixed:  cell 0 (the model to trace) uses modelOpacity; every
 *                     remaining cell (practice) uses practiceOpacity.
 */
export type OpacityConfig =
  | { type: "fixed"; opacity: number }
  | { type: "fade"; start: number; end: number }
  | { type: "modelThenFixed"; modelOpacity: number; practiceOpacity: number };

/** One character's practice run: which glyph, how many cells, and how ink opacity evolves across them. */
export interface CharacterConfig {
  character: string;
  cellsPerCharacter: number;
  opacity: OpacityConfig;
}

/** A single resolved cell: the glyph to draw and the opacity to draw it at. */
export interface CellEntry {
  character: string;
  opacity: number;
}

/**
 * Expands one CharacterConfig into cellsPerCharacter resolved CellEntry
 * values, resolving the opacity curve for each cell index.
 *
 * A "fade" run of exactly one cell has no meaningful ramp to divide
 * across, so it uses `start` directly rather than dividing by zero.
 */
export function generateCellSequence(config: CharacterConfig): CellEntry[] {
  const { character, cellsPerCharacter, opacity } = config;

  const cells: CellEntry[] = [];

  for (let i = 0; i < cellsPerCharacter; i++) {
    let cellOpacity: number;

    switch (opacity.type) {
      case "fixed":
        cellOpacity = opacity.opacity;
        break;
      case "fade":
        if (cellsPerCharacter === 1) {
          cellOpacity = opacity.start;
        } else {
          const step = (opacity.start - opacity.end) / (cellsPerCharacter - 1);
          cellOpacity = opacity.start - step * i;
        }
        break;
      case "modelThenFixed":
        cellOpacity = i === 0 ? opacity.modelOpacity : opacity.practiceOpacity;
        break;
    }

    cells.push({ character, opacity: cellOpacity });
  }

  return cells;
}