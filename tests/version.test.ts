import fs from "fs";
import path from "path";
import { getVersion } from "../src/version";

describe("getVersion", () => {
  it("returns the version field from the nearest package.json above the given directory", () => {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const expected = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")).version;

    expect(getVersion(__dirname)).toBe(expected);
  });

  it("works when starting from a nested subdirectory (e.g. dist/src)", () => {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const expected = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")).version;

    const nested = path.join(__dirname, "some", "nested", "dir");
    expect(getVersion(nested)).toBe(expected);
  });

  it("throws a descriptive error if no package.json is found", () => {
    expect(() => getVersion("/")).toThrow("package.json not found");
  });
});
