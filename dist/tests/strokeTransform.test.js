"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strokeTransform_1 = require("../src/strokeTransform");
describe("computeStrokeTransform", () => {
    it("computes scale/offsets for a 300pt cell with 10pt padding (hand-derived reference values)", () => {
        // Character data (from the Make Me a Hanzi / hanzi-writer-data project)
        // lives in a fixed 1024x1024 box spanning x:[0,1024], y:[-124,900].
        // For cellSize=300, padding=10: effectiveSize=280, scale=280/1024.
        const transform = (0, strokeTransform_1.computeStrokeTransform)(300, 10);
        expect(transform.scale).toBeCloseTo(280 / 1024, 10);
        expect(transform.xOffset).toBeCloseTo(10, 10);
        expect(transform.yOffset).toBeCloseTo(124 * (280 / 1024) + 10, 10);
    });
    it("scales linearly with the cell's effective (padding-excluded) size", () => {
        const small = (0, strokeTransform_1.computeStrokeTransform)(100, 10); // effectiveSize = 80
        const large = (0, strokeTransform_1.computeStrokeTransform)(200, 20); // effectiveSize = 160, exactly 2x
        expect(large.scale).toBeCloseTo(small.scale * 2, 10);
    });
    it("increases scale as padding shrinks relative to cellSize", () => {
        const tightPadding = (0, strokeTransform_1.computeStrokeTransform)(300, 5);
        const loosePadding = (0, strokeTransform_1.computeStrokeTransform)(300, 30);
        expect(tightPadding.scale).toBeGreaterThan(loosePadding.scale);
    });
});
describe("transformStrokePoint", () => {
    it("maps CHARACTER_BOUNDS' four corners to within the padded cell area", () => {
        const cellSize = 300;
        const padding = 10;
        const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, padding);
        const corners = [
            [0, -124],
            [1024, -124],
            [0, 900],
            [1024, 900],
        ];
        for (const corner of corners) {
            const point = (0, strokeTransform_1.transformStrokePoint)(corner, cellSize, transform);
            expect(point.x).toBeGreaterThanOrEqual(padding - 1e-9);
            expect(point.x).toBeLessThanOrEqual(cellSize - padding + 1e-9);
            expect(point.y).toBeGreaterThanOrEqual(padding - 1e-9);
            expect(point.y).toBeLessThanOrEqual(cellSize - padding + 1e-9);
        }
    });
    it("maps the raw x-origin (fromX=0) to exactly xOffset", () => {
        const cellSize = 300;
        const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, 10);
        const point = (0, strokeTransform_1.transformStrokePoint)([0, 0], cellSize, transform);
        expect(point.x).toBeCloseTo(transform.xOffset, 10);
    });
    it("flips the y axis: larger raw y values map to smaller screen y values", () => {
        const cellSize = 300;
        const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, 10);
        const low = (0, strokeTransform_1.transformStrokePoint)([512, 0], cellSize, transform);
        const high = (0, strokeTransform_1.transformStrokePoint)([512, 800], cellSize, transform);
        expect(high.y).toBeLessThan(low.y);
    });
    it("keeps x proportional (no flip) as raw x increases", () => {
        const cellSize = 300;
        const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, 10);
        const left = (0, strokeTransform_1.transformStrokePoint)([0, 0], cellSize, transform);
        const right = (0, strokeTransform_1.transformStrokePoint)([1024, 0], cellSize, transform);
        expect(right.x).toBeGreaterThan(left.x);
    });
    it("maps a roughly-centered raw point near the middle of the cell", () => {
        const cellSize = 300;
        const transform = (0, strokeTransform_1.computeStrokeTransform)(cellSize, 10);
        // Center of the 1024x1024 box, roughly (512, 388) given the y offset
        // (-124 to 900 spans 1024, centered around 388).
        const point = (0, strokeTransform_1.transformStrokePoint)([512, 388], cellSize, transform);
        expect(point.x).toBeGreaterThan(cellSize * 0.3);
        expect(point.x).toBeLessThan(cellSize * 0.7);
        expect(point.y).toBeGreaterThan(cellSize * 0.3);
        expect(point.y).toBeLessThan(cellSize * 0.7);
    });
});
