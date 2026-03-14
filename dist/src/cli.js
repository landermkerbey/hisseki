"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = parseArgs;
const minimist_1 = __importDefault(require("minimist"));
function parseArgs(argv) {
    const args = (0, minimist_1.default)(argv);
    if (!args.config)
        throw new Error("--config is required");
    if (!args.output)
        throw new Error("--output is required");
    return {
        configPath: args.config,
        outputPath: args.output,
    };
}
