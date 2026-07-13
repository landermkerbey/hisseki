"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const mockDocInstance = {
    pipe: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    dash: jest.fn().mockReturnThis(),
    undash: jest.fn().mockReturnThis(),
    opacity: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    currentLineHeight: jest.fn().mockReturnValue(10),
    text: jest.fn().mockReturnThis(),
    registerFont: jest.fn().mockReturnThis(),
};
const MockPDFDocument = jest.fn().mockImplementation(() => mockDocInstance);
jest.mock("pdfkit", () => {
    return jest.fn().mockImplementation((...args) => MockPDFDocument(...args));
});
const generate_1 = require("../src/generate");
describe("generate", () => {
    beforeEach(() => {
        MockPDFDocument.mockClear();
        Object.values(mockDocInstance).forEach((fn) => {
            if (jest.isMockFunction(fn))
                fn.mockClear();
        });
    });
    it("constructs the PDF document at the configured pageWidth/pageHeight rather than a hardcoded LETTER size", () => {
        (0, generate_1.generate)({
            outputStream: new stream_1.PassThrough(),
            pageWidth: 420,
            pageHeight: 595, // A5 in points
            margin: 36,
            cellSize: 60,
            mode: "grouped",
            characters: [
                { character: "永", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 1 } },
            ],
            font: "Helvetica",
        });
        expect(MockPDFDocument).toHaveBeenCalledWith(expect.objectContaining({ size: [420, 595] }));
    });
    it("returns the underlying PDFDocument so callers can observe completion independent of the destination stream's own 'finish' event", () => {
        const result = (0, generate_1.generate)({
            outputStream: new stream_1.PassThrough(),
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
            mode: "grouped",
            characters: [
                { character: "永", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 1 } },
            ],
            font: "Helvetica",
        });
        expect(result).toBe(mockDocInstance);
    });
    it("still produces a document for the standard Letter size", () => {
        (0, generate_1.generate)({
            outputStream: new stream_1.PassThrough(),
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
            mode: "grouped",
            characters: [
                { character: "永", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 1 } },
            ],
            font: "Helvetica",
        });
        expect(MockPDFDocument).toHaveBeenCalledWith(expect.objectContaining({ size: [612, 792] }));
    });
    describe("direction", () => {
        it("draws cells in row-major, left-to-right order by default (direction omitted)", () => {
            (0, generate_1.generate)({
                outputStream: new stream_1.PassThrough(),
                pageWidth: 300,
                pageHeight: 200,
                margin: 0,
                cellSize: 100,
                mode: "grouped",
                characters: [
                    { character: "A", cellsPerCharacter: 6, opacity: { type: "fixed", opacity: 1 } },
                ],
                font: "Helvetica",
            });
            const rectCalls = mockDocInstance.rect.mock.calls;
            expect(rectCalls).toEqual([
                [0, 0, 100, 100],
                [100, 0, 100, 100],
                [200, 0, 100, 100],
                [0, 100, 100, 100],
                [100, 100, 100, 100],
                [200, 100, 100, 100],
            ]);
        });
        it("draws cells in column-major, right-to-left (tategaki) order when direction is 'vertical'", () => {
            (0, generate_1.generate)({
                outputStream: new stream_1.PassThrough(),
                pageWidth: 300,
                pageHeight: 200,
                margin: 0,
                cellSize: 100,
                mode: "grouped",
                direction: "vertical",
                characters: [
                    { character: "A", cellsPerCharacter: 6, opacity: { type: "fixed", opacity: 1 } },
                ],
                font: "Helvetica",
            });
            const rectCalls = mockDocInstance.rect.mock.calls;
            expect(rectCalls).toEqual([
                [200, 0, 100, 100], // rightmost column, top
                [200, 100, 100, 100], // rightmost column, bottom
                [100, 0, 100, 100], // middle column, top
                [100, 100, 100, 100], // middle column, bottom
                [0, 0, 100, 100], // leftmost column, top
                [0, 100, 100, 100], // leftmost column, bottom
            ]);
        });
    });
});
