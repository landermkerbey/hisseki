"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = require("../src/content");
describe("generateContent", () => {
    it("groups characters in grouped mode", () => {
        const result = (0, content_1.generateContent)({
            mode: "grouped",
            characters: [
                { character: "永", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.5 } },
                { character: "水", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.4 } },
            ],
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: true },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
        ]);
    });
    it("interleaves characters in roundRobin mode", () => {
        const result = (0, content_1.generateContent)({
            mode: "roundRobin",
            characters: [
                { character: "永", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.5 } },
                { character: "水", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.4 } },
            ],
        });
        expect(result).toEqual([
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: true },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
        ]);
    });
    it("interleaves characters with differing cellsPerCharacter without dropping or corrupting entries", () => {
        const result = (0, content_1.generateContent)({
            mode: "roundRobin",
            characters: [
                { character: "永", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                { character: "水", cellsPerCharacter: 4, opacity: { type: "fixed", opacity: 0.4 } },
            ],
        });
        // "永" is exhausted after 2 rounds; from then on only "水" contributes,
        // instead of pushing undefined placeholders or truncating "水".
        expect(result).toEqual([
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: true },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: true },
            { character: "永", opacity: 0.5, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
            { character: "水", opacity: 0.4, strokeOrder: false, isFirstCell: false },
        ]);
        // No undefined/sparse entries anywhere in the output.
        expect(result.every((entry) => entry !== undefined)).toBe(true);
    });
});
