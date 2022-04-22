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
    expect(
      findPathInExports("./lib", {
        "./lib": { require: "./src" },
      })
    ).toBe("./src");
    expect(
      findPathInExports("./lib/index", {
        "./lib": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPathInExports("./lib", {
        "./lib/a": { require: "./src/a" },
      })
    ).toBe(null);
  });

  it("dir check", () => {
    expect(
      findPathInExports("./lib/", {
        "./lib/": { require: "./src/" },
      })
    ).toBe("./src/");
    expect(
      findPathInExports("./lib/", {
        "./lib": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPathInExports("./lib/", {
        "./lib": { require: "./src/" },
      })
    ).toBe(null);
    expect(
      findPathInExports("./lib/", {
        "./lib/": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPathInExports("./lib/index/", {
        "./lib/": { require: "./src/" },
      })
    ).toBe("./src/index/");
  });

  it("root dir", () => {
    const exports = {
      "./": "./src/utils/",
    };
    expect(findPathInExports("./tick.js", exports)).toBe("./src/utils/tick.js");
    expect(findPathInExports("./a/tick.js", exports)).toBe(
      "./src/utils/a/tick.js"
    );
  });

  it("root match", () => {
    const exports = {
      "./*": "./src/utils/*",
    };
    expect(findPathInExports("./tick.js", exports)).toBe("./src/utils/tick.js");
    expect(findPathInExports("./a/tick.js", exports)).toBe(
      "./src/utils/a/tick.js"
    );
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
        node: {
          import: "./feature-node.mjs",
          require: "./feature-node.cjs",
        },
        default: "./feature.mjs",
      },
    };
    expect(findPathInExports("./a", exports)).toBe("./feature.mjs");
    expect(findPathInExports("./a", exports, ["node", "require"])).toBe(
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
    expect(findPathInExports("./lib/index", exports)).toBe("./src/index.cjs");
    expect(findPathInExports("./lib/index", exports, ["development"])).toBe(
      "./src/index.development.js"
    );
    expect(findPathInExports("./lib/index", exports, ["production"])).toBe(
      "./src/index.js"
    );
  });

  it("multiple * matches", () => {
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
    expect(
      findPathInExports("./lib/index/", {
        "./lib/*/": { require: "./src/*/" },
      })
    ).toBe("./src/index/");
    expect(
      findPathInExports("./lib/index/", {
        "./lib/*": { require: "./src/*" },
      })
    ).toBe(null);
    expect(
      findPathInExports("./lib/index/", {
        "./lib/*/": { require: "./src/*" },
      })
    ).toBe(null);
  });

  it("match priority", () => {
    const exports = {
      "./features/*": "./src/features/*.js",
      "./features/private-internal/*": null,
    };
    expect(findPathInExports("./features/private-internal/m", exports)).toBe(
      null
    );
    expect(findPathInExports("./features/x", exports)).toBe(
      "./src/features/x.js"
    );
  });

  it("match order(1)", () => {
    const exports = {
      "./*": {
        require: "./*.js",
        node: "./*.node.js",
      },
    };
    expect(findPathInExports("./a", exports, ["require", "node"])).toBe(
      "./a.js"
    );
    expect(findPathInExports("./a", exports, ["node", "require"])).toBe(
      "./a.js"
    );
  });

  it("match order(2)", () => {
    const exports = {
      "./*": {
        node: "./*.node.js",
        require: "./*.js",
      },
    };
    expect(findPathInExports("./a", exports, ["require", "node"])).toBe(
      "./a.node.js"
    );
    expect(findPathInExports("./a", exports, ["node", "require"])).toBe(
      "./a.node.js"
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
    expect(findPathInExports("./a", exports, ["node", "require"])).toBe(
      "./b.js"
    );
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
    expect(findPathInExports("./a/index", exports, ["node", "require"])).toBe(
      "./src/index.js"
    );
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
    expect(findPathInExports("./a", exports, ["node", "require"])).toBe(null);
  });
});
