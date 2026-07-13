"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHARACTER_BOUNDS = void 0;
exports.computeStrokeTransform = computeStrokeTransform;
exports.transformStrokePoint = transformStrokePoint;
/**
 * Coordinate math for rendering stroke-order character data (from the
 * Make Me a Hanzi project, via the hanzi-writer-data package) into a
 * hisseki practice cell.
 *
 * That data's paths/medians live in a fixed 1024x1024 box spanning
 * x:[0,1024], y:[-124,900], with y increasing *upward* (standard
 * Cartesian), unlike PDF/SVG's y-down convention. These constants and
 * the transform below mirror the positioning logic used by the
 * hanzi-writer library itself, so hisseki's rendering matches how
 * that data is intended to be displayed.
 */
exports.CHARACTER_BOUNDS = { fromX: 0, fromY: -124, toX: 1024, toY: 900 };
const PRE_SCALED_WIDTH = exports.CHARACTER_BOUNDS.toX - exports.CHARACTER_BOUNDS.fromX;
const PRE_SCALED_HEIGHT = exports.CHARACTER_BOUNDS.toY - exports.CHARACTER_BOUNDS.fromY;
/**
 * Computes the scale/offset needed to fit the fixed 1024x1024 raw
 * character box into a cellSize x cellSize square, with `padding`
 * points of empty space kept on all four sides.
 */
function computeStrokeTransform(cellSize, padding) {
    const effectiveSize = cellSize - 2 * padding;
    const scale = Math.min(effectiveSize / PRE_SCALED_WIDTH, effectiveSize / PRE_SCALED_HEIGHT);
    const xCenteringBuffer = padding + (effectiveSize - scale * PRE_SCALED_WIDTH) / 2;
    const yCenteringBuffer = padding + (effectiveSize - scale * PRE_SCALED_HEIGHT) / 2;
    const xOffset = -1 * exports.CHARACTER_BOUNDS.fromX * scale + xCenteringBuffer;
    const yOffset = -1 * exports.CHARACTER_BOUNDS.fromY * scale + yCenteringBuffer;
    return { scale, xOffset, yOffset };
}
/**
 * Maps a raw [x, y] point from character stroke/median data into
 * cell-local pixel coordinates (still relative to the cell's own
 * top-left corner, not yet offset by the cell's page position),
 * flipping the y axis in the process.
 */
function transformStrokePoint(point, cellSize, transform) {
    const [rawX, rawY] = point;
    return {
        x: rawX * transform.scale + transform.xOffset,
        y: cellSize - transform.yOffset - rawY * transform.scale,
    };
}
