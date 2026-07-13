"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateContent = paginateContent;
/**
 * Splits a flat cell stream into fixed-size pages of cellsPerPage cells
 * each (the last page may be short). Purely arithmetic — has no
 * knowledge of PDF rendering or grid geometry.
 */
function paginateContent(cells, cellsPerPage) {
    const pages = [];
    for (let i = 0; i < cells.length; i += cellsPerPage) {
        pages.push(cells.slice(i, i + cellsPerPage));
    }
    return pages;
}
