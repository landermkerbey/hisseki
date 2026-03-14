import PDFDocument from "pdfkit";
import { Writable } from "stream";
import { LayoutParams, computeLayout } from "./layout";
import { CharacterConfig } from "./sequence";
import { LayoutMode, generateContent } from "./content";
import { paginateContent } from "./paginate";
import { drawCell } from "./cell";
import { drawCharacter } from "./character";
import { registerFont } from "./font";

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

export function generate(params: GenerateParams): void {
  const { outputStream, mode, characters, font, fontPath, ...layoutParams } = params;

  const layout = computeLayout(layoutParams);
  const cellsPerPage = layout.columns * layout.rows;

  const content = generateContent({ mode, characters });
  const pages = paginateContent(content, cellsPerPage);

  const doc = new PDFDocument({ size: "LETTER", margin: 0, autoFirstPage: false });
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
}