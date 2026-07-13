import minimist from "minimist";

/** Raw filesystem paths taken from argv, before either file is read. */
export interface ParsedArgs {
  configPath: string;
  outputPath: string;
}

/**
 * Parses the two required flags, --config and --output. Both are
 * required with no defaults or short forms; there is currently no way
 * to pass generation parameters directly on the command line (config
 * must always be a JSON file on disk). See README.org's "Enhancements"
 * section for ideas like --dry-run, --stdout, or inline flag overrides.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const args = minimist(argv);

  if (!args.config) throw new Error("--config is required");
  if (!args.output) throw new Error("--output is required");

  return {
    configPath: args.config,
    outputPath: args.output,
  };
}