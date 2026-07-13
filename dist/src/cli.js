"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = parseArgs;
const minimist_1 = __importDefault(require("minimist"));
const OVERRIDE_KEYS = [
    "pageWidth",
    "pageHeight",
    "margin",
    "cellSize",
    "mode",
    "font",
    "fontPath",
];
/**
 * Parses argv into one of three commands:
 *
 * - `--help`/`-h`: takes priority over everything else, including a
 *   missing/invalid --config or --output.
 * - `--version`/`-v`: same priority behavior as --help.
 * - otherwise: the default "generate" command, requiring --config,
 *   plus any recognized ConfigOverrides flags (e.g. --cellSize 90).
 *   Unrecognized flags are ignored, not treated as overrides or
 *   errors. Overrides are applied on top of the config file's values
 *   by the caller (see index.ts); parseArgs itself does not read or
 *   merge the config file.
 *   --output is required unless --dry-run is passed, since a dry run
 *   validates the config and reports what would be generated without
 *   writing a PDF anywhere.
 */
function parseArgs(argv) {
    const args = (0, minimist_1.default)(argv);
    if (args.help || args.h)
        return { command: "help" };
    if (args.version || args.v)
        return { command: "version" };
    const dryRun = Boolean(args["dry-run"] || args.dryRun);
    if (!args.config)
        throw new Error("--config is required");
    if (!dryRun && !args.output)
        throw new Error("--output is required");
    const overrides = {};
    for (const key of OVERRIDE_KEYS) {
        if (args[key] !== undefined) {
            overrides[key] = args[key];
        }
    }
    return {
        command: "generate",
        configPath: args.config,
        outputPath: args.output,
        overrides,
        dryRun,
    };
}
