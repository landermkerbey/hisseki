"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("../src/cli");
describe("parseArgs", () => {
    describe("generate command (default)", () => {
        it("parses config and output paths from argv", () => {
            const result = (0, cli_1.parseArgs)([
                "--config", "config.json",
                "--output", "output.pdf",
            ]);
            expect(result).toEqual({
                command: "generate",
                configPath: "config.json",
                outputPath: "output.pdf",
                overrides: {},
                dryRun: false,
            });
        });
        it("throws when config is missing", () => {
            expect(() => (0, cli_1.parseArgs)(["--output", "output.pdf"])).toThrow("--config is required");
        });
        it("throws when output is missing", () => {
            expect(() => (0, cli_1.parseArgs)(["--config", "config.json"])).toThrow("--output is required");
        });
    });
    describe("--help / -h", () => {
        it("recognizes --help and does not require --config/--output", () => {
            expect((0, cli_1.parseArgs)(["--help"])).toEqual({ command: "help" });
        });
        it("recognizes the -h shorthand", () => {
            expect((0, cli_1.parseArgs)(["-h"])).toEqual({ command: "help" });
        });
        it("takes priority over other flags", () => {
            expect((0, cli_1.parseArgs)(["--help", "--config", "x", "--output", "y"])).toEqual({
                command: "help",
            });
        });
    });
    describe("config field overrides", () => {
        it("parses --cellSize as a numeric override", () => {
            const result = (0, cli_1.parseArgs)([
                "--config", "config.json",
                "--output", "output.pdf",
                "--cellSize", "90",
            ]);
            expect(result).toEqual({
                command: "generate",
                configPath: "config.json",
                outputPath: "output.pdf",
                overrides: { cellSize: 90 },
                dryRun: false,
            });
        });
        it("parses --mode and --font as string overrides", () => {
            const result = (0, cli_1.parseArgs)([
                "--config", "config.json",
                "--output", "output.pdf",
                "--mode", "roundRobin",
                "--font", "Times-Roman",
            ]);
            expect(result).toEqual({
                command: "generate",
                configPath: "config.json",
                outputPath: "output.pdf",
                overrides: { mode: "roundRobin", font: "Times-Roman" },
                dryRun: false,
            });
        });
        it("parses all supported override fields together", () => {
            const result = (0, cli_1.parseArgs)([
                "--config", "config.json",
                "--output", "output.pdf",
                "--pageWidth", "420",
                "--pageHeight", "595",
                "--margin", "36",
                "--cellSize", "60",
                "--mode", "grouped",
                "--font", "Helvetica",
                "--fontPath", "/path/to/font.ttf",
            ]);
            expect(result.overrides).toEqual({
                pageWidth: 420,
                pageHeight: 595,
                margin: 36,
                cellSize: 60,
                mode: "grouped",
                font: "Helvetica",
                fontPath: "/path/to/font.ttf",
            });
        });
        it("omits override fields that were not passed", () => {
            const result = (0, cli_1.parseArgs)(["--config", "config.json", "--output", "output.pdf"]);
            expect(result.overrides).toEqual({});
        });
        it("ignores unrecognized flags rather than treating them as overrides", () => {
            const result = (0, cli_1.parseArgs)([
                "--config", "config.json",
                "--output", "output.pdf",
                "--bogus", "nonsense",
            ]);
            expect(result.overrides).toEqual({});
        });
    });
    describe("--dry-run", () => {
        it("is false by default", () => {
            const result = (0, cli_1.parseArgs)(["--config", "config.json", "--output", "output.pdf"]);
            expect(result.dryRun).toBe(false);
        });
        it("is true when --dry-run is passed", () => {
            const result = (0, cli_1.parseArgs)(["--config", "config.json", "--output", "output.pdf", "--dry-run"]);
            expect(result.dryRun).toBe(true);
        });
        it("does not require --output when --dry-run is passed", () => {
            const result = (0, cli_1.parseArgs)(["--config", "config.json", "--dry-run"]);
            expect(result).toEqual({
                command: "generate",
                configPath: "config.json",
                outputPath: undefined,
                overrides: {},
                dryRun: true,
            });
        });
        it("still requires --config even with --dry-run", () => {
            expect(() => (0, cli_1.parseArgs)(["--dry-run"])).toThrow("--config is required");
        });
        it("still requires --output when --dry-run is not passed", () => {
            expect(() => (0, cli_1.parseArgs)(["--config", "config.json"])).toThrow("--output is required");
        });
    });
    describe("--version / -v", () => {
        it("recognizes --version and does not require --config/--output", () => {
            expect((0, cli_1.parseArgs)(["--version"])).toEqual({ command: "version" });
        });
        it("recognizes the -v shorthand", () => {
            expect((0, cli_1.parseArgs)(["-v"])).toEqual({ command: "version" });
        });
    });
});
