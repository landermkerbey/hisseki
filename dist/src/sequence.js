"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCellSequence = generateCellSequence;
/**
 * Expands one CharacterConfig into cellsPerCharacter resolved CellEntry
 * values, resolving the opacity curve for each cell index.
 *
 * A "fade" run of exactly one cell has no meaningful ramp to divide
 * across, so it uses `start` directly rather than dividing by zero.
 */
function generateCellSequence(config) {
    const { character, cellsPerCharacter, opacity } = config;
    const cells = [];
    for (let i = 0; i < cellsPerCharacter; i++) {
        let cellOpacity;
        switch (opacity.type) {
            case "fixed":
                cellOpacity = opacity.opacity;
                break;
            case "fade":
                if (cellsPerCharacter === 1) {
                    cellOpacity = opacity.start;
                }
                else {
                    const step = (opacity.start - opacity.end) / (cellsPerCharacter - 1);
                    cellOpacity = opacity.start - step * i;
                }
                break;
            case "modelThenFixed":
                cellOpacity = i === 0 ? opacity.modelOpacity : opacity.practiceOpacity;
                break;
        }
        cells.push({ character, opacity: cellOpacity });
    }
    return cells;
}
