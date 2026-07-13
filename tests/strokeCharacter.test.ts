import { drawStrokeOrderCharacter } from "../src/strokeCharacter";
import { computeStrokeTransform, transformStrokePoint } from "../src/strokeTransform";

function makeMockDoc() {
  return {
    save: jest.fn().mockReturnThis(),
    restore: jest.fn().mockReturnThis(),
    translate: jest.fn().mockReturnThis(),
    scale: jest.fn().mockReturnThis(),
    opacity: jest.fn().mockReturnThis(),
    path: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
  };
}

const sampleData = {
  strokes: ["M 1 2 L 3 4 Z", "M 5 6 L 7 8 Z"],
  medians: [
    [
      [100, 200],
      [110, 210],
    ],
    [
      [300, 400],
      [310, 410],
    ],
  ],
};

describe("drawStrokeOrderCharacter", () => {
  it("applies the cell's opacity before drawing anything", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 0.4);

    expect(mockDoc.opacity).toHaveBeenCalledWith(0.4);
  });

  it("draws each stroke path inside a save/restore block, translated and scaled to fit the cell", () => {
    const mockDoc = makeMockDoc();
    const cell = { x: 50, y: 60 };
    const cellSize = 100;

    drawStrokeOrderCharacter(mockDoc as any, cell, cellSize, sampleData, 1);

    expect(mockDoc.save).toHaveBeenCalled();
    expect(mockDoc.restore).toHaveBeenCalled();

    // Every stroke's raw SVG path string is fed directly to doc.path().
    expect(mockDoc.path).toHaveBeenCalledWith(sampleData.strokes[0]);
    expect(mockDoc.path).toHaveBeenCalledWith(sampleData.strokes[1]);
    expect(mockDoc.path).toHaveBeenCalledTimes(2);
    expect(mockDoc.fill).toHaveBeenCalledTimes(2);

    // translate/scale reflect the cell's position and computeStrokeTransform's output.
    const padding = cellSize * 0.08;
    const transform = computeStrokeTransform(cellSize, padding);
    expect(mockDoc.translate).toHaveBeenCalledWith(
      cell.x + transform.xOffset,
      cell.y + cellSize - transform.yOffset
    );
    expect(mockDoc.scale).toHaveBeenCalledWith(transform.scale, -transform.scale);
  });

  it("does not draw stroke-order numbers unless showNumbers is passed", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 1);

    expect(mockDoc.text).not.toHaveBeenCalled();
  });

  it("draws a 1-indexed number at each stroke's starting point when showNumbers is true", () => {
    const mockDoc = makeMockDoc();
    const cell = { x: 20, y: 30 };
    const cellSize = 100;

    drawStrokeOrderCharacter(mockDoc as any, cell, cellSize, sampleData, 1, {
      showNumbers: true,
    });

    expect(mockDoc.text).toHaveBeenCalledTimes(2);

    const padding = cellSize * 0.08;
    const transform = computeStrokeTransform(cellSize, padding);
    const fontSize = cellSize * 0.12;

    const firstPoint = transformStrokePoint(
      sampleData.medians[0][0] as [number, number],
      cellSize,
      transform
    );
    const secondPoint = transformStrokePoint(
      sampleData.medians[1][0] as [number, number],
      cellSize,
      transform
    );

    expect(mockDoc.text).toHaveBeenNthCalledWith(
      1,
      "1",
      cell.x + firstPoint.x - fontSize / 2,
      cell.y + firstPoint.y - fontSize / 2,
      expect.objectContaining({ align: "center" })
    );
    expect(mockDoc.text).toHaveBeenNthCalledWith(
      2,
      "2",
      cell.x + secondPoint.x - fontSize / 2,
      cell.y + secondPoint.y - fontSize / 2,
      expect.objectContaining({ align: "center" })
    );
  });

  it("draws numbers in red", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 1, {
      showNumbers: true,
    });

    expect(mockDoc.fillColor).toHaveBeenCalledWith("red");

    // fillColor must be set to red before any number is actually drawn.
    const redCallOrder = mockDoc.fillColor.mock.invocationCallOrder[
      mockDoc.fillColor.mock.calls.findIndex((call) => call[0] === "red")
    ];
    const firstTextOrder = mockDoc.text.mock.invocationCallOrder[0];
    expect(redCallOrder).toBeLessThan(firstTextOrder);
  });

  it("resets fillColor back to black after drawing numbers, so it doesn't bleed into whatever is drawn next", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 1, {
      showNumbers: true,
    });

    const fillColorCalls = mockDoc.fillColor.mock.calls;
    expect(fillColorCalls[fillColorCalls.length - 1][0]).toBe("black");
  });

  it("draws numbers at full opacity regardless of the character's own (possibly faded) opacity", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 0.3, {
      showNumbers: true,
    });

    // opacity(1) must be set before any number is drawn, so numbers
    // never inherit the character's (possibly low) fade opacity and
    // become hard to see against fully-opaque black stroke fills.
    const opacityOneCallOrder = mockDoc.opacity.mock.invocationCallOrder[
      mockDoc.opacity.mock.calls.findIndex((call) => call[0] === 1)
    ];
    const firstTextOrder = mockDoc.text.mock.invocationCallOrder[0];
    expect(opacityOneCallOrder).toBeLessThan(firstTextOrder);
  });

  it("restores the character's original opacity after drawing numbers", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 0.3, {
      showNumbers: true,
    });

    const opacityCalls = mockDoc.opacity.mock.calls;
    expect(opacityCalls[opacityCalls.length - 1][0]).toBe(0.3);
  });

  it("does not touch fillColor/opacity-for-red-numbers at all when showNumbers is false", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 0.3);

    expect(mockDoc.fillColor).not.toHaveBeenCalled();
    // Only the single initial opacity(0.3) call for the character itself.
    expect(mockDoc.opacity).toHaveBeenCalledTimes(1);
    expect(mockDoc.opacity).toHaveBeenCalledWith(0.3);
  });

  it("draws numbers outside the scaled/translated save block, so they aren't distorted by the stroke transform", () => {
    const mockDoc = makeMockDoc();
    drawStrokeOrderCharacter(mockDoc as any, { x: 0, y: 0 }, 100, sampleData, 1, {
      showNumbers: true,
    });

    const saveOrder = mockDoc.save.mock.invocationCallOrder[0];
    const restoreOrder = mockDoc.restore.mock.invocationCallOrder[0];
    const firstTextOrder = mockDoc.text.mock.invocationCallOrder[0];

    expect(firstTextOrder).toBeGreaterThan(restoreOrder);
    expect(restoreOrder).toBeGreaterThan(saveOrder);
  });
});
