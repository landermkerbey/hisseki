import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { renderPage } from "../src/renderer";

const OUTPUT_PATH = path.join(__dirname, "output.pdf");

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

  afterAll(() => {
    if (fs.existsSync(OUTPUT_PATH)) {
      fs.unlinkSync(OUTPUT_PATH);
    }
  });
});