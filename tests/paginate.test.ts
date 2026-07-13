import { paginateContent } from "../src/paginate";
import { CellEntry } from "../src/sequence";

describe("paginateContent", () => {
  it("splits a flat cell list into pages of a given size", () => {
    const cells: CellEntry[] = Array.from({ length: 10 }, (_, i) => ({
      character: "永",
      opacity: 0.5,
      strokeOrder: false,
      isFirstCell: i === 0,
    }));

    const result = paginateContent(cells, 4);

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(4);
    expect(result[1]).toHaveLength(4);
    expect(result[2]).toHaveLength(2);
  });

  it("returns a single page when content fits exactly", () => {
    const cells: CellEntry[] = Array.from({ length: 6 }, (_, i) => ({
      character: "水",
      opacity: 0.4,
      strokeOrder: false,
      isFirstCell: i === 0,
    }));

    const result = paginateContent(cells, 6);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(6);
  });
});