import { checkFindPath } from "./utils";
import { findPathInExports } from "../index";

describe("findPathInExports", () => {
  it("error check", () => {
    expect(() => findPathInExports("", {})).toThrow();
    expect(() => findPathInExports("a", {})).toThrow();
    expect(() => findPathInExports(0 as any, {})).toThrow();
    expect(() => findPathInExports(1 as any, {})).toThrow();
    expect(() => findPathInExports(true as any, {})).toThrow();
    expect(() => findPathInExports(false as any, {})).toThrow();
    expect(() => findPathInExports(null as any, {})).toThrow();
    expect(() => findPathInExports(undefined as any, {})).toThrow();
  });

  it("path check", () => {
    checkFindPath(
      "./lib",
      {
        "./lib": { require: "./src" },
      },
      "./src"
    );
    checkFindPath(
      "./lib/index",
      {
        "./lib": { require: "./src" },
      },
      null
    );
    checkFindPath(
      "./lib",
      {
        "./lib/a": { require: "./src/a" },
      },
      null
    );
  });

  it("dir check", () => {
    checkFindPath(
      "./lib/",
      {
        "./lib/": { require: "./src/" },
      },
      "./src/"
    );
    checkFindPath(
      "./lib/",
      {
        "./lib": { require: "./src" },
      },
      null
    );
    checkFindPath(
      "./lib/",
      {
        "./lib": { require: "./src/" },
      },
      null
    );
    checkFindPath(
      "./lib/",
      {
        "./lib/": { require: "./src" },
      },
      null
    );
    checkFindPath(
      "./lib/index/",
      {
        "./lib/": { require: "./src/" },
      },
      "./src/index/"
    );
  });

  it("root dir", () => {
    const exports = {
      "./": "./src/utils/",
    };
    checkFindPath("./tick.js", exports, "./src/utils/tick.js");
    checkFindPath("./a/tick.js", exports, "./src/utils/a/tick.js");
  });

  it("root match", () => {
    const exports = {
      "./*": "./src/utils/*",
    };
    checkFindPath("./tick.js", exports, "./src/utils/tick.js");
    checkFindPath("./a/tick.js", exports, "./src/utils/a/tick.js");
  });

  it("condition export", () => {
    const exports = {
      "./lib/index": {
        require: "./src/core.cjs",
        development: "./src/core.development.js",
        default: "./src/core.js",
      },
    };
    expect(findPathInExports("./lib/index", exports)).toBe("./src/core.cjs");
    expect(findPathInExports("./lib/index", exports, ["development"])).toBe(
      "./src/core.development.js"
    );
    expect(findPathInExports("./lib/index", exports, ["production"])).toBe(
      "./src/core.js"
    );
  });

  it("nested condition export", () => {
    const exports = {
      "./a": {
        development: {
          import: "./feature-node.mjs",
          require: "./feature-node.cjs",
        },
        default: "./feature.mjs",
      },
    };
    expect(findPathInExports("./a", exports)).toBe("./feature.mjs");
    expect(findPathInExports("./a", exports, ["development", "require"])).toBe(
      "./feature-node.cjs"
    );
  });

  it("match", () => {
    const exports = {
      "./lib/*": {
        require: "./src/*.cjs",
        development: "./src/*.development.js",
        default: "./src/*.js",
      },
    };
    checkFindPath("./lib/index", exports, "./src/index.cjs");
    expect(findPathInExports("./lib/index", exports, ["development"])).toBe(
      "./src/index.development.js"
    );
    expect(findPathInExports("./lib/index", exports, ["production"])).toBe(
      "./src/index.js"
    );
  });

  // expandability
  it("multiple * matches", () => {
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/*x*x": { require: "./src/*a*.cjs" },
      })
    ).toBe("./src/taoa/inde.cjs");
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/*.cjs*" },
      })
    ).toBe("./src/tao.cjsindex");
    expect(
      findPathInExports("./lib/taox/indexa", {
        "./lib/*x/*a": { require: "./src/*.cjs*a" },
      })
    ).toBe("./src/tao.cjsindexa");
    expect(
      findPathInExports("./lib/taox/indexa", {
        "./lib/*x/*a": { require: "./src/*.cjs*a*" },
      })
    ).toBe("./src/tao.cjsindexa");
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/*.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/**x/*": { require: "./src/**.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/**x/*": { require: "./src/*.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPathInExports("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/**.cjs" },
      })
    ).toBe("./src/tao.cjs");
  });

  it("match dir", () => {
    checkFindPath(
      "./lib/index/",
      {
        "./lib/*/": { require: "./src/*/" },
      },
      "./src/index/"
    );
    checkFindPath(
      "./lib/index/",
      {
        "./lib/*": { require: "./src/*" },
      },
      null
    );
    checkFindPath(
      "./lib/index/",
      {
        "./lib/*/": { require: "./src/*" },
      },
      null
    );
  });

  it("match priority", () => {
    const exports = {
      "./features/*": "./src/features/*.js",
      "./features/private-internal/*": null,
    };
    checkFindPath("./features/private-internal/m", exports, null);
    checkFindPath("./features/x", exports, "./src/features/x.js");
  });

  it("match order(1)", () => {
    const exports = {
      "./*": {
        require: "./*.js",
        node: "./*.node.js",
      },
    };
    checkFindPath("./a", exports, "./a.js", ["require", "node"]);
    checkFindPath("./a", exports, "./a.js", ["node", "require"]);
  });

  it("match order(2)", () => {
    const exports = {
      "./*": {
        node: "./*.node.js",
        require: "./*.js",
      },
    };
    checkFindPath("./a", exports, "./a.node.js", ["require", "node"]);
    checkFindPath("./a", exports, "./a.node.js", ["node", "require"]);
  });

  it("check cycle key", () => {
    const exports = {
      "./a": {
        require: "./b",
      },
      "./b": "./b.js",
    };
    checkFindPath("./a", exports, "./b");
  });

  it("check node_modules", () => {
    checkFindPath(
      "./a",
      {
        "./a": "./src/node_modules1/a.js",
      },
      "./src/node_modules1/a.js"
    );
    checkFindPath(
      "./a",
      {
        "./a": "./src/node_modules/a.js",
      },
      null
    );
  });

  it("check backtrack", () => {
    checkFindPath(
      "./a",
      {
        "./a": "./../a.js",
      },
      null
    );
    checkFindPath(
      "./a",
      {
        "./a": "./b/../a.js",
      },
      null
    );
  });

  it("deep nested", () => {
    const exports = {
      "./a": {
        node: {
          require: {
            node: [
              {
                node: {
                  require: {
                    node: {
                      require: [{}, "./b.js"],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };
    checkFindPath("./a", exports, "./b.js", ["node", "require"]);
  });

  it("deep nested match", () => {
    const exports = {
      "./a/*": {
        node: {
          require: {
            node: [
              {
                node: {
                  require: {
                    node: {
                      require: [{}, "./src/*.js"],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };
    checkFindPath("./a/index", exports, "./src/index.js", ["node", "require"]);
  });

  it("deep nested match", () => {
    const exports = {
      "./a": {
        node: {
          require: {
            node: [
              {
                node: {
                  require: {
                    node: {
                      require: [{}, "b.js"],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };
    checkFindPath("./a", exports, null, ["node", "require"]);
  });
});
