import fs from "fs";
import path from "path";
import { parseArgs } from "./cli";
import { generate } from "./generate";
import { validateConfig } from "./validate";
import { getVersion } from "./version";
import { computeLayout } from "./layout";
import { generateContent } from "./content";
import { paginateContent } from "./paginate";

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

/**
 * The subset of I/O that run() needs, injectable so tests can assert on
 * output/exit behavior without touching the real console or process.
 * exit is expected to *not* necessarily terminate the process (e.g. a
 * jest.fn() in tests), so every call site returns immediately after
 * calling it rather than relying on it to halt execution.
 */
export interface CliIO {
  log: (msg: string) => void;
  error: (msg: string) => void;
  exit: (code: number) => void;
  /** Destination for --output -; defaults to the real process stdout. */
  stdout: NodeJS.WritableStream;
}

const defaultIo: CliIO = {
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
export function run(argv: string[], io: CliIO = defaultIo, onFinish?: () => void): void {
  let args;

  try {
    args = parseArgs(argv);
  } catch (err: any) {
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
    io.log(getVersion(__dirname));
    onFinish?.();
    return;
  }

  // args.command === "generate" from here.
  let config;

  try {
    const raw = fs.readFileSync(path.resolve(args.configPath), "utf-8");
    config = JSON.parse(raw);
  } catch (err: any) {
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
    validateConfig(config);
  } catch (err: any) {
    io.error(`Invalid config: ${err.message}`);
    io.exit(1);
    onFinish?.();
    return;
  }

  if (args.dryRun) {
    // Reuses the same pure layout/content/pagination pipeline generate()
    // uses, without ever touching PDFKit or the filesystem for output —
    // so a dry run is cheap and side-effect free even for large configs.
    const layout = computeLayout(config);
    const cellsPerPage = layout.columns * layout.rows;
    const content = generateContent({ mode: config.mode, characters: config.characters });
    const pages = paginateContent(content, cellsPerPage);

    io.log(
      `Config OK: ${pages.length} page(s), ${layout.columns}x${layout.rows} grid ` +
        `(${cellsPerPage} cells/page), ${content.length} cell(s) total.`
    );
    onFinish?.();
    return;
  }

  const writingToStdout = args.outputPath === "-";
  const outputStream: NodeJS.WritableStream = writingToStdout
    ? io.stdout
    : fs.createWriteStream(path.resolve(args.outputPath!));

  const reportDone = () => {
    // When piping the PDF itself to stdout, any confirmation message
    // must go to stderr instead — writing it to stdout would corrupt
    // the binary PDF data for a real `--output - > out.pdf` redirect.
    if (writingToStdout) {
      io.error("Written to stdout");
    } else {
      io.log(`Written to ${args.outputPath}`);
    }
    onFinish?.();
  };

  if (writingToStdout) {
    // Node's stream.pipe() never calls .end() on process.stdout/stderr,
    // so outputStream's own "finish" event never fires for them. The
    // PDFDocument's "end" event fires regardless of the destination,
    // so it's used as the completion signal here instead.
    outputStream.on("error", (err: Error) => {
      io.error(`Error writing output: ${err.message}`);
      io.exit(1);
      onFinish?.();
    });

    const doc = generate({ ...config, outputStream });
    doc.on("end", reportDone);
  } else {
    outputStream.on("finish", reportDone);
    outputStream.on("error", (err: Error) => {
      io.error(`Error writing output: ${err.message}`);
      io.exit(1);
      onFinish?.();
    });

    generate({ ...config, outputStream });
  }
}

/* istanbul ignore next -- exercised via the compiled CLI, not unit tests */
if (require.main === module) {
  run(process.argv.slice(2));
}
