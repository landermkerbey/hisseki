export type OpacityConfig =
  | { type: "fixed"; opacity: number }
  | { type: "fade"; start: number; end: number }
  | { type: "modelThenFixed"; modelOpacity: number; practiceOpacity: number };

export interface CharacterConfig {
  character: string;
  cellsPerCharacter: number;
  opacity: OpacityConfig;
}

export interface CellEntry {
  character: string;
  opacity: number;
}

export function generateCellSequence(config: CharacterConfig): CellEntry[] {
  const { character, cellsPerCharacter, opacity } = config;

  const cells: CellEntry[] = [];

  for (let i = 0; i < cellsPerCharacter; i++) {
    let cellOpacity: number;

    switch (opacity.type) {
      case "fixed":
        cellOpacity = opacity.opacity;
        break;
      case "fade":
        const step = (opacity.start - opacity.end) / (cellsPerCharacter - 1);
        cellOpacity = opacity.start - step * i;
        break;
      case "modelThenFixed":
        cellOpacity = i === 0 ? opacity.modelOpacity : opacity.practiceOpacity;
        break;
    }

    cells.push({ character, opacity: cellOpacity });
  }

  return cells;
}