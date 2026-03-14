"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLayout = computeLayout;
function computeLayout(params) {
    const { pageWidth, pageHeight, margin, cellSize } = params;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const columns = Math.floor(usableWidth / cellSize);
    const rows = Math.floor(usableHeight / cellSize);
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
