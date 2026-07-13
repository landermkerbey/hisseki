import { renderPage } from "../src/renderer";

describe("renderPage", () => {
  it("calls drawCell for every cell in the layout", () => {
    const mockDoc = {
      rect: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      dash: jest.fn().mockReturnThis(),
      undash: jest.fn().mockReturnThis(),
      opacity: jest.fn().mockReturnThis(),
    };

    renderPage(mockDoc as any, {
      pageWidth: 612,
      pageHeight: 792,
      margin: 72,
      cellSize: 72,
    });

    // 6 columns × 9 rows = 54 cells, each gets one rect call for its border
    expect(mockDoc.rect).toHaveBeenCalledTimes(54);
  });
});