import { PassThrough } from "stream";

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
});
