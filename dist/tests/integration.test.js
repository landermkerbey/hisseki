"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const renderer_1 = require("../src/renderer");
const generate_1 = require("../src/generate");
const OUTPUT_PATH = path_1.default.join(__dirname, "output.pdf");
const OUTPUT_PATH_2 = path_1.default.join(__dirname, "output2.pdf");
describe("integration", () => {
    it("writes a non-empty PDF to disk", (done) => {
        const doc = new pdfkit_1.default({ size: "LETTER", margin: 0 });
        const stream = fs_1.default.createWriteStream(OUTPUT_PATH);
        doc.pipe(stream);
        (0, renderer_1.renderPage)(doc, {
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
        });
        doc.end();
        stream.on("finish", () => {
            const stats = fs_1.default.statSync(OUTPUT_PATH);
            expect(stats.size).toBeGreaterThan(0);
            done();
        });
    });
    it("generates a multi-page PDF when content exceeds one page", (done) => {
        const stream = fs_1.default.createWriteStream(OUTPUT_PATH_2);
        (0, generate_1.generate)({
            outputStream: stream,
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
            mode: "grouped",
            characters: [
                {
                    character: "永",
                    cellsPerCharacter: 30,
                    opacity: { type: "fade", start: 0.8, end: 0.2 },
                },
                {
                    character: "水",
                    cellsPerCharacter: 30,
                    opacity: { type: "modelThenFixed", modelOpacity: 0.9, practiceOpacity: 0.3 },
                },
            ],
            font: "Helvetica",
        });
        stream.on("finish", () => {
            const stats = fs_1.default.statSync(OUTPUT_PATH_2);
            expect(stats.size).toBeGreaterThan(0);
            done();
        });
    });
    afterAll(() => {
        if (fs_1.default.existsSync(OUTPUT_PATH))
            fs_1.default.unlinkSync(OUTPUT_PATH);
        if (fs_1.default.existsSync(OUTPUT_PATH_2))
            fs_1.default.unlinkSync(OUTPUT_PATH_2);
    });
});
