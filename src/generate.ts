import PDFDocument from "pdfkit";
import { Writable } from "stream";
import { LayoutParams, computeLayout } from "./layout";
import { CharacterConfig } from "./sequence";
import { LayoutMode, generateContent } from "./content";
import { paginateContent } from "./paginate";
import { drawCell } from "./cell";
import { drawCharacter } from "./character";
import { registerFont } from "./font";

/** Full set of inputs needed to render a practice-sheet PDF end to end. This is the shape validate.ts checks and index.ts loads from --config. */
export interface GenerateParams {
  outputStream: Writable;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  cellSize: number;
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
      drawCell(doc, cell, params.cellSize);
      drawCharacter(doc, cell, params.cellSize, page[i].character, font, page[i].opacity);
    }
  }

  doc.end();

  return doc;
}