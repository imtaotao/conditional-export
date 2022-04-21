import { findPath } from "../index";

describe("findPath", () => {
  it("error check", () => {
    expect(() => findPath("", {})).toThrow();
    expect(() => findPath("a", {})).toThrow();
    expect(() => findPath(1 as any, {})).toThrow();
    expect(() => findPath(null as any, {})).toThrow();
    expect(() => findPath(true as any, {})).toThrow();
  });

  it("path check", () => {
    expect(
      findPath("./lib", {
        "./lib": { require: "./src" },
      })
    ).toBe("./src");
    expect(
      findPath("./lib/index", {
        "./lib": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPath("./lib", {
        "./lib/a": { require: "./src/a" },
      })
    ).toBe(null);
  });

  it("dir check", () => {
    expect(
      findPath("./lib/", {
        "./lib/": { require: "./src/" },
      })
    ).toBe("./src/");
    expect(
      findPath("./lib/", {
        "./lib": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPath("./lib/", {
        "./lib": { require: "./src/" },
      })
    ).toBe(null);
    expect(
      findPath("./lib/", {
        "./lib/": { require: "./src" },
      })
    ).toBe(null);
    expect(
      findPath("./lib/index/", {
        "./lib/": { require: "./src/" },
      })
    ).toBe("./src/index/");
  });

  it("root dir", () => {
    const exports = {
      "./": "./src/utils/",
    };
    expect(findPath("./tick.js", exports)).toBe("./src/utils/tick.js");
    expect(findPath("./a/tick.js", exports)).toBe("./src/utils/a/tick.js");
  });

  it("root match", () => {
    const exports = {
      "./*": "./src/utils/*",
    };
    expect(findPath("./tick.js", exports)).toBe("./src/utils/tick.js");
    expect(findPath("./a/tick.js", exports)).toBe("./src/utils/a/tick.js");
  });

  it("condition export", () => {
    const exports = {
      "./lib/index": {
        require: "./src/core.cjs",
        development: "./src/core.development.js",
        default: "./src/core.js",
      },
    };
    expect(findPath("./lib/index", exports)).toBe("./src/core.cjs");
    expect(findPath("./lib/index", exports, ["development"])).toBe(
      "./src/core.development.js"
    );
    expect(findPath("./lib/index", exports, ["production"])).toBe(
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
    expect(findPath("./a", exports)).toBe("./feature.mjs");
    expect(findPath("./a", exports, ["node", "require"])).toBe(
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
    expect(findPath("./lib/index", exports)).toBe("./src/index.cjs");
    expect(findPath("./lib/index", exports, ["development"])).toBe(
      "./src/index.development.js"
    );
    expect(findPath("./lib/index", exports, ["production"])).toBe(
      "./src/index.js"
    );
  });

  it("multiple * matches", () => {
    expect(
      findPath("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/*.cjs*" },
      })
    ).toBe("./src/tao.cjsindex");
    expect(
      findPath("./lib/taox/indexa", {
        "./lib/*x/*a": { require: "./src/*.cjs*a" },
      })
    ).toBe("./src/tao.cjsindexa");
    expect(
      findPath("./lib/taox/indexa", {
        "./lib/*x/*a": { require: "./src/*.cjs*a*" },
      })
    ).toBe("./src/tao.cjsindexa");
    expect(
      findPath("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/*.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPath("./lib/taox/index", {
        "./lib/**x/*": { require: "./src/**.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPath("./lib/taox/index", {
        "./lib/**x/*": { require: "./src/*.cjs" },
      })
    ).toBe("./src/tao.cjs");
    expect(
      findPath("./lib/taox/index", {
        "./lib/*x/*": { require: "./src/**.cjs" },
      })
    ).toBe("./src/tao.cjs");
  });

  it("match dir", () => {
    expect(
      findPath("./lib/index/", {
        "./lib/*/": { require: "./src/*/" },
      })
    ).toBe("./src/index/");
    expect(
      findPath("./lib/index/", {
        "./lib/*": { require: "./src/*" },
      })
    ).toBe(null);
    expect(
      findPath("./lib/index/", {
        "./lib/*/": { require: "./src/*" },
      })
    ).toBe(null);
  });

  it("match priority", () => {
    const exports = {
      "./features/*": "./src/features/*.js",
      "./features/private-internal/*": null,
    };
    expect(findPath("./features/private-internal/m", exports)).toBe(null);
    expect(findPath("./features/x", exports)).toBe("./src/features/x.js");
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
    expect(findPath("./a", exports, ["node", "require"])).toBe("./b.js");
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
    expect(findPath("./a/index", exports, ["node", "require"])).toBe(
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
    expect(findPath("./a", exports, ["node", "require"])).toBe(null);
  });
});
