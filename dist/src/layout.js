"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLayout = computeLayout;
/**
 * Fits as many whole cellSize x cellSize cells as possible inside the
 * page's margins and returns their positions. The grid is centered
 * horizontally; see comments below for the vertical case.
 */
function computeLayout(params) {
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
    const cells = [];
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
    }
    else {
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
