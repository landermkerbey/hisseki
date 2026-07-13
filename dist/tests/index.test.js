"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const version_1 = require("../src/version");
const actualGenerate = jest.requireActual("../src/generate").generate;
const generateMock = jest.fn((...args) => actualGenerate(...args));
jest.mock("../src/generate", () => ({ generate: (...args) => generateMock(...args) }));
// Imported after the mock so `run` picks up the mocked `generate`.
const index_1 = require("../src/index");
function makeIo() {
    return {
        log: jest.fn(),
        error: jest.fn(),
        exit: jest.fn(),
        stdout: new stream_1.PassThrough(),
    };
}
function withTmpDir(fn) {
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "hisseki-test-"));
    return fn(tmpDir).finally(() => fs_1.default.rmSync(tmpDir, { recursive: true, force: true }));
}
beforeEach(() => {
    generateMock.mockClear();
});
describe("run", () => {
    it("prints help text and exits cleanly for --help, without requiring --config/--output", () => {
        const io = makeIo();
        (0, index_1.run)(["--help"], io);
        expect(io.log).toHaveBeenCalledTimes(1);
        expect(io.log.mock.calls[0][0]).toMatch(/Usage: hisseki/);
        expect(io.error).not.toHaveBeenCalled();
        expect(io.exit).not.toHaveBeenCalled();
    });
    it("prints help text for -h", () => {
        const io = makeIo();
        (0, index_1.run)(["-h"], io);
        expect(io.log).toHaveBeenCalledTimes(1);
        expect(io.log.mock.calls[0][0]).toMatch(/Usage: hisseki/);
    });
    it("prints the package version for --version, without requiring --config/--output", () => {
        const io = makeIo();
        (0, index_1.run)(["--version"], io);
        expect(io.log).toHaveBeenCalledWith((0, version_1.getVersion)(__dirname));
        expect(io.error).not.toHaveBeenCalled();
        expect(io.exit).not.toHaveBeenCalled();
    });
    it("prints the package version for -v", () => {
        const io = makeIo();
        (0, index_1.run)(["-v"], io);
        expect(io.log).toHaveBeenCalledWith((0, version_1.getVersion)(__dirname));
    });
    it("reports a scoped error and exits(1) when --config is missing", () => {
        const io = makeIo();
        (0, index_1.run)(["--output", "out.pdf"], io);
        expect(io.error).toHaveBeenCalledWith(expect.stringContaining("--config is required"));
        expect(io.exit).toHaveBeenCalledWith(1);
    });
    it("generates a PDF end-to-end given a valid config and output path", () => {
        return withTmpDir((tmpDir) => {
            const configPath = path_1.default.join(tmpDir, "config.json");
            const outputPath = path_1.default.join(tmpDir, "out.pdf");
            fs_1.default.writeFileSync(configPath, JSON.stringify({
                pageWidth: 200,
                pageHeight: 200,
                margin: 10,
                cellSize: 50,
                mode: "grouped",
                font: "Helvetica",
                characters: [
                    { character: "A", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                ],
            }));
            const io = makeIo();
            return new Promise((resolve) => {
                (0, index_1.run)(["--config", configPath, "--output", outputPath], io, () => {
                    expect(fs_1.default.existsSync(outputPath)).toBe(true);
                    expect(fs_1.default.statSync(outputPath).size).toBeGreaterThan(0);
                    expect(io.log).toHaveBeenCalledWith(expect.stringContaining("Written to"));
                    resolve();
                });
            });
        });
    });
    it("merges --cellSize/--mode CLI overrides on top of the config file's own values", () => {
        return withTmpDir((tmpDir) => {
            const configPath = path_1.default.join(tmpDir, "config.json");
            const outputPath = path_1.default.join(tmpDir, "out.pdf");
            fs_1.default.writeFileSync(configPath, JSON.stringify({
                pageWidth: 200,
                pageHeight: 200,
                margin: 10,
                cellSize: 20,
                mode: "grouped",
                font: "Helvetica",
                characters: [
                    { character: "A", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                    { character: "B", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                ],
            }));
            const io = makeIo();
            return new Promise((resolve) => {
                (0, index_1.run)([
                    "--config", configPath,
                    "--output", outputPath,
                    "--cellSize", "50",
                    "--mode", "roundRobin",
                ], io, () => {
                    expect(io.error).not.toHaveBeenCalled();
                    expect(generateMock).toHaveBeenCalledTimes(1);
                    const passedParams = generateMock.mock.calls[0][0];
                    expect(passedParams.cellSize).toBe(50);
                    expect(passedParams.mode).toBe("roundRobin");
                    // Untouched fields still come from the config file.
                    expect(passedParams.pageWidth).toBe(200);
                    expect(passedParams.font).toBe("Helvetica");
                    resolve();
                });
            });
        });
    });
    describe("--output -", () => {
        it("still reports completion even when the destination stream never fires 'finish' (as real process.stdout/stderr never do when piped)", () => {
            // Node's stream.pipe() intentionally never calls .end() on
            // process.stdout/process.stderr, to avoid closing the real fd —
            // so 'finish' never fires on them. This stream reproduces that by
            // making .end() a no-op, the same observable behavior.
            class NeverFinishesStream extends stream_1.Writable {
                constructor() {
                    super(...arguments);
                    this.chunks = [];
                }
                _write(chunk, _enc, callback) {
                    this.chunks.push(chunk);
                    callback();
                }
                end(...args) {
                    // Deliberately do not call super.end(): mirrors process.stdout,
                    // which absorbs .end() calls without ever emitting 'finish'.
                    const maybeCallback = args.find((a) => typeof a === "function");
                    maybeCallback?.();
                    return this;
                }
            }
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const neverFinishes = new NeverFinishesStream();
                const io = { ...makeIo(), stdout: neverFinishes };
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", "-"], io, () => {
                        const written = Buffer.concat(neverFinishes.chunks);
                        expect(written.subarray(0, 4).toString("ascii")).toBe("%PDF");
                        expect(io.error).toHaveBeenCalledWith(expect.stringContaining("stdout"));
                        resolve();
                    });
                });
            });
        });
        it("writes the PDF to io.stdout instead of a file, and does not require an output path on disk", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                const chunks = [];
                io.stdout.on("data", (chunk) => chunks.push(chunk));
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", "-"], io, () => {
                        const written = Buffer.concat(chunks);
                        expect(written.length).toBeGreaterThan(0);
                        expect(written.subarray(0, 4).toString("ascii")).toBe("%PDF");
                        // Nothing besides raw PDF bytes reaches stdout: the "written"
                        // confirmation must go through io.error (stderr channel) so
                        // it can't corrupt a real `hisseki ... --output - > out.pdf`
                        // redirection, which only captures actual stdout.
                        expect(io.log).not.toHaveBeenCalled();
                        expect(io.error).toHaveBeenCalledWith(expect.stringContaining("stdout"));
                        resolve();
                    });
                });
            });
        });
    });
    describe("--dry-run", () => {
        it("validates the config and reports a summary without writing a PDF or requiring --output", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--dry-run"], io, () => {
                        expect(io.error).not.toHaveBeenCalled();
                        expect(io.exit).not.toHaveBeenCalled();
                        expect(generateMock).not.toHaveBeenCalled();
                        expect(io.log).toHaveBeenCalledWith(expect.stringContaining("OK"));
                        expect(io.log).toHaveBeenCalledWith(expect.stringContaining("1 page"));
                        expect(io.log).toHaveBeenCalledWith(expect.stringContaining("3 cell"));
                        resolve();
                    });
                });
            });
        });
        it("reports an invalid config the same way as a normal run, still without generating", async () => {
            await withTmpDir(async (tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({ pageWidth: -1 }));
                const io = makeIo();
                (0, index_1.run)(["--config", configPath, "--dry-run"], io);
                expect(io.error).toHaveBeenCalledWith(expect.stringContaining("Invalid config"));
                expect(io.exit).toHaveBeenCalledWith(1);
                expect(generateMock).not.toHaveBeenCalled();
            });
        });
        it("applies CLI overrides before validating/reporting, same as a normal run", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 500, // invalid on its own (bigger than the page)
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--dry-run", "--cellSize", "50"], io, () => {
                        expect(io.error).not.toHaveBeenCalled();
                        expect(io.log).toHaveBeenCalledWith(expect.stringContaining("OK"));
                        resolve();
                    });
                });
            });
        });
    });
    describe("--verbose", () => {
        it("logs layout/timing/size details in addition to the normal confirmation, for a real generate run", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                const outputPath = path_1.default.join(tmpDir, "out.pdf");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 3, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", outputPath, "--verbose"], io, () => {
                        expect(io.error).not.toHaveBeenCalled();
                        const logs = io.log.mock.calls.map((call) => call[0]);
                        expect(logs.some((msg) => /Layout:.*grid/.test(msg))).toBe(true);
                        expect(logs.some((msg) => /Generated in \d+ms/.test(msg))).toBe(true);
                        expect(logs.some((msg) => /\d+ bytes/.test(msg))).toBe(true);
                        expect(logs.some((msg) => msg.includes("Written to"))).toBe(true);
                        resolve();
                    });
                });
            });
        });
        it("logs the applied overrides when any are passed", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                const outputPath = path_1.default.join(tmpDir, "out.pdf");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 20,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", outputPath, "--verbose", "--cellSize", "50"], io, () => {
                        const logs = io.log.mock.calls.map((call) => call[0]);
                        expect(logs.some((msg) => msg.includes("Overrides:") && msg.includes("cellSize"))).toBe(true);
                        resolve();
                    });
                });
            });
        });
        it("stays silent about layout/timing/size when --verbose is not passed", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                const outputPath = path_1.default.join(tmpDir, "out.pdf");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", outputPath], io, () => {
                        const logs = io.log.mock.calls.map((call) => call[0]);
                        expect(logs).toEqual([expect.stringContaining("Written to")]);
                        resolve();
                    });
                });
            });
        });
        it("routes ALL diagnostics to stderr instead of stdout when writing the PDF to stdout, so they never corrupt the binary output", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 20,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                const chunks = [];
                io.stdout.on("data", (chunk) => chunks.push(chunk));
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--output", "-", "--verbose", "--cellSize", "50"], io, () => {
                        // Nothing but raw PDF bytes may ever reach stdout.
                        expect(io.log).not.toHaveBeenCalled();
                        const written = Buffer.concat(chunks);
                        expect(written.subarray(0, 4).toString("ascii")).toBe("%PDF");
                        // All the diagnostics that would normally go to io.log must
                        // instead have gone to io.error (stderr).
                        const errors = io.error.mock.calls.map((call) => call[0]);
                        expect(errors.some((msg) => msg.includes("Overrides:"))).toBe(true);
                        expect(errors.some((msg) => /Layout:.*grid/.test(msg))).toBe(true);
                        expect(errors.some((msg) => /Generated in \d+ms/.test(msg))).toBe(true);
                        expect(errors.some((msg) => msg.includes("Written to stdout"))).toBe(true);
                        resolve();
                    });
                });
            });
        });
        it("also enriches --dry-run's summary with overrides when both are passed", () => {
            return withTmpDir((tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 20,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                const io = makeIo();
                return new Promise((resolve) => {
                    (0, index_1.run)(["--config", configPath, "--dry-run", "--verbose", "--cellSize", "50"], io, () => {
                        const logs = io.log.mock.calls.map((call) => call[0]);
                        expect(logs.some((msg) => msg.includes("Overrides:") && msg.includes("cellSize"))).toBe(true);
                        expect(logs.some((msg) => msg.includes("Config OK"))).toBe(true);
                        resolve();
                    });
                });
            });
        });
    });
    describe("PDFKit generation errors", () => {
        it("reports a scoped error and exits(1) when generate() throws synchronously, instead of an uncaught exception (file output)", async () => {
            await withTmpDir(async (tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                const outputPath = path_1.default.join(tmpDir, "out.pdf");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                generateMock.mockImplementationOnce(() => {
                    throw new Error("ENOENT: no such file or directory, open '/bogus/font.ttf'");
                });
                const io = makeIo();
                (0, index_1.run)(["--config", configPath, "--output", outputPath], io);
                expect(io.error).toHaveBeenCalledWith(expect.stringContaining("Error generating PDF"));
                expect(io.error).toHaveBeenCalledWith(expect.stringContaining("bogus/font.ttf"));
                expect(io.exit).toHaveBeenCalledWith(1);
            });
        });
        it("reports the same scoped error for a synchronous generate() failure when writing to stdout", async () => {
            await withTmpDir(async (tmpDir) => {
                const configPath = path_1.default.join(tmpDir, "config.json");
                fs_1.default.writeFileSync(configPath, JSON.stringify({
                    pageWidth: 200,
                    pageHeight: 200,
                    margin: 10,
                    cellSize: 50,
                    mode: "grouped",
                    font: "Helvetica",
                    characters: [
                        { character: "A", cellsPerCharacter: 1, opacity: { type: "fixed", opacity: 0.5 } },
                    ],
                }));
                generateMock.mockImplementationOnce(() => {
                    throw new Error("ENOENT: no such file or directory, open 'TotallyBogusFontName'");
                });
                const io = makeIo();
                (0, index_1.run)(["--config", configPath, "--output", "-"], io);
                expect(io.error).toHaveBeenCalledWith(expect.stringContaining("Error generating PDF"));
                expect(io.exit).toHaveBeenCalledWith(1);
            });
        });
    });
    it("leaves config file values untouched when no matching override flags are passed", () => {
        return withTmpDir((tmpDir) => {
            const configPath = path_1.default.join(tmpDir, "config.json");
            const outputPath = path_1.default.join(tmpDir, "out.pdf");
            fs_1.default.writeFileSync(configPath, JSON.stringify({
                pageWidth: 200,
                pageHeight: 200,
                margin: 10,
                cellSize: 50,
                mode: "grouped",
                font: "Helvetica",
                characters: [
                    { character: "A", cellsPerCharacter: 2, opacity: { type: "fixed", opacity: 0.5 } },
                ],
            }));
            const io = makeIo();
            return new Promise((resolve) => {
                (0, index_1.run)(["--config", configPath, "--output", outputPath], io, () => {
                    const passedParams = generateMock.mock.calls[0][0];
                    expect(passedParams.cellSize).toBe(50);
                    expect(passedParams.mode).toBe("grouped");
                    resolve();
                });
            });
        });
    });
});
