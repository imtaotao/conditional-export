import { checkFindEntry } from "./utils";
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
    checkFindEntry(["./a.js"], "./a.js");
    checkFindEntry(["a.js", "./b.js"], "./b.js");
    checkFindEntry([{ development: "./a.js" }, "./b.js"], "./b.js");
    checkFindEntry([{ node: "./a.js" }, "./b.js"], "./a.js", ["node"]);
    checkFindEntry([{ development: "./a.js" }, "b.js"], null);
    checkFindEntry([{ node: "a.js" }, "./b.js"], "./b.js", ["node"]);
    checkFindEntry([{ node: "a.js" }, "b.js"], null, ["node"]);
    checkFindEntry([{ node: { require: "./a.js" } }, "./b.js"], "./a.js", [
      "node",
      "require",
    ]);
    expect(
      findEntryInExports(
        [{ development: { require: "./a.js" } }, "./b.js"],
        ["development"]
      )
    ).toBe("./b.js");
  });

  it("syntax sugar export", () => {
    let exports = {
      ".": "./a.js",
    };
    checkFindEntry(exports, "./a.js");
    exports = {
      ".": {
        require: "./a.js",
      },
    };
    checkFindEntry(exports, "./a.js");
    exports = {
      ".": {
        other: "./b.js",
        default: "./a.js",
      },
    };
    checkFindEntry(exports, "./a.js");
    exports = {
      ".": {
        other: "./b.js",
      },
    };
    checkFindEntry(exports, null);
  });

  it("condition export", () => {
    let exports = {
      import: "./main-module.js",
      require: "./main-require.cjs",
    };
    checkFindEntry(exports, "./main-require.cjs");
    exports = {
      module: "./main-module.js",
      cjs: "./main-require.cjs",
    };
    checkFindEntry(exports, null);
    exports = {
      node: "./main-module.js",
      cjs: "./main-require.cjs",
    };
    checkFindEntry(exports, "./main-module.js", ["node"]);
  });
});
