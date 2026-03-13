import { computeLayout, LayoutParams } from "./layout";
import { drawCell } from "./cell";

export function renderPage(doc: any, params: LayoutParams): void {
  const layout = computeLayout(params);

  for (const cell of layout.cells) {
    drawCell(doc, cell, params.cellSize);
  }
}