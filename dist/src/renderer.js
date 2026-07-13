"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = renderPage;
const layout_1 = require("./layout");
const cell_1 = require("./cell");
/**
 * Draws an empty grid (borders + guidelines, no glyphs) for the given
 * page geometry directly onto doc, with no pagination, glyph drawing,
 * or page-adding of its own. This is a thin composition of layout.ts +
 * cell.ts kept separate from generate.ts's full pipeline; currently
 * used only by tests and not wired into the CLI. A blank-grid-only CLI
 * mode could be built on top of this (see README.org's "Enhancements"
 * section).
 */
function renderPage(doc, params) {
    const layout = (0, layout_1.computeLayout)(params);
    for (const cell of layout.cells) {
        (0, cell_1.drawCell)(doc, cell, params.cellSize);
    }
}
