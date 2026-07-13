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
const strokeData_1 = require("./strokeData");
const strokeCharacter_1 = require("./strokeCharacter");
/**
 * Top-level pipeline: layout -> content -> pagination -> PDF rendering.
 *
 * The PDF page size is set to [pageWidth, pageHeight] from params, so
 * the grid computed by computeLayout always matches the physical page.
 *
 * doc.end() is called synchronously but PDF writing is async. Callers
 * writing to a regular file should wait for the outputStream's
 * "finish" event; callers writing to process.stdout/stderr should
 * instead listen for the returned document's own "end" event, since
 * Node's stream.pipe() deliberately never calls .end() on stdout/
 * stderr (to avoid closing the real fd), so "finish" never fires on
 * them (see index.ts).
 */
function generate(params) {
    const { outputStream, mode, characters, font, fontPath, ...layoutParams } = params;
    const layout = (0, layout_1.computeLayout)(layoutParams);
    const cellsPerPage = layout.columns * layout.rows;
    const content = (0, content_1.generateContent)({ mode, characters });
    const pages = (0, paginate_1.paginateContent)(content, cellsPerPage);
    const doc = new pdfkit_1.default({
        size: [params.pageWidth, params.pageHeight],
        margin: 0,
        autoFirstPage: false,
    });
    doc.pipe(outputStream);
    (0, font_1.registerFont)(doc, font, fontPath);
    for (const page of pages) {
        doc.addPage();
        for (let i = 0; i < page.length; i++) {
            const cell = layout.cells[i];
            const entry = page[i];
            (0, cell_1.drawCell)(doc, cell, params.cellSize);
            // strokeOrder rendering is opt-in per character and only attempted
            // when data actually exists for it; anything not covered by the
            // stroke dataset (e.g. hiragana, katakana, Latin) falls back to
            // the normal font glyph exactly as if strokeOrder were false.
            const strokeData = entry.strokeOrder ? (0, strokeData_1.loadStrokeData)(entry.character) : undefined;
            if (strokeData) {
                // Numbers are only shown on the first ("model") cell of a
                // character's run, matching how real workbooks number strokes
                // once on the reference glyph rather than on every repetition.
                (0, strokeCharacter_1.drawStrokeOrderCharacter)(doc, cell, params.cellSize, strokeData, entry.opacity, {
                    showNumbers: entry.isFirstCell,
                });
            }
            else {
                (0, character_1.drawCharacter)(doc, cell, params.cellSize, entry.character, font, entry.opacity);
            }
        }
    }
    doc.end();
    return doc;
}
