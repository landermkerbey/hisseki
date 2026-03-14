"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("../src/cli");
describe("parseArgs", () => {
    it("parses config and output paths from argv", () => {
        const result = (0, cli_1.parseArgs)([
            "--config", "config.json",
            "--output", "output.pdf",
        ]);
        expect(result).toEqual({
            configPath: "config.json",
            outputPath: "output.pdf",
        });
    });
    it("throws when config is missing", () => {
        expect(() => (0, cli_1.parseArgs)(["--output", "output.pdf"])).toThrow("--config is required");
    });
    it("throws when output is missing", () => {
        expect(() => (0, cli_1.parseArgs)(["--config", "config.json"])).toThrow("--output is required");
    });
});
