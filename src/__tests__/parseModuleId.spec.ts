import { parseModuleId } from "../index";

describe("parseModuleId", () => {
  it("pure name", () => {
    expect(parseModuleId("vue")).toMatchObject({
      name: "vue",
      path: "",
      version: "",
      raw: "vue",
    });
    expect(parseModuleId("@vue/core")).toMatchObject({
      name: "@vue/core",
      path: "",
      version: "",
      raw: "@vue/core",
    });
  });

  it("name and version", () => {
    expect(parseModuleId("vue@v1.0.0")).toMatchObject({
      name: "vue",
      path: "",
      version: "v1.0.0",
      raw: "vue@v1.0.0",
    });
    expect(parseModuleId("@vue/core@v1.0.0")).toMatchObject({
      name: "@vue/core",
      path: "",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0",
    });
  });
  it("name and path", () => {
    expect(parseModuleId("vue/a.js")).toMatchObject({
      name: "vue",
      path: "./a.js",
      version: "",
      raw: "vue/a.js",
    });
    expect(parseModuleId("vue/")).toMatchObject({
      name: "vue",
      path: "./",
      version: "",
      raw: "vue/",
    });
    expect(parseModuleId("vue/a/")).toMatchObject({
      name: "vue",
      path: "./a/",
      version: "",
      raw: "vue/a/",
    });
    expect(parseModuleId("vue/a/b.js")).toMatchObject({
      name: "vue",
      path: "./a/b.js",
      version: "",
      raw: "vue/a/b.js",
    });
    expect(parseModuleId("@vue/core/a.js")).toMatchObject({
      name: "@vue/core",
      path: "./a.js",
      version: "",
      raw: "@vue/core/a.js",
    });
    expect(parseModuleId("@vue/core/")).toMatchObject({
      name: "@vue/core",
      path: "./",
      version: "",
      raw: "@vue/core/",
    });
    expect(parseModuleId("@vue/core/a/")).toMatchObject({
      name: "@vue/core",
      path: "./a/",
      version: "",
      raw: "@vue/core/a/",
    });
    expect(parseModuleId("@vue/core/a/b.js")).toMatchObject({
      name: "@vue/core",
      path: "./a/b.js",
      version: "",
      raw: "@vue/core/a/b.js",
    });
  });

  it("name and version and path", () => {
    expect(parseModuleId("vue@v1.0.0/a.js")).toMatchObject({
      name: "vue",
      path: "./a.js",
      version: "v1.0.0",
      raw: "vue@v1.0.0/a.js",
    });
    expect(parseModuleId("vue@v1.0.0/")).toMatchObject({
      name: "vue",
      path: "./",
      version: "v1.0.0",
      raw: "vue@v1.0.0/",
    });
    expect(parseModuleId("vue@v1.0.0/a/")).toMatchObject({
      name: "vue",
      path: "./a/",
      version: "v1.0.0",
      raw: "vue@v1.0.0/a/",
    });
    expect(parseModuleId("vue@v1.0.0/a/b.js")).toMatchObject({
      name: "vue",
      path: "./a/b.js",
      version: "v1.0.0",
      raw: "vue@v1.0.0/a/b.js",
    });
    expect(parseModuleId("@vue/core@v1.0.0/a.js")).toMatchObject({
      name: "@vue/core",
      path: "./a.js",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0/a.js",
    });
    expect(parseModuleId("@vue/core@v1.0.0/")).toMatchObject({
      name: "@vue/core",
      path: "./",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0/",
    });
    expect(parseModuleId("@vue/core@v1.0.0/a/")).toMatchObject({
      name: "@vue/core",
      path: "./a/",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0/a/",
    });
    expect(parseModuleId("@vue/core@v1.0.0/a/b.js")).toMatchObject({
      name: "@vue/core",
      path: "./a/b.js",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0/a/b.js",
    });
  });

  it("extreme case", () => {
    expect(parseModuleId("@vue@v1.0.0/a@v1.0.1/a.js")).toMatchObject({
      name: "@vue@v1.0.0/a",
      path: "./a.js",
      version: "v1.0.1",
      raw: "@vue@v1.0.0/a@v1.0.1/a.js",
    });
    expect(parseModuleId("vue/server@v1.1.0")).toMatchObject({
      name: "vue",
      path: "./server@v1.1.0",
      version: "",
      raw: "vue/server@v1.1.0",
    });
    expect(parseModuleId("@vue@v1.1.0/core/timezones/pdt.mjs")).toMatchObject({
      name: "@vue@v1.1.0/core",
      path: "./timezones/pdt.mjs",
      version: "",
      raw: "@vue@v1.1.0/core/timezones/pdt.mjs",
    });
    expect(parseModuleId("@vue/@v1.0.0")).toMatchObject({
      name: "@vue/@v1.0.0",
      path: "",
      version: "",
      raw: "@vue/@v1.0.0",
    });
    expect(parseModuleId("@vue/@v1.0.0/")).toMatchObject({
      name: "@vue/@v1.0.0",
      path: "./",
      version: "",
      raw: "@vue/@v1.0.0/",
    });
    expect(parseModuleId("@vue/core/v1.0.0")).toMatchObject({
      name: "@vue/core",
      path: "./v1.0.0",
      version: "",
      raw: "@vue/core/v1.0.0",
    });
    expect(parseModuleId("@vue/core@v1.0.0/v1.0.1")).toMatchObject({
      name: "@vue/core",
      path: "./v1.0.1",
      version: "v1.0.0",
      raw: "@vue/core@v1.0.0/v1.0.1",
    });
  });

  it("error case", () => {
    expect(parseModuleId("@vue")).toMatchObject({
      name: "",
      path: "",
      version: "",
      raw: "@vue",
    });
    expect(parseModuleId("@vue/")).toMatchObject({
      name: "",
      path: "",
      version: "",
      raw: "@vue/",
    });
    expect(parseModuleId("@vue//")).toMatchObject({
      name: "",
      path: "",
      version: "",
      raw: "@vue//",
    });
    expect(parseModuleId("@vue@v1.0.0")).toMatchObject({
      name: "",
      path: "",
      version: "",
      raw: "@vue@v1.0.0",
    });
  });
});
