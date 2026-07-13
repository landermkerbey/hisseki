/**
 * Grid geometry for one page: page dimensions, margin on all four sides,
 * and the edge length of each (square) practice cell. All units are
 * PDF points (1/72 inch), matching PDFKit's coordinate system.
 */
/**
 * Order in which cells are visited/filled, independent of their
 * physical position on the page:
 *
 * - horizontal (default): row-major, left to right, top to bottom —
 *   the usual order for Latin-alphabet and most CJK horizontal
 *   (yokogaki) practice sheets.
 * - vertical: column-major, top to bottom within a column, columns
 *   right to left — the traditional Japanese/Chinese vertical
 *   (tategaki) reading/writing order.
 *
 * This only changes which content cell fills which square; the grid's
 * physical geometry (column/row count, cell positions) is identical
 * either way.
 */
export type LayoutDirection = "horizontal" | "vertical";

export interface LayoutParams {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  cellSize: number;
  /** Defaults to "horizontal" when omitted. */
  direction?: LayoutDirection;
}

export interface Cell {
  x: number;
  y: number;
}

/**
 * Result of computeLayout: the grid dimensions and the top-left corner
 * of every cell, in traversal order (row-major left-to-right for
 * "horizontal", column-major right-to-left for "vertical"; see
 * LayoutDirection).
 */
export interface Layout {
  columns: number;
  rows: number;
  cells: Cell[];
}

/**
 * Fits as many whole cellSize x cellSize cells as possible inside the
 * page's margins and returns their positions. The grid is centered
 * horizontally; see comments below for the vertical case.
 */
export function computeLayout(params: LayoutParams): Layout {
  const { pageWidth, pageHeight, margin, cellSize, direction = "horizontal" } = params;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Cells never span partial widths, so any remainder is absorbed as
  // extra whitespace rather than a partial column.
  const columns = Math.floor(usableWidth / cellSize);
  const rows = Math.floor(usableHeight / cellSize);

  // Center the grid horizontally within the margins by splitting the
  // leftover width evenly on both sides. Vertical leftover is left
  // untouched (rows start flush at the top margin); see "Missing
  // features" in README.org for centering the grid vertically too.
  const leftover = usableWidth - columns * cellSize;
  const xOffset = margin + leftover / 2;

  const cells: Cell[] = [];

  if (direction === "vertical") {
    // Column-major, right-to-left across columns, top-to-bottom within
    // each column (tategaki order).
    for (let col = columns - 1; col >= 0; col--) {
      for (let row = 0; row < rows; row++) {
        cells.push({
          x: xOffset + col * cellSize,
          y: margin + row * cellSize,
        });
      }
    }
  } else {
    // Row-major, left-to-right, top-to-bottom (horizontal/default).
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        cells.push({
          x: xOffset + col * cellSize,
          y: margin + row * cellSize,
        });
      }
    }
  }

  return { columns, rows, cells };
}