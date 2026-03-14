import { registerFont } from "../src/font";

describe("registerFont", () => {
  it("registers a custom font when fontPath is provided", () => {
    const mockDoc = {
      registerFont: jest.fn().mockReturnThis(),
    };

    registerFont(mockDoc as any, "MyFont", "/path/to/font.ttf");

    expect(mockDoc.registerFont).toHaveBeenCalledWith("MyFont", "/path/to/font.ttf");
  });

  it("does not register a font when fontPath is absent", () => {
    const mockDoc = {
      registerFont: jest.fn().mockReturnThis(),
    };

    registerFont(mockDoc as any, "Helvetica");

    expect(mockDoc.registerFont).not.toHaveBeenCalled();
  });
});