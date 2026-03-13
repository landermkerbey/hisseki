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
  const verticalOffset = (cellSize - fontSize) / 2;

  doc
    .font(font)
    .fontSize(fontSize)
    .opacity(opacity)
    .text(character, cell.x, cell.y + verticalOffset, {
      width: cellSize,
      align: "center",
    });
}