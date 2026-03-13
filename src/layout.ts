export interface LayoutParams {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  cellSize: number;
}

export interface Cell {
  x: number;
  y: number;
}

export interface Layout {
  columns: number;
  rows: number;
  cells: Cell[];
}

export function computeLayout(params: LayoutParams): Layout {
  const { pageWidth, pageHeight, margin, cellSize } = params;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const columns = Math.floor(usableWidth / cellSize);
  const rows = Math.floor(usableHeight / cellSize);

  const leftover = usableWidth - columns * cellSize;
  const xOffset = margin + leftover / 2;

  const cells: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      cells.push({
        x: xOffset + col * cellSize,
        y: margin + row * cellSize,
      });
    }
  }

  return { columns, rows, cells };
}