"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCell = drawCell;
/**
 * Draws one practice cell's guide grid at full opacity for the outer
 * border, then dashed 30%-opacity guides (both midlines and both
 * diagonals) — the classic 初字格/kanji-practice grid pattern. Character
 * glyphs are drawn separately by drawCharacter, on top of this grid.
 *
 * Restores doc's dash and opacity state to solid/full-opacity before
 * returning, so callers can safely stroke solid full-opacity shapes
 * (e.g. the next cell's border) immediately afterward without
 * resetting drawing state themselves.
 */
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
    // Restore solid, full-opacity drawing state so it doesn't leak into
    // whatever is drawn next (e.g. the next cell's border).
    doc.undash().opacity(1);
}
