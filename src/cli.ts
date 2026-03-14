import minimist from "minimist";

export interface ParsedArgs {
  configPath: string;
  outputPath: string;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = minimist(argv);

  if (!args.config) throw new Error("--config is required");
  if (!args.output) throw new Error("--output is required");

  return {
    configPath: args.config,
    outputPath: args.output,
  };
}