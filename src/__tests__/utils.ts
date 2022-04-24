import * as path from "path";
import * as fs from "fs-extra";
import {
  Exports,
  Imports,
  findPathInExports,
  findEntryInExports,
} from "../index";

// avoid cache
let id = 0;

const createNodeTestEnv = (
  type: "exports" | "imports",
  obj: Exports | Imports,
  dest: string | null
) => {
  const name = "demo" + ++id;
  const dir = path.resolve(__dirname, "./node_modules", name);
  const jsonDir = path.resolve(dir, "./package.json");

  if (fs.existsSync(dir)) {
    fs.removeSync(dir);
  }
  fs.ensureFileSync(jsonDir);
  fs.writeFileSync(jsonDir, JSON.stringify({ name, [type]: obj }, null, 2));
  if (dest !== null) {
    if (dest.endsWith("/")) {
      dest = path.resolve(dir, dest, "./index.js"); // Some nodejs versions automatically look for index.js
      fs.ensureFileSync(dest);
    } else {
      dest = path.resolve(dir, dest);
      fs.ensureFileSync(dest);
    }
  }
  return {
    name,
    dest,
    remove: () => fs.removeSync(dir),
  };
};

const resolvePath = (input: string, name: string) => {
  return require.resolve(name + input.slice(1));
};

export const checkFindPath = (
  input: string,
  exps: Exports,
  value: string | null,
  conditions?: Array<string>
) => {
  // check nodeJs behavior
  const { name, dest, remove } = createNodeTestEnv("exports", exps, value);
  if (value === null) {
    expect(() => resolvePath(input, name)).toThrow();
  } else {
    expect(resolvePath(input, name)).toBe(dest);
  }
  remove();
  // check customize behavior
  expect(findPathInExports(input, exps, conditions)).toBe(value);
};

export const checkFindEntry = (
  exps: Exports,
  value: string | null,
  conditions?: Array<string>
) => {
  // check nodeJs behavior
  const { name, dest, remove } = createNodeTestEnv("exports", exps, value);
  if (value === null) {
    expect(() => resolvePath(".", name)).toThrow();
  } else {
    expect(resolvePath(".", name)).toBe(dest);
  }
  remove();
  // check customize behavior
  expect(findEntryInExports(exps, conditions)).toBe(value);
};
