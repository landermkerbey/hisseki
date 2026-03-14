import { parseArgs } from "../src/cli";

describe("parseArgs", () => {
  it("parses config and output paths from argv", () => {
    const result = parseArgs([
      "--config", "config.json",
      "--output", "output.pdf",
    ]);

    expect(result).toEqual({
      configPath: "config.json",
      outputPath: "output.pdf",
    });
  });

  it("throws when config is missing", () => {
    expect(() => parseArgs(["--output", "output.pdf"])).toThrow("--config is required");
  });

  it("throws when output is missing", () => {
    expect(() => parseArgs(["--config", "config.json"])).toThrow("--output is required");
  });
});