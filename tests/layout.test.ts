import { computeLayout } from "../src/layout";

describe("computeLayout", () => {
  it("fits a 7×10 grid on an ANSI A page at 72pt margin and 72pt cells", () => {
    const result = computeLayout({
      pageWidth: 612,
      pageHeight: 792,
      margin: 72,
      cellSize: 72,
    });

    expect(result.columns).toBe(6);
    expect(result.rows).toBe(9);
  });

  it("returns horizontally centered cell positions", () => {
    const result = computeLayout({
      pageWidth: 612,
      pageHeight: 792,
      margin: 72,
      cellSize: 72,
    });

    // leftover = 468 - (6 * 72) = 36, split = 18, so xOffset = 72 + 18 = 90
    expect(result.cells[0]).toEqual({ x: 90, y: 72 });        // top-left cell
    expect(result.cells[1]).toEqual({ x: 162, y: 72 });       // second in first row
    expect(result.cells[6]).toEqual({ x: 90, y: 144 });       // first in second row
  });

  describe("direction", () => {
    // Small, exact grid to make traversal order easy to reason about:
    // pageWidth 300, margin 0 => usableWidth 300, cellSize 100 => 3 columns.
    // pageHeight 200, margin 0 => usableHeight 200, cellSize 100 => 2 rows.
    const params = { pageWidth: 300, pageHeight: 200, margin: 0, cellSize: 100 };

    it("defaults to horizontal (row-major, left-to-right, top-to-bottom) when direction is omitted", () => {
      const result = computeLayout(params);

      expect(result.cells).toEqual([
        { x: 0, y: 0 },     { x: 100, y: 0 },   { x: 200, y: 0 },   // row 0, left to right
        { x: 0, y: 100 },   { x: 100, y: 100 }, { x: 200, y: 100 }, // row 1, left to right
      ]);
    });

    it("is unchanged when direction is explicitly 'horizontal'", () => {
      const withoutDirection = computeLayout(params);
      const withHorizontal = computeLayout({ ...params, direction: "horizontal" });

      expect(withHorizontal.cells).toEqual(withoutDirection.cells);
    });

    it("traverses column-major, right-to-left, top-to-bottom within each column, for 'vertical' (tategaki order)", () => {
      const result = computeLayout({ ...params, direction: "vertical" });

      // Rightmost column (x=200) first, top-to-bottom; then the middle
      // column (x=100); then the leftmost column (x=0) — the traditional
      // Japanese/Chinese vertical writing order.
      expect(result.cells).toEqual([
        { x: 200, y: 0 },   { x: 200, y: 100 }, // rightmost column, top to bottom
        { x: 100, y: 0 },   { x: 100, y: 100 }, // middle column
        { x: 0, y: 0 },     { x: 0, y: 100 },   // leftmost column
      ]);
    });

    it("does not change the grid's columns/rows counts or cell size, only traversal order", () => {
      const horizontal = computeLayout({ ...params, direction: "horizontal" });
      const vertical = computeLayout({ ...params, direction: "vertical" });

      expect(vertical.columns).toBe(horizontal.columns);
      expect(vertical.rows).toBe(horizontal.rows);
      expect(vertical.cells.length).toBe(horizontal.cells.length);
      // Same set of positions, just reordered.
      expect(new Set(vertical.cells.map((c) => `${c.x},${c.y}`))).toEqual(
        new Set(horizontal.cells.map((c) => `${c.x},${c.y}`))
      );
    });
  });

});