import { drawCharacter } from "../src/character";

describe("drawCharacter", () => {
  it("centers a character in a cell at a given opacity", () => {
    const mockDoc = {
      font: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      opacity: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
    };

    drawCharacter(mockDoc as any, { x: 0, y: 0 }, 72, "永", "NotoSansCJK", 0.5);

    expect(mockDoc.font).toHaveBeenCalledWith("NotoSansCJK");
    expect(mockDoc.fontSize).toHaveBeenCalledWith(72 * 0.8);
    expect(mockDoc.opacity).toHaveBeenCalledWith(0.5);
    expect(mockDoc.text).toHaveBeenCalledWith("永", 0, expect.any(Number), {
      width: 72,
      align: "center",
    });
  });
});