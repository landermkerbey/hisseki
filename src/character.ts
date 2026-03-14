import { Cell } from "./layout";

export function drawCharacter(
  doc: any,
  cell: Cell,
  cellSize: number,
  character: string,
  font: string,
  opacity: number
): void {
  const fontSize = cellSize * 0.8;

  doc.font(font);
  doc.fontSize(fontSize);

  const lineHeight = doc.currentLineHeight(true);
  const verticalOffset = (cellSize - lineHeight) / 2;

  doc
    .opacity(opacity)
    .text(character, cell.x, cell.y + verticalOffset, {
      width: cellSize,
      align: "center",
      lineBreak: false,
    });
}