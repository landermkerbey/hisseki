"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const font_1 = require("../src/font");
describe("registerFont", () => {
    it("registers a custom font when fontPath is provided", () => {
        const mockDoc = {
            registerFont: jest.fn().mockReturnThis(),
        };
        (0, font_1.registerFont)(mockDoc, "MyFont", "/path/to/font.ttf");
        expect(mockDoc.registerFont).toHaveBeenCalledWith("MyFont", "/path/to/font.ttf");
    });
    it("does not register a font when fontPath is absent", () => {
        const mockDoc = {
            registerFont: jest.fn().mockReturnThis(),
        };
        (0, font_1.registerFont)(mockDoc, "Helvetica");
        expect(mockDoc.registerFont).not.toHaveBeenCalled();
    });
});
