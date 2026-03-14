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
            { character: "永", opacity: 0.5 },
            { character: "永", opacity: 0.5 },
            { character: "永", opacity: 0.5 },
            { character: "水", opacity: 0.4 },
            { character: "水", opacity: 0.4 },
            { character: "水", opacity: 0.4 },
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
            { character: "永", opacity: 0.5 },
            { character: "水", opacity: 0.4 },
            { character: "永", opacity: 0.5 },
            { character: "水", opacity: 0.4 },
            { character: "永", opacity: 0.5 },
            { character: "水", opacity: 0.4 },
        ]);
    });
});
