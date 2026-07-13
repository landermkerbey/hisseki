import { loadStrokeData } from "../src/strokeData";

describe("loadStrokeData", () => {
  it("loads real stroke/median data for a character present in hanzi-writer-data", () => {
    const data = loadStrokeData("永");

    expect(data).toBeDefined();
    expect(Array.isArray(data!.strokes)).toBe(true);
    expect(data!.strokes.length).toBeGreaterThan(0);
    expect(Array.isArray(data!.medians)).toBe(true);
    expect(data!.medians.length).toBe(data!.strokes.length);
    // Each stroke's median should be a list of [x, y] points.
    expect(Array.isArray(data!.medians[0][0])).toBe(true);
    expect(data!.medians[0][0].length).toBe(2);
  });

  it("returns undefined for characters not covered by the dataset (e.g. hiragana)", () => {
    expect(loadStrokeData("あ")).toBeUndefined();
  });

  it("returns undefined for characters not covered by the dataset (e.g. Latin letters)", () => {
    expect(loadStrokeData("A")).toBeUndefined();
  });

  it("returns undefined for a multi-character string rather than throwing", () => {
    expect(loadStrokeData("永水")).toBeUndefined();
  });

  it("returns undefined for an empty string rather than throwing", () => {
    expect(loadStrokeData("")).toBeUndefined();
  });
});
