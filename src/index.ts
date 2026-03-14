import fs from "fs";
import path from "path";
import { parseArgs } from "./cli";
import { generate } from "./generate";
import { validateConfig } from "./validate";

function main(): void {
  let args;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    console.error("Usage: hisseki --config <path> --output <path>");
    process.exit(1);
  }

  let config;

  try {
    const raw = fs.readFileSync(path.resolve(args.configPath), "utf-8");
    config = JSON.parse(raw);
  } catch (err: any) {
    console.error(`Error reading config: ${err.message}`);
    process.exit(1);
  }

  try {
    validateConfig(config);
  } catch (err: any) {
    console.error(`Invalid config: ${err.message}`);
    process.exit(1);
  }

  const outputStream = fs.createWriteStream(path.resolve(args.outputPath));

  outputStream.on("finish", () => {
    console.log(`Written to ${args.outputPath}`);
  });

  outputStream.on("error", (err) => {
    console.error(`Error writing output: ${err.message}`);
    process.exit(1);
  });

  generate({ ...config, outputStream });
}

main();