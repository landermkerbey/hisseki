"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawStrokeOrderCharacter = drawStrokeOrderCharacter;
const strokeTransform_1 = require("./strokeTransform");
/** Fraction of cellSize left empty on all four sides around the rendered glyph, matching drawCharacter's visual proportions. */
const PADDING_FRACTION = 0.08;
/** Stroke-order numeral size, as a fraction of cellSize. */
const NUMBER_FONT_SIZE_FRACTION = 0.12;
/**
 * Draws a character using its real stroke-order path data (from
 * hanzi-writer-data) instead of a font glyph: each stroke is filled as
 * its own shape, in stroke order, optionally with numbered labels at
 * each stroke's starting point (from its median's first point).
 *
 * The stroke-fill drawing happens inside its own save/restore block
 * because it needs PDFKit's translate+scale graphics state to map the
 * data's fixed 1024x1024 coordinate space onto the cell; numbers are
 * drawn afterward, once that transform is restored, so their text
 * isn't stretched/flipped along with the strokes.
 */
function drawStrokeOrderCharacter(doc, cell, cellSize, data, opacity, options = {}) {
    const padding = cellSize * PADDING_FRACTION;
    const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, padding);
    doc.opacity(opacity);
    doc.save();
    doc.translate(cell.x + transform.xOffset, cell.y + cellSize - transform.yOffset);
    doc.scale(transform.scale, -transform.scale);
    for (const strokePath of data.strokes) {
        doc.path(strokePath).fill("black");
    }
    doc.restore();
    if (options.showNumbers) {
        const fontSize = cellSize * NUMBER_FONT_SIZE_FRACTION;
        doc.font("Helvetica");
        doc.fontSize(fontSize);
        // Numbers must stand out against the (possibly fully-opaque black)
        // stroke fills, so they're always drawn in red at full opacity,
        // regardless of the character's own opacity/fade level —
        // otherwise a fully-opaque black model glyph makes black numbers
        // on black strokes nearly impossible to read.
        doc.fillColor("red");
        doc.opacity(1);
        for (let i = 0; i < data.medians.length; i++) {
            const start = data.medians[i][0];
            const point = (0, strokeTransform_1.transformStrokePoint)(start, cellSize, transform);
            doc.text(String(i + 1), cell.x + point.x - fontSize / 2, cell.y + point.y - fontSize / 2, {
                width: fontSize,
                align: "center",
                lineBreak: false,
            });
        }
        // Restore ambient fill color/opacity so they don't bleed into
        // whatever is drawn next (e.g. the next cell's glyph).
        doc.fillColor("black");
        doc.opacity(opacity);
    }
}
