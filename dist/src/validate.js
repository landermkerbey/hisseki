"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
/**
 * Validates a parsed JSON config object against the shape GenerateParams
 * expects, throwing a descriptive Error on the first problem found.
 * This is the only place config shape is enforced — generate() itself
 * trusts its input. fontPath and outputStream are intentionally not
 * validated here: fontPath is optional and unchecked (a bad path
 * surfaces later as a PDFKit error), and outputStream isn't part of
 * the on-disk config at all (index.ts adds it after validation).
 */
function validateConfig(config) {
    if (typeof config.pageWidth !== "number" || config.pageWidth <= 0)
        throw new Error("pageWidth must be a positive number");
    if (typeof config.pageHeight !== "number" || config.pageHeight <= 0)
        throw new Error("pageHeight must be a positive number");
    if (typeof config.margin !== "number" || config.margin <= 0)
        throw new Error("margin must be a positive number");
    if (config.margin >= config.pageWidth / 2 || config.margin >= config.pageHeight / 2)
        throw new Error("margin must be less than half of pageWidth and pageHeight");
    if (typeof config.cellSize !== "number" || config.cellSize <= 0)
        throw new Error("cellSize must be a positive number");
    const usableWidth = config.pageWidth - config.margin * 2;
    const usableHeight = config.pageHeight - config.margin * 2;
    if (config.cellSize > usableWidth || config.cellSize > usableHeight)
        throw new Error("cellSize must fit at least one column and one row within the page margins");
    if (config.mode !== "grouped" && config.mode !== "roundRobin")
        throw new Error('mode must be "grouped" or "roundRobin"');
    if (typeof config.font !== "string" || config.font.trim() === "")
        throw new Error("font must be a non-empty string");
    if (!Array.isArray(config.characters) || config.characters.length === 0)
        throw new Error("characters must be a non-empty array");
    for (let i = 0; i < config.characters.length; i++) {
        const entry = config.characters[i];
        if (typeof entry.character !== "string" || entry.character.trim() === "")
            throw new Error(`character at index ${i} must have a non-empty character string`);
        if (typeof entry.cellsPerCharacter !== "number" || entry.cellsPerCharacter <= 0)
            throw new Error(`character at index ${i} must have a positive cellsPerCharacter`);
        validateOpacity(entry.opacity, i);
    }
}
function validateOpacity(opacity, index) {
    if (!opacity || !["fixed", "fade", "modelThenFixed"].includes(opacity.type))
        throw new Error(`character at index ${index} has an invalid opacity type`);
    switch (opacity.type) {
        case "fixed":
            if (typeof opacity.opacity !== "number")
                throw new Error(`character at index ${index} fixed opacity must have a numeric opacity`);
            break;
        case "fade":
            if (typeof opacity.start !== "number" || typeof opacity.end !== "number")
                throw new Error(`character at index ${index} fade opacity must have numeric start and end`);
            break;
        case "modelThenFixed":
            if (typeof opacity.modelOpacity !== "number" || typeof opacity.practiceOpacity !== "number")
                throw new Error(`character at index ${index} modelThenFixed opacity must have numeric modelOpacity and practiceOpacity`);
            break;
    }
}
