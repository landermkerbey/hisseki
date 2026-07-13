import { computeLayout, LayoutParams } from "./layout";
import { drawCell } from "./cell";

/**
 * Draws an empty grid (borders + guidelines, no glyphs) for the given
 * page geometry directly onto doc, with no pagination, glyph drawing,
 * or page-adding of its own. This is a thin composition of layout.ts +
 * cell.ts kept separate from generate.ts's full pipeline; currently
 * used only by tests and not wired into the CLI. A blank-grid-only CLI
 * mode could be built on top of this (see README.org's "Enhancements"
 * section).
 */
export function renderPage(doc: any, params: LayoutParams): void {
  const layout = computeLayout(params);

  for (const cell of layout.cells) {
    drawCell(doc, cell, params.cellSize);
  }
}