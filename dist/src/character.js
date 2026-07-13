"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCharacter = drawCharacter;
/**
 * Draws one glyph centered inside a cell at a given opacity. Vertical
 * centering uses PDFKit's reported line height for the current font,
 * so results depend on the font's own metrics (see registerFont).
 * Horizontal centering uses PDFKit's built-in `align: "center"` text
 * option over the full cell width.
 */
function drawCharacter(doc, cell, cellSize, character, font, opacity) {
    const fontSize = cellSize * 0.8;
    doc.font(font);
    doc.fontSize(fontSize);
    const lineHeight = doc.currentLineHeight(true);
    const verticalOffset = (cellSize - lineHeight) / 2;
    doc
        .opacity(opacity)
        .text(character, cell.x, cell.y + verticalOffset, {
        width: cellSize,
        align: "center",
        lineBreak: false,
    });
}
