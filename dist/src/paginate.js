"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateContent = paginateContent;
function paginateContent(cells, cellsPerPage) {
    const pages = [];
    for (let i = 0; i < cells.length; i += cellsPerPage) {
        pages.push(cells.slice(i, i + cellsPerPage));
    }
    return pages;
}
