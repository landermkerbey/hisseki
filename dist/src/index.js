"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_1 = require("./cli");
const generate_1 = require("./generate");
const validate_1 = require("./validate");
const version_1 = require("./version");
const layout_1 = require("./layout");
const content_1 = require("./content");
const paginate_1 = require("./paginate");
const USAGE = "Usage: hisseki --config <path> --output <path>";
const HELP_TEXT = `${USAGE}

Generate a handwriting/tracing practice PDF from a JSON config.

Options:
  --config <path>       Path to a JSON config file (required)
  --output <path>       Path to write the generated PDF to (required)
  -h, --help            Show this help text and exit
  -v, --version         Show the installed version and exit

Overrides (optional; take precedence over --config's values):
  --pageWidth <n>       Page width in points
  --pageHeight <n>      Page height in points
  --margin <n>          Page margin in points
  --cellSize <n>        Cell edge length in points
  --mode <mode>         "grouped" or "roundRobin"
  --font <name>         Font name
  --fontPath <path>     Path to a font file to register under --font

Other flags:
  --dry-run             Validate the config and report the resulting
                        page/cell counts without writing a PDF or
                        requiring --output
`;
const defaultIo = {
    log: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
    exit: (code) => process.exit(code),
    stdout: process.stdout,
};
/**
 * Runs the CLI for a given argv, using io for all output/exit calls.
 *
 * onFinish, if provided, is called once the output PDF stream finishes
 * writing (or immediately, for the help/version/error paths that never
 * reach PDF generation). It exists so tests can await the asynchronous
 * PDF-writing tail of the "generate" command; real invocations from
 * main() don't need it since the process exits naturally once the
 * event loop is empty.
 */
function run(argv, io = defaultIo, onFinish) {
    let args;
    try {
        args = (0, cli_1.parseArgs)(argv);
    }
    catch (err) {
        io.error(`Error: ${err.message}`);
        io.error(USAGE);
        io.exit(1);
        onFinish?.();
        return;
    }
    if (args.command === "help") {
        io.log(HELP_TEXT);
        onFinish?.();
        return;
    }
    if (args.command === "version") {
        io.log((0, version_1.getVersion)(__dirname));
        onFinish?.();
        return;
    }
    // args.command === "generate" from here.
    let config;
    try {
        const raw = fs_1.default.readFileSync(path_1.default.resolve(args.configPath), "utf-8");
        config = JSON.parse(raw);
    }
    catch (err) {
        io.error(`Error reading config: ${err.message}`);
        io.exit(1);
        onFinish?.();
        return;
    }
    // CLI override flags (e.g. --cellSize 90) take precedence over the
    // config file's own values for the fields they specify; anything not
    // passed on the command line falls through to the file unchanged.
    config = { ...config, ...args.overrides };
    try {
        (0, validate_1.validateConfig)(config);
    }
    catch (err) {
        io.error(`Invalid config: ${err.message}`);
        io.exit(1);
        onFinish?.();
        return;
    }
    if (args.dryRun) {
        // Reuses the same pure layout/content/pagination pipeline generate()
        // uses, without ever touching PDFKit or the filesystem for output —
        // so a dry run is cheap and side-effect free even for large configs.
        const layout = (0, layout_1.computeLayout)(config);
        const cellsPerPage = layout.columns * layout.rows;
        const content = (0, content_1.generateContent)({ mode: config.mode, characters: config.characters });
        const pages = (0, paginate_1.paginateContent)(content, cellsPerPage);
        io.log(`Config OK: ${pages.length} page(s), ${layout.columns}x${layout.rows} grid ` +
            `(${cellsPerPage} cells/page), ${content.length} cell(s) total.`);
        onFinish?.();
        return;
    }
    const writingToStdout = args.outputPath === "-";
    const outputStream = writingToStdout
        ? io.stdout
        : fs_1.default.createWriteStream(path_1.default.resolve(args.outputPath));
    const reportDone = () => {
        // When piping the PDF itself to stdout, any confirmation message
        // must go to stderr instead — writing it to stdout would corrupt
        // the binary PDF data for a real `--output - > out.pdf` redirect.
        if (writingToStdout) {
            io.error("Written to stdout");
        }
        else {
            io.log(`Written to ${args.outputPath}`);
        }
        onFinish?.();
    };
    if (writingToStdout) {
        // Node's stream.pipe() never calls .end() on process.stdout/stderr,
        // so outputStream's own "finish" event never fires for them. The
        // PDFDocument's "end" event fires regardless of the destination,
        // so it's used as the completion signal here instead.
        outputStream.on("error", (err) => {
            io.error(`Error writing output: ${err.message}`);
            io.exit(1);
            onFinish?.();
        });
        const doc = (0, generate_1.generate)({ ...config, outputStream });
        doc.on("end", reportDone);
    }
    else {
        outputStream.on("finish", reportDone);
        outputStream.on("error", (err) => {
            io.error(`Error writing output: ${err.message}`);
            io.exit(1);
            onFinish?.();
        });
        (0, generate_1.generate)({ ...config, outputStream });
    }
}
/* istanbul ignore next -- exercised via the compiled CLI, not unit tests */
if (require.main === module) {
    run(process.argv.slice(2));
}
