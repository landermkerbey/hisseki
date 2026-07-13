"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../src/validate");
const validConfig = {
    pageWidth: 612,
    pageHeight: 792,
    margin: 72,
    cellSize: 72,
    mode: "grouped",
    font: "Helvetica",
    characters: [
        {
            character: "永",
            cellsPerCharacter: 20,
            opacity: { type: "fixed", opacity: 0.5 },
        },
    ],
};
describe("validateConfig", () => {
    it("accepts a valid config", () => {
        expect(() => (0, validate_1.validateConfig)(validConfig)).not.toThrow();
    });
    it("throws when pageWidth is missing", () => {
        const { pageWidth, ...rest } = validConfig;
        expect(() => (0, validate_1.validateConfig)(rest)).toThrow("pageWidth must be a positive number");
    });
    it("throws when margin is too large", () => {
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, margin: 400 })).toThrow("margin must be less than half of pageWidth and pageHeight");
    });
    it("throws when cellSize does not fit within margins", () => {
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, cellSize: 500 })).toThrow("cellSize must fit at least one column and one row within the page margins");
    });
    it("throws when mode is invalid", () => {
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, mode: "spiral" })).toThrow('mode must be "grouped" or "roundRobin"');
    });
    it("throws when characters is empty", () => {
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, characters: [] })).toThrow("characters must be a non-empty array");
    });
    it("throws when a character entry has no character string", () => {
        const characters = [{ ...validConfig.characters[0], character: "" }];
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, characters })).toThrow("character at index 0 must have a non-empty character string");
    });
    it("throws when cellsPerCharacter is not positive", () => {
        const characters = [{ ...validConfig.characters[0], cellsPerCharacter: 0 }];
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, characters })).toThrow("character at index 0 must have a positive cellsPerCharacter");
    });
    it("throws when opacity type is invalid", () => {
        const characters = [{ ...validConfig.characters[0], opacity: { type: "random" } }];
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, characters })).toThrow('character at index 0 has an invalid opacity type');
    });
    it("throws when fade opacity is missing start", () => {
        const characters = [{ ...validConfig.characters[0], opacity: { type: "fade", end: 0.3 } }];
        expect(() => (0, validate_1.validateConfig)({ ...validConfig, characters })).toThrow("character at index 0 fade opacity must have numeric start and end");
    });
});
