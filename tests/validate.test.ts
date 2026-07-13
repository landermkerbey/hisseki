import { validateConfig } from "../src/validate";

const validConfig = {
  pageWidth: 612,
  pageHeight: 792,
  margin: 72,
  cellSize: 72,
  mode: "grouped",
  font: "Helvetica",
  characters: [
    {
      character: "永",
      cellsPerCharacter: 20,
      opacity: { type: "fixed", opacity: 0.5 },
    },
  ],
};

describe("validateConfig", () => {
  it("accepts a valid config", () => {
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  it("throws when pageWidth is missing", () => {
    const { pageWidth, ...rest } = validConfig;
    expect(() => validateConfig(rest)).toThrow("pageWidth must be a positive number");
  });

  it("throws when margin is too large", () => {
    expect(() => validateConfig({ ...validConfig, margin: 400 })).toThrow(
      "margin must be less than half of pageWidth and pageHeight"
    );
  });

  it("throws when cellSize does not fit within margins", () => {
    expect(() => validateConfig({ ...validConfig, cellSize: 500 })).toThrow(
      "cellSize must fit at least one column and one row within the page margins"
    );
  });

  it("throws when mode is invalid", () => {
    expect(() => validateConfig({ ...validConfig, mode: "spiral" })).toThrow(
      'mode must be "grouped" or "roundRobin"'
    );
  });

  it("accepts a config with no direction field at all (defaults to horizontal downstream)", () => {
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  it("accepts direction: \"horizontal\"", () => {
    expect(() => validateConfig({ ...validConfig, direction: "horizontal" })).not.toThrow();
  });

  it("accepts direction: \"vertical\"", () => {
    expect(() => validateConfig({ ...validConfig, direction: "vertical" })).not.toThrow();
  });

  it("throws when direction is present but invalid", () => {
    expect(() => validateConfig({ ...validConfig, direction: "diagonal" })).toThrow(
      'direction must be "horizontal" or "vertical"'
    );
  });

  it("throws when characters is empty", () => {
    expect(() => validateConfig({ ...validConfig, characters: [] })).toThrow(
      "characters must be a non-empty array"
    );
  });

  it("throws when a character entry has no character string", () => {
    const characters = [{ ...validConfig.characters[0], character: "" }];
    expect(() => validateConfig({ ...validConfig, characters })).toThrow(
      "character at index 0 must have a non-empty character string"
    );
  });

  it("throws when cellsPerCharacter is not positive", () => {
    const characters = [{ ...validConfig.characters[0], cellsPerCharacter: 0 }];
    expect(() => validateConfig({ ...validConfig, characters })).toThrow(
      "character at index 0 must have a positive cellsPerCharacter"
    );
  });

  it("accepts a character entry with no strokeOrder field", () => {
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  it("accepts a character entry with strokeOrder: true", () => {
    const characters = [{ ...validConfig.characters[0], strokeOrder: true }];
    expect(() => validateConfig({ ...validConfig, characters })).not.toThrow();
  });

  it("accepts a character entry with strokeOrder: false", () => {
    const characters = [{ ...validConfig.characters[0], strokeOrder: false }];
    expect(() => validateConfig({ ...validConfig, characters })).not.toThrow();
  });

  it("throws when strokeOrder is present but not a boolean", () => {
    const characters = [{ ...validConfig.characters[0], strokeOrder: "yes" }];
    expect(() => validateConfig({ ...validConfig, characters })).toThrow(
      "character at index 0 strokeOrder must be a boolean"
    );
  });

  it("throws when opacity type is invalid", () => {
    const characters = [{ ...validConfig.characters[0], opacity: { type: "random" } }];
    expect(() => validateConfig({ ...validConfig, characters })).toThrow(
      'character at index 0 has an invalid opacity type'
    );
  });

  it("throws when fade opacity is missing start", () => {
    const characters = [{ ...validConfig.characters[0], opacity: { type: "fade", end: 0.3 } }];
    expect(() => validateConfig({ ...validConfig, characters })).toThrow(
      "character at index 0 fade opacity must have numeric start and end"
    );
  });
});