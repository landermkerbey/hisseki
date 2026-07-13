import minimist from "minimist";

/** Prints usage/help text and exits without touching --config/--output. */
export interface HelpArgs {
  command: "help";
}

/** Prints the CLI's version and exits without touching --config/--output. */
export interface VersionArgs {
  command: "version";
}

/**
 * Top-level config fields that can be overridden directly from the
 * command line, layered on top of whatever --config's file specifies.
 * The `characters` array is intentionally excluded — it has no
 * reasonable flat CLI representation and must always come from the
 * config file.
 */
export interface ConfigOverrides {
  pageWidth?: number;
  pageHeight?: number;
  margin?: number;
  cellSize?: number;
  mode?: string;
  font?: string;
  fontPath?: string;
}

const OVERRIDE_KEYS: (keyof ConfigOverrides)[] = [
  "pageWidth",
  "pageHeight",
  "margin",
  "cellSize",
  "mode",
  "font",
  "fontPath",
];

/**
 * Raw filesystem paths taken from argv, before either file is read.
 * outputPath is optional because --dry-run never writes a PDF and so
 * does not require --output.
 */
export interface GenerateArgs {
  command: "generate";
  configPath: string;
  outputPath?: string;
  overrides: ConfigOverrides;
  dryRun: boolean;
}

export type ParsedArgs = HelpArgs | VersionArgs | GenerateArgs;

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
export function parseArgs(argv: string[]): ParsedArgs {
  const args = minimist(argv);

  if (args.help || args.h) return { command: "help" };
  if (args.version || args.v) return { command: "version" };

  const dryRun = Boolean(args["dry-run"] || args.dryRun);

  if (!args.config) throw new Error("--config is required");
  if (!dryRun && !args.output) throw new Error("--output is required");

  const overrides: ConfigOverrides = {};
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