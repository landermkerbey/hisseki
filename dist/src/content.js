"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = generateContent;
const sequence_1 = require("./sequence");
function generateContent(params) {
    const { mode, characters } = params;
    const sequences = characters.map(sequence_1.generateCellSequence);
    if (mode === "grouped") {
        return sequences.flat();
    }
    // roundRobin: interleave by taking one entry at a time from each sequence
    const result = [];
    const length = sequences[0].length;
    for (let i = 0; i < length; i++) {
        for (const sequence of sequences) {
            result.push(sequence[i]);
        }
    }
    return result;
}
