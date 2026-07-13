"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const version_1 = require("../src/version");
describe("getVersion", () => {
    it("returns the version field from the nearest package.json above the given directory", () => {
        const packageJsonPath = path_1.default.join(__dirname, "..", "package.json");
        const expected = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8")).version;
        expect((0, version_1.getVersion)(__dirname)).toBe(expected);
    });
    it("works when starting from a nested subdirectory (e.g. dist/src)", () => {
        const packageJsonPath = path_1.default.join(__dirname, "..", "package.json");
        const expected = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8")).version;
        const nested = path_1.default.join(__dirname, "some", "nested", "dir");
        expect((0, version_1.getVersion)(nested)).toBe(expected);
    });
    it("throws a descriptive error if no package.json is found", () => {
        expect(() => (0, version_1.getVersion)("/")).toThrow("package.json not found");
    });
});
