import PDFDocument from "pdfkit";
import { Writable } from "stream";
import { LayoutParams, LayoutDirection, computeLayout } from "./layout";
import { CharacterConfig } from "./sequence";
import { LayoutMode, generateContent } from "./content";
import { paginateContent } from "./paginate";
import { drawCell } from "./cell";
import { drawCharacter } from "./character";
import { registerFont } from "./font";
import { loadStrokeData } from "./strokeData";
import { drawStrokeOrderCharacter } from "./strokeCharacter";

/** Full set of inputs needed to render a practice-sheet PDF end to end. This is the shape validate.ts checks and index.ts loads from --config. */
export interface GenerateParams {
  outputStream: Writable;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  cellSize: number;
  /** Cell traversal order; defaults to "horizontal" when omitted (see LayoutDirection). */
  direction?: LayoutDirection;
  mode: LayoutMode;
  characters: CharacterConfig[];
  font: string;
  fontPath?: string;
}

/**
 * Top-level pipeline: layout -> content -> pagination -> PDF rendering.
 *
 * The PDF page size is set to [pageWidth, pageHeight] from params, so
 * the grid computed by computeLayout always matches the physical page.
 *
 * doc.end() is called synchronously but PDF writing is async. Callers
 * writing to a regular file should wait for the outputStream's
 * "finish" event; callers writing to process.stdout/stderr should
 * instead listen for the returned document's own "end" event, since
 * Node's stream.pipe() deliberately never calls .end() on stdout/
 * stderr (to avoid closing the real fd), so "finish" never fires on
 * them (see index.ts).
 */
export function generate(params: GenerateParams): any {
  const { outputStream, mode, characters, font, fontPath, ...layoutParams } = params;

  const layout = computeLayout(layoutParams);
  const cellsPerPage = layout.columns * layout.rows;

  const content = generateContent({ mode, characters });
  const pages = paginateContent(content, cellsPerPage);

  const doc = new PDFDocument({
    size: [params.pageWidth, params.pageHeight],
    margin: 0,
    autoFirstPage: false,
  });
  doc.pipe(outputStream);

  registerFont(doc, font, fontPath);

  for (const page of pages) {
    doc.addPage();

    for (let i = 0; i < page.length; i++) {
      const cell = layout.cells[i];
      const entry = page[i];
      drawCell(doc, cell, params.cellSize);

      // strokeOrder rendering is opt-in per character and only attempted
      // when data actually exists for it; anything not covered by the
      // stroke dataset (e.g. hiragana, katakana, Latin) falls back to
      // the normal font glyph exactly as if strokeOrder were false.
      const strokeData = entry.strokeOrder ? loadStrokeData(entry.character) : undefined;

      if (strokeData) {
        // Numbers are only shown on the first ("model") cell of a
        // character's run, matching how real workbooks number strokes
        // once on the reference glyph rather than on every repetition.
        drawStrokeOrderCharacter(doc, cell, params.cellSize, strokeData, entry.opacity, {
          showNumbers: entry.isFirstCell,
        });
      } else {
        drawCharacter(doc, cell, params.cellSize, entry.character, font, entry.opacity);
      }
    }
  }

  doc.end();

  return doc;
}