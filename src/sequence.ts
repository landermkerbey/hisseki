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

/**
 * One character's practice run: which glyph, how many cells, how ink
 * opacity evolves across them, and whether to render it using real
 * stroke-order path data (see strokeData.ts/strokeCharacter.ts)
 * instead of a plain font glyph. strokeOrder defaults to false; when
 * true but no stroke data is found for `character` (e.g. hiragana,
 * katakana, or non-CJK scripts), rendering falls back to the normal
 * font glyph (see generate.ts).
 */
export interface CharacterConfig {
  character: string;
  cellsPerCharacter: number;
  opacity: OpacityConfig;
  strokeOrder?: boolean;
}

/**
 * A single resolved cell: the glyph to draw, the opacity to draw it
 * at, whether stroke-order rendering was requested for it, and
 * whether it's the first ("model") cell of its character's run —
 * used to decide whether to show stroke-order numbers (see
 * generate.ts), since real workbooks typically number strokes once,
 * on the reference glyph, not on every practice repetition.
 */
export interface CellEntry {
  character: string;
  opacity: number;
  strokeOrder: boolean;
  isFirstCell: boolean;
}

/**
 * Expands one CharacterConfig into cellsPerCharacter resolved CellEntry
 * values, resolving the opacity curve for each cell index.
 *
 * A "fade" run of exactly one cell has no meaningful ramp to divide
 * across, so it uses `start` directly rather than dividing by zero.
 */
export function generateCellSequence(config: CharacterConfig): CellEntry[] {
  const { character, cellsPerCharacter, opacity, strokeOrder = false } = config;

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

    cells.push({ character, opacity: cellOpacity, strokeOrder, isFirstCell: i === 0 });
  }

  return cells;
}