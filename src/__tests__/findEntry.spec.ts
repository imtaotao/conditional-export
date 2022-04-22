import { findEntryInExports } from "../index";

describe("findEntryInExports", () => {
  it("string export", () => {
    expect(findEntryInExports("")).toBe(null);
    expect(findEntryInExports("./a.js")).toBe("./a.js");
    expect(findEntryInExports(0)).toBe(null);
    expect(findEntryInExports(1)).toBe(null);
    expect(findEntryInExports(true)).toBe(null);
    expect(findEntryInExports(false)).toBe(null);
    expect(findEntryInExports(null)).toBe(null);
    expect(findEntryInExports(undefined)).toBe(null);
  });

  // Can check array path
  it("array export", () => {
    expect(findEntryInExports(["./a.js"])).toBe("./a.js");
    expect(findEntryInExports(["a.js", "./b.js"])).toBe("./b.js");
    expect(findEntryInExports([{ development: "./a.js" }, "./b.js"])).toBe(
      "./b.js"
    );
    expect(
      findEntryInExports([{ development: "./a.js" }, "./b.js"], ["development"])
    ).toBe("./a.js");
    expect(findEntryInExports([{ development: "./a.js" }, "b.js"])).toBe(null);
    expect(
      findEntryInExports([{ development: "a.js" }, "./b.js"], ["development"])
    ).toBe("./b.js");
    expect(
      findEntryInExports([{ development: "a.js" }, "b.js"], ["development"])
    ).toBe(null);
    expect(
      findEntryInExports(
        [{ development: { require: "./a.js" } }, "./b.js"],
        ["development"]
      )
    ).toBe("./b.js");
    expect(
      findEntryInExports(
        [{ development: { require: "./a.js" } }, "./b.js"],
        ["development", "require"]
      )
    ).toBe("./a.js");
  });

  it("syntax sugar export", () => {
    let exports = {
      ".": "./a.js",
    };
    expect(findEntryInExports(exports)).toBe("./a.js");
    exports = {
      ".": {
        require: "./a.js",
      },
    };
    expect(findEntryInExports(exports)).toBe("./a.js");
    exports = {
      ".": {
        other: "./b.js",
        default: "./a.js",
      },
    };
    expect(findEntryInExports(exports)).toBe("./a.js");
    exports = {
      ".": {
        other: "./b.js",
      },
    };
    expect(findEntryInExports(exports)).toBe(null);
  });

  it("condition export", () => {
    const exports = {
      import: "./main-module.js",
      require: "./main-require.cjs",
    };
    expect(findEntryInExports(exports)).toBe("./main-require.cjs");
    expect(findEntryInExports(exports, [])).toBe(null);
    expect(findEntryInExports(exports, ["import"])).toBe("./main-module.js");
  });
});
