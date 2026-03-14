import { CellEntry } from "./sequence";

export function paginateContent(cells: CellEntry[], cellsPerPage: number): CellEntry[][] {
  const pages: CellEntry[][] = [];

  for (let i = 0; i < cells.length; i += cellsPerPage) {
    pages.push(cells.slice(i, i + cellsPerPage));
  }

  return pages;
}