"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_1 = require("./cli");
const generate_1 = require("./generate");
function main() {
    let args;
    try {
        args = (0, cli_1.parseArgs)(process.argv.slice(2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        console.error("Usage: hisseki --config <path> --output <path>");
        process.exit(1);
    }
    let config;
    try {
        const raw = fs_1.default.readFileSync(path_1.default.resolve(args.configPath), "utf-8");
        config = JSON.parse(raw);
    }
    catch (err) {
        console.error(`Error reading config: ${err.message}`);
        process.exit(1);
    }
    const outputStream = fs_1.default.createWriteStream(path_1.default.resolve(args.outputPath));
    outputStream.on("finish", () => {
        console.log(`Written to ${args.outputPath}`);
    });
    outputStream.on("error", (err) => {
        console.error(`Error writing output: ${err.message}`);
        process.exit(1);
    });
    (0, generate_1.generate)({ ...config, outputStream });
}
main();
