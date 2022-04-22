import { findPkgData } from "../index";

// https://github.com/jkrems/proposal-pkg-exports#1-exports-field
describe("findPkgData", () => {
  it("pkg data", () => {
    const exports = {
      "./": "./src/util/",
      "./timezones/": "./data/timezones/",
      "./timezones/utc": "./data/timezones/utc/index.mjs",
      "./core-polyfill": ["std:core-module", "./core-polyfill.js"],
    };
    expect(
      findPkgData("@momentjs/moment/timezones/pdt.mjs", exports)
    ).toMatchObject({
      name: "@momentjs/moment",
      version: "",
      path: "./data/timezones/pdt.mjs",
      resolve: "@momentjs/moment/data/timezones/pdt.mjs",
      raw: "@momentjs/moment/timezones/pdt.mjs",
    });
  });
});
