"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCell = drawCell;
function drawCell(doc, cell, cellSize) {
    const { x, y } = cell;
    const mid = cellSize / 2;
    // Outer border — full opacity, no dashing
    doc.rect(x, y, cellSize, cellSize).stroke();
    doc.dash(4, { space: 4 }).opacity(0.3);
    // Horizontal midline
    doc.moveTo(x, y + mid)
        .lineTo(x + cellSize, y + mid)
        .stroke();
    // Vertical midline
    doc.moveTo(x + mid, y).lineTo(x + mid, y + cellSize).stroke();
    // Diagonal top-left to bottom-right
    doc.moveTo(x, y).lineTo(x + cellSize, y + cellSize).stroke();
    // Diagonal top-right to bottom-left
    doc.moveTo(x + cellSize, y).lineTo(x, y + cellSize).stroke();
}
