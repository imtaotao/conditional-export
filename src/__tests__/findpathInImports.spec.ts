import { findPathInImports } from "../index";

describe("findPathInExports", () => {
  it("error check", () => {
    expect(() => findPathInImports("", {})).toThrow();
    expect(() => findPathInImports("a", {})).toThrow();
    expect(() => findPathInImports(0 as any, {})).toThrow();
    expect(() => findPathInImports(1 as any, {})).toThrow();
    expect(() => findPathInImports(true as any, {})).toThrow();
    expect(() => findPathInImports(false as any, {})).toThrow();
    expect(() => findPathInImports(null as any, {})).toThrow();
    expect(() => findPathInImports(undefined as any, {})).toThrow();
  });

  it("import path", () => {
    const imports = {
      "#timezones/": "./data/timezones/",
      "#timezones/utc": "./data/timezones/utc/index.mjs",
      "#external-feature": "external-pkg/feature",
      "#moment/": "./",
    };
    expect(findPathInImports("#timezones/utc", imports)).toBe(
      "./data/timezones/utc/index.mjs"
    );
    expect(findPathInImports("#timezones/utc/index.mjs", imports)).toBe(
      "./data/timezones/utc/index.mjs"
    );
    expect(findPathInImports("#external-feature", imports)).toBe(
      "external-pkg/feature"
    );
    expect(
      findPathInImports("#moment/data/timezones/utc/index.mjs", imports)
    ).toBe("./data/timezones/utc/index.mjs");

    expect(findPathInImports("#timezones/utc/", imports)).toBe(
      "./data/timezones/utc/"
    );
    expect(findPathInImports("#unknown", imports)).toBe(null);
    expect(findPathInImports("#timezones/", imports)).toBe("./data/timezones/");
    expect(findPathInImports("#moment", imports)).toBe(null);
  });
});
