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
            opacity: jest.fn().mockReturnThis(),
        };
        (0, cell_1.drawCell)(mockDoc, { x: 0, y: 0 }, 72);
        expect(mockDoc.dash).toHaveBeenCalledWith(4, { space: 4 });
        expect(mockDoc.opacity).toHaveBeenCalledWith(0.3);
    });
});
