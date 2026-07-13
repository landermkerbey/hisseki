"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFont = registerFont;
/**
 * Registers a custom font under a friendly name so it can later be
 * referenced by that name in `doc.font(font)` calls elsewhere in the
 * pipeline (see character.ts). When fontPath is omitted, `font` is
 * assumed to already be one of PDFKit's 14 standard built-in fonts
 * (e.g. "Helvetica") and no registration is needed or attempted.
 *
 * Registering a font this way does not by itself guarantee CJK glyph
 * coverage \u2014 the built-in fonts have none. Callers targeting CJK
 * characters must supply fontPath pointing at a font file with the
 * needed glyphs (see testconfig.json for an example).
 */
function registerFont(doc, font, fontPath) {
    if (fontPath) {
        doc.registerFont(font, fontPath);
    }
}
