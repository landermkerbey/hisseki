"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCellSequence = generateCellSequence;
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
                const step = (opacity.start - opacity.end) / (cellsPerCharacter - 1);
                cellOpacity = opacity.start - step * i;
                break;
            case "modelThenFixed":
                cellOpacity = i === 0 ? opacity.modelOpacity : opacity.practiceOpacity;
                break;
        }
        cells.push({ character, opacity: cellOpacity });
    }
    return cells;
}
