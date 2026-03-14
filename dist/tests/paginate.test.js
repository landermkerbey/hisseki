"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginate_1 = require("../src/paginate");
describe("paginateContent", () => {
    it("splits a flat cell list into pages of a given size", () => {
        const cells = Array.from({ length: 10 }, (_, i) => ({
            character: "永",
            opacity: 0.5,
        }));
        const result = (0, paginate_1.paginateContent)(cells, 4);
        expect(result).toHaveLength(3);
        expect(result[0]).toHaveLength(4);
        expect(result[1]).toHaveLength(4);
        expect(result[2]).toHaveLength(2);
    });
    it("returns a single page when content fits exactly", () => {
        const cells = Array.from({ length: 6 }, () => ({
            character: "水",
            opacity: 0.4,
        }));
        const result = (0, paginate_1.paginateContent)(cells, 6);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(6);
    });
});
