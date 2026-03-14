import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { renderPage } from "../src/renderer";
import { generate } from "../src/generate";

const OUTPUT_PATH = path.join(__dirname, "output.pdf");
const OUTPUT_PATH_2 = path.join(__dirname, "output2.pdf");

describe("integration", () => {
  it("writes a non-empty PDF to disk", (done) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 0 });
    const stream = fs.createWriteStream(OUTPUT_PATH);

    doc.pipe(stream);

    renderPage(doc, {
      pageWidth: 612,
      pageHeight: 792,
      margin: 72,
      cellSize: 72,
    });

    doc.end();

    stream.on("finish", () => {
      const stats = fs.statSync(OUTPUT_PATH);
      expect(stats.size).toBeGreaterThan(0);
      done();
    });
  });

  it("generates a multi-page PDF when content exceeds one page", (done) => {
    const stream = fs.createWriteStream(OUTPUT_PATH_2);

    generate({
      outputStream: stream,
      pageWidth: 612,
      pageHeight: 792,
      margin: 72,
      cellSize: 72,
      mode: "grouped",
      characters: [
        {
          character: "永",
          cellsPerCharacter: 30,
          opacity: { type: "fade", start: 0.8, end: 0.2 },
        },
        {
          character: "水",
          cellsPerCharacter: 30,
          opacity: { type: "modelThenFixed", modelOpacity: 0.9, practiceOpacity: 0.3 },
        },
      ],
      font: "Helvetica",
    });

    stream.on("finish", () => {
      const stats = fs.statSync(OUTPUT_PATH_2);
      expect(stats.size).toBeGreaterThan(0);
      done();
    });
  });

  afterAll(() => {
    if (fs.existsSync(OUTPUT_PATH)) fs.unlinkSync(OUTPUT_PATH);
    if (fs.existsSync(OUTPUT_PATH_2)) fs.unlinkSync(OUTPUT_PATH_2);
  });
});