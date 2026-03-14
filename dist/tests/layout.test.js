"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layout_1 = require("../src/layout");
describe("computeLayout", () => {
    it("fits a 7×10 grid on an ANSI A page at 72pt margin and 72pt cells", () => {
        const result = (0, layout_1.computeLayout)({
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
        });
        expect(result.columns).toBe(6);
        expect(result.rows).toBe(9);
    });
    it("returns horizontally centered cell positions", () => {
        const result = (0, layout_1.computeLayout)({
            pageWidth: 612,
            pageHeight: 792,
            margin: 72,
            cellSize: 72,
        });
        // leftover = 468 - (6 * 72) = 36, split = 18, so xOffset = 72 + 18 = 90
        expect(result.cells[0]).toEqual({ x: 90, y: 72 }); // top-left cell
        expect(result.cells[1]).toEqual({ x: 162, y: 72 }); // second in first row
        expect(result.cells[6]).toEqual({ x: 90, y: 144 }); // first in second row
    });
});
