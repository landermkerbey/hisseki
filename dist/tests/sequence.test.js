"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequence_1 = require("../src/sequence");
describe("generateCellSequence", () => {
    it("generates a fixed opacity sequence", () => {
        const result = (0, sequence_1.generateCellSequence)({
            character: "永",
            cellsPerCharacter: 3,
            opacity: { type: "fixed", opacity: 0.5 },
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
        ]);
    });
    it("generates a fade opacity sequence", () => {
        const result = (0, sequence_1.generateCellSequence)({
            character: "永",
            cellsPerCharacter: 4,
            opacity: { type: "fade", start: 0.8, end: 0.3 },
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.8, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: expect.closeTo(0.633, 2), strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: expect.closeTo(0.467, 2), strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: expect.closeTo(0.3, 2), strokeOrder: false, isFirstCell: false },
        ]);
    });
    it("uses the fade start opacity for a single-cell run, without dividing by zero", () => {
        const result = (0, sequence_1.generateCellSequence)({
            character: "永",
            cellsPerCharacter: 1,
            opacity: { type: "fade", start: 0.8, end: 0.3 },
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.8, strokeOrder: false, isFirstCell: true },
        ]);
    });
    it("generates a modelThenFixed opacity sequence", () => {
        const result = (0, sequence_1.generateCellSequence)({
            character: "永",
            cellsPerCharacter: 4,
            opacity: { type: "modelThenFixed", modelOpacity: 0.8, practiceOpacity: 0.2 },
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.8, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: 0.2, strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: 0.2, strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: 0.2, strokeOrder: false, isFirstCell: false },
        ]);
    });
    describe("strokeOrder", () => {
        it("defaults to false when omitted from the character config", () => {
            const result = (0, sequence_1.generateCellSequence)({
                character: "永",
                cellsPerCharacter: 2,
                opacity: { type: "fixed", opacity: 0.5 },
            });
            expect(result.every((cell) => cell.strokeOrder === false)).toBe(true);
        });
        it("carries strokeOrder: true through to every cell in the run when set", () => {
            const result = (0, sequence_1.generateCellSequence)({
                character: "永",
                cellsPerCharacter: 3,
                opacity: { type: "fixed", opacity: 0.5 },
                strokeOrder: true,
            });
            expect(result.every((cell) => cell.strokeOrder === true)).toBe(true);
        });
    });
    describe("isFirstCell", () => {
        it("is true only for index 0 of the run, regardless of cellsPerCharacter", () => {
            const result = (0, sequence_1.generateCellSequence)({
                character: "永",
                cellsPerCharacter: 5,
                opacity: { type: "fixed", opacity: 0.5 },
            });
            expect(result.map((cell) => cell.isFirstCell)).toEqual([true, false, false, false, false]);
        });
    });
});
