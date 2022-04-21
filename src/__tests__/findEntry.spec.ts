import { findEntry } from "../index";

describe("findEntry", () => {
  it("string export", () => {
    expect(findEntry("")).toBe("");
    expect(findEntry("./a.js")).toBe("./a.js");
    expect(findEntry(true as any)).toBe(null);
  });

  // Can check array path
  it("array export", () => {
    expect(findEntry(["./a.js"])).toBe("./a.js");
    expect(findEntry(["a.js", "./b.js"])).toBe("./b.js");
    expect(findEntry([{ node: "./a.js" }, "./b.js"])).toBe("./b.js");
    expect(findEntry([{ node: "./a.js" }, "./b.js"], ["node"])).toBe("./a.js");
    expect(findEntry([{ node: "./a.js" }, "b.js"])).toBe(null);
    expect(findEntry([{ node: "a.js" }, "./b.js"], ["node"])).toBe("./b.js");
    expect(findEntry([{ node: "a.js" }, "b.js"], ["node"])).toBe(null);
    expect(
      findEntry([{ node: { require: "./a.js" } }, "./b.js"], ["node"])
    ).toBe("./b.js");
    expect(
      findEntry(
        [{ node: { require: "./a.js" } }, "./b.js"],
        ["node", "require"]
      )
    ).toBe("./a.js");
  });

  it("syntax sugar export", () => {
    let exports = {
      ".": "./a.js",
    };
    expect(findEntry(exports)).toBe("./a.js");
    exports = {
      ".": {
        require: "./a.js",
      },
    };
    expect(findEntry(exports)).toBe("./a.js");
    exports = {
      ".": {
        other: "./b.js",
        default: "./a.js",
      },
    };
    expect(findEntry(exports)).toBe("./a.js");
    exports = {
      ".": {
        other: "./b.js",
      },
    };
    expect(findEntry(exports)).toBe(null);
  });

  it("condition export", () => {
    const exports = {
      import: "./main-module.js",
      require: "./main-require.cjs",
    };
    expect(findEntry(exports)).toBe("./main-require.cjs");
    expect(findEntry(exports, [])).toBe(null);
    expect(findEntry(exports, ["import"])).toBe("./main-module.js");
  });
});
