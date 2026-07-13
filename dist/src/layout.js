"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLayout = computeLayout;
/**
 * Fits as many whole cellSize x cellSize cells as possible inside the
 * page's margins and returns their positions. The grid is centered
 * horizontally; see comments below for the vertical case.
 */
function computeLayout(params) {
    const { pageWidth, pageHeight, margin, cellSize } = params;
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
    const cells = [];
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
