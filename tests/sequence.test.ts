import { generateCellSequence } from "../src/sequence";

describe("generateCellSequence", () => {
  it("generates a fixed opacity sequence", () => {
    const result = generateCellSequence({
      character: "永",
      cellsPerCharacter: 3,
      opacity: { type: "fixed", opacity: 0.5 },
    });

    expect(result).toEqual([
      { character: "永", opacity: 0.5 },
      { character: "永", opacity: 0.5 },
      { character: "永", opacity: 0.5 },
    ]);
  });

  it("generates a fade opacity sequence", () => {
    const result = generateCellSequence({
      character: "永",
      cellsPerCharacter: 4,
      opacity: { type: "fade", start: 0.8, end: 0.3 },
    });

    expect(result).toEqual([
      { character: "永", opacity: 0.8 },
      { character: "永", opacity: expect.closeTo(0.633, 2) },
      { character: "永", opacity: expect.closeTo(0.467, 2) },
      { character: "永", opacity: expect.closeTo(0.3, 2) },
    ]);
  });

  it("uses the fade start opacity for a single-cell run, without dividing by zero", () => {
    const result = generateCellSequence({
      character: "永",
      cellsPerCharacter: 1,
      opacity: { type: "fade", start: 0.8, end: 0.3 },
    });

    expect(result).toEqual([{ character: "永", opacity: 0.8 }]);
  });

  it("generates a modelThenFixed opacity sequence", () => {
    const result = generateCellSequence({
      character: "永",
      cellsPerCharacter: 4,
      opacity: { type: "modelThenFixed", modelOpacity: 0.8, practiceOpacity: 0.2 },
    });

    expect(result).toEqual([
      { character: "永", opacity: 0.8 },
      { character: "永", opacity: 0.2 },
      { character: "永", opacity: 0.2 },
      { character: "永", opacity: 0.2 },
    ]);
  });
});