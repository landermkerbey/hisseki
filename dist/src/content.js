"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = generateContent;
const sequence_1 = require("./sequence");
/**
 * Builds the full, unpaginated stream of cells for a document.
 *
 * roundRobin tolerates characters with differing cellsPerCharacter: it
 * loops up to the length of the *longest* sequence, and on each round
 * skips any sequence that has already been exhausted rather than
 * pushing an undefined placeholder or cutting other sequences short.
 */
function generateContent(params) {
    const { mode, characters } = params;
    const sequences = characters.map(sequence_1.generateCellSequence);
    if (mode === "grouped") {
        return sequences.flat();
    }
    // roundRobin: interleave by taking one entry at a time from each
    // sequence, for as many rounds as the longest sequence needs. Shorter
    // sequences simply stop contributing once exhausted.
    const result = [];
    const maxLength = Math.max(...sequences.map((sequence) => sequence.length));
    for (let i = 0; i < maxLength; i++) {
        for (const sequence of sequences) {
            if (i < sequence.length) {
                result.push(sequence[i]);
            }
        }
    }
    return result;
}
