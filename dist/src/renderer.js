"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = renderPage;
const layout_1 = require("./layout");
const cell_1 = require("./cell");
function renderPage(doc, params) {
    const layout = (0, layout_1.computeLayout)(params);
    for (const cell of layout.cells) {
        (0, cell_1.drawCell)(doc, cell, params.cellSize);
    }
}
