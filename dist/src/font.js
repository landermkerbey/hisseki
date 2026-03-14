"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFont = registerFont;
function registerFont(doc, font, fontPath) {
    if (fontPath) {
        doc.registerFont(font, fontPath);
    }
}
