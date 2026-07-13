"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cell_1 = require("../src/cell");
describe("drawCell", () => {
    it("draws the outer border and four guidelines for a cell", () => {
        const mockDoc = {
            rect: jest.fn().mockReturnThis(),
            moveTo: jest.fn().mockReturnThis(),
            lineTo: jest.fn().mockReturnThis(),
            stroke: jest.fn().mockReturnThis(),
            dash: jest.fn().mockReturnThis(),
            undash: jest.fn().mockReturnThis(),
            opacity: jest.fn().mockReturnThis(),
        };
        (0, cell_1.drawCell)(mockDoc, { x: 0, y: 0 }, 72);
        // Outer border
        expect(mockDoc.rect).toHaveBeenCalledWith(0, 0, 72, 72);
        // Horizontal midline
        expect(mockDoc.moveTo).toHaveBeenCalledWith(0, 36);
        expect(mockDoc.lineTo).toHaveBeenCalledWith(72, 36);
        // Vertical midline
        expect(mockDoc.moveTo).toHaveBeenCalledWith(36, 0);
        expect(mockDoc.lineTo).toHaveBeenCalledWith(36, 72);
        // Diagonal top-left to bottom-right
        expect(mockDoc.moveTo).toHaveBeenCalledWith(0, 0);
        expect(mockDoc.lineTo).toHaveBeenCalledWith(72, 72);
        // Diagonal top-right to bottom-left
        expect(mockDoc.moveTo).toHaveBeenCalledWith(72, 0);
        expect(mockDoc.lineTo).toHaveBeenCalledWith(0, 72);
    });
    it("applies dashing and reduced opacity to guidelines", () => {
        const mockDoc = {
            rect: jest.fn().mockReturnThis(),
            moveTo: jest.fn().mockReturnThis(),
            lineTo: jest.fn().mockReturnThis(),
            stroke: jest.fn().mockReturnThis(),
            dash: jest.fn().mockReturnThis(),
            undash: jest.fn().mockReturnThis(),
            opacity: jest.fn().mockReturnThis(),
        };
        (0, cell_1.drawCell)(mockDoc, { x: 0, y: 0 }, 72);
        expect(mockDoc.dash).toHaveBeenCalledWith(4, { space: 4 });
        expect(mockDoc.opacity).toHaveBeenCalledWith(0.3);
    });
    it("resets dashing and opacity after drawing guidelines, so it does not leak into the next cell's border", () => {
        const mockDoc = {
            rect: jest.fn().mockReturnThis(),
            moveTo: jest.fn().mockReturnThis(),
            lineTo: jest.fn().mockReturnThis(),
            stroke: jest.fn().mockReturnThis(),
            dash: jest.fn().mockReturnThis(),
            undash: jest.fn().mockReturnThis(),
            opacity: jest.fn().mockReturnThis(),
        };
        (0, cell_1.drawCell)(mockDoc, { x: 0, y: 0 }, 72);
        expect(mockDoc.undash).toHaveBeenCalledTimes(1);
        // Opacity must be restored to fully opaque (1) after the faded
        // guidelines, so a subsequent cell's border stroke is solid again.
        expect(mockDoc.opacity).toHaveBeenLastCalledWith(1);
        // The reset must happen after the guideline strokes, not before
        // (otherwise the guidelines themselves would lose their dashing).
        const dashCallOrder = mockDoc.dash.mock.invocationCallOrder[0];
        const undashCallOrder = mockDoc.undash.mock.invocationCallOrder[0];
        const lineToCallOrders = mockDoc.lineTo.mock.invocationCallOrder;
        const lastLineToCallOrder = lineToCallOrders[lineToCallOrders.length - 1];
        expect(undashCallOrder).toBeGreaterThan(dashCallOrder);
        expect(undashCallOrder).toBeGreaterThan(lastLineToCallOrder);
    });
    it("draws a solid, full-opacity border for a second cell drawn after the first", () => {
        const mockDoc = {
            rect: jest.fn().mockReturnThis(),
            moveTo: jest.fn().mockReturnThis(),
            lineTo: jest.fn().mockReturnThis(),
            stroke: jest.fn().mockReturnThis(),
            dash: jest.fn().mockReturnThis(),
            undash: jest.fn().mockReturnThis(),
            opacity: jest.fn().mockReturnThis(),
        };
        (0, cell_1.drawCell)(mockDoc, { x: 0, y: 0 }, 72);
        const rectCallOrderFirstCell = mockDoc.rect.mock.invocationCallOrder[0];
        (0, cell_1.drawCell)(mockDoc, { x: 72, y: 0 }, 72);
        const rectCallOrderSecondCell = mockDoc.rect.mock.invocationCallOrder[1];
        // By the time the second cell's border rect is stroked, dashing must
        // already have been reset (undash called strictly before the second
        // rect call) so the border itself is drawn solid.
        const undashCallOrders = mockDoc.undash.mock.invocationCallOrder;
        const undashBeforeSecondRect = undashCallOrders.some((order) => order > rectCallOrderFirstCell && order < rectCallOrderSecondCell);
        expect(undashBeforeSecondRect).toBe(true);
    });
});
