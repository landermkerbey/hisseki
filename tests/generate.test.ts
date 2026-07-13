import { PassThrough } from "stream";

const loadStrokeDataMock = jest.fn();
jest.mock("../src/strokeData", () => ({
  loadStrokeData: (character: string) => loadStrokeDataMock(character),
}));

const drawStrokeOrderCharacterMock = jest.fn();
jest.mock("../src/strokeCharacter", () => ({
  drawStrokeOrderCharacter: (...args: any[]) => drawStrokeOrderCharacterMock(...args),
}));

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
  return jest.fn().mockImplementation((...args: any[]) => MockPDFDocument(...args));
});

import { generate } from "../src/generate";

describe("generate", () => {
  beforeEach(() => {
    MockPDFDocument.mockClear();
    loadStrokeDataMock.mockReset();
    drawStrokeOrderCharacterMock.mockReset();
    Object.values(mockDocInstance).forEach((fn) => {
      if (jest.isMockFunction(fn)) fn.mockClear();
    });
  });

  it("constructs the PDF document at the configured pageWidth/pageHeight rather than a hardcoded LETTER size", () => {
    generate({
      outputStream: new PassThrough(),
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

    expect(MockPDFDocument).toHaveBeenCalledWith(
      expect.objectContaining({ size: [420, 595] })
    );
  });

  it("returns the underlying PDFDocument so callers can observe completion independent of the destination stream's own 'finish' event", () => {
    const result = generate({
      outputStream: new PassThrough(),
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
    generate({
      outputStream: new PassThrough(),
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

    expect(MockPDFDocument).toHaveBeenCalledWith(
      expect.objectContaining({ size: [612, 792] })
    );
  });

  describe("strokeOrder", () => {
    it("never calls loadStrokeData for characters with strokeOrder omitted/false", () => {
      generate({
        outputStream: new PassThrough(),
        pageWidth: 300,
        pageHeight: 300,
        margin: 0,
        cellSize: 100,
        mode: "grouped",
        characters: [
          { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 1 } },
        ],
        font: "Helvetica",
      });

      expect(loadStrokeDataMock).not.toHaveBeenCalled();
      expect(drawStrokeOrderCharacterMock).not.toHaveBeenCalled();
      expect(mockDocInstance.text).toHaveBeenCalled(); // fell through to drawCharacter
    });

    it("uses drawStrokeOrderCharacter when strokeOrder is true and data is found, showing numbers only on the first cell", () => {
      const fakeData = { strokes: ["M 0 0 Z"], medians: [[[0, 0]]] };
      loadStrokeDataMock.mockReturnValue(fakeData);

      generate({
        outputStream: new PassThrough(),
        pageWidth: 300,
        pageHeight: 300,
        margin: 0,
        cellSize: 100,
        mode: "grouped",
        characters: [
          {
            character: "永",
            cellsPerCharacter: 2,
            opacity: { type: "fixed", opacity: 0.5 },
            strokeOrder: true,
          },
        ],
        font: "Helvetica",
      });

      expect(loadStrokeDataMock).toHaveBeenCalledWith("永");
      expect(drawStrokeOrderCharacterMock).toHaveBeenCalledTimes(2);
      expect(mockDocInstance.text).not.toHaveBeenCalled(); // never fell back to drawCharacter

      // First cell (the "model") shows stroke numbers; the second
      // (practice) cell does not.
      expect(drawStrokeOrderCharacterMock).toHaveBeenNthCalledWith(
        1,
        mockDocInstance,
        expect.anything(),
        100,
        fakeData,
        0.5,
        { showNumbers: true }
      );
      expect(drawStrokeOrderCharacterMock).toHaveBeenNthCalledWith(
        2,
        mockDocInstance,
        expect.anything(),
        100,
        fakeData,
        0.5,
        { showNumbers: false }
      );
    });

    it("falls back to drawCharacter (plain font glyph) when strokeOrder is true but no data is found for the character", () => {
      loadStrokeDataMock.mockReturnValue(undefined);

      generate({
        outputStream: new PassThrough(),
        pageWidth: 300,
        pageHeight: 300,
        margin: 0,
        cellSize: 100,
        mode: "grouped",
        characters: [
          {
            character: "あ", // hiragana, not covered by the stroke dataset
            cellsPerCharacter: 1,
            opacity: { type: "fixed", opacity: 1 },
            strokeOrder: true,
          },
        ],
        font: "Helvetica",
      });

      expect(loadStrokeDataMock).toHaveBeenCalledWith("あ");
      expect(drawStrokeOrderCharacterMock).not.toHaveBeenCalled();
      expect(mockDocInstance.text).toHaveBeenCalled();
    });
  });

  describe("direction", () => {
    it("draws cells in row-major, left-to-right order by default (direction omitted)", () => {
      generate({
        outputStream: new PassThrough(),
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
      generate({
        outputStream: new PassThrough(),
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
        [200, 0, 100, 100],   // rightmost column, top
        [200, 100, 100, 100], // rightmost column, bottom
        [100, 0, 100, 100],   // middle column, top
        [100, 100, 100, 100], // middle column, bottom
        [0, 0, 100, 100],     // leftmost column, top
        [0, 100, 100, 100],   // leftmost column, bottom
      ]);
    });
  });
});
