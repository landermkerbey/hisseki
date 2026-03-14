"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const pdfkit_1 = __importDefault(require("pdfkit"));
const layout_1 = require("./layout");
const content_1 = require("./content");
const paginate_1 = require("./paginate");
const cell_1 = require("./cell");
const character_1 = require("./character");
const font_1 = require("./font");
function generate(params) {
    const { outputStream, mode, characters, font, fontPath, ...layoutParams } = params;
    const layout = (0, layout_1.computeLayout)(layoutParams);
    const cellsPerPage = layout.columns * layout.rows;
    const content = (0, content_1.generateContent)({ mode, characters });
    const pages = (0, paginate_1.paginateContent)(content, cellsPerPage);
    const doc = new pdfkit_1.default({ size: "LETTER", margin: 0, autoFirstPage: false });
    doc.pipe(outputStream);
    (0, font_1.registerFont)(doc, font, fontPath);
    for (const page of pages) {
        doc.addPage();
        for (let i = 0; i < page.length; i++) {
            const cell = layout.cells[i];
            (0, cell_1.drawCell)(doc, cell, params.cellSize);
            (0, character_1.drawCharacter)(doc, cell, params.cellSize, page[i].character, font, page[i].opacity);
        }
    }
    doc.end();
}
