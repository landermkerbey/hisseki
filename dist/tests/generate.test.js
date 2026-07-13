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
});
