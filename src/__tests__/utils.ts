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
  
  if (fs.existsSync(dir)) fs.removeSync(dir);
  fs.ensureFileSync(jsonDir);
  fs.writeFileSync(jsonDir, JSON.stringify({ name, [type]: obj }, null, 2));
  if (dest !== null) {
    dest = path.resolve(dir, dest);
    dest.endsWith("/") ? fs.ensureDirSync(dest) : fs.ensureFileSync(dest);
  }
  return {
    dir,
    name,
    remove: () => fs.removeSync(dir),
  };
};

const resolvePath = (input: string, name: string) => {
  return require.resolve(name + input.slice(1));
};

export const checkFindPath = (
  input: string,
  exps: Exports,
  value: string | null
) => {
  // check customize behavior
  expect(findPathInExports(input, exps)).toBe(value);
  // check node behavior
  const { dir, name, remove } = createNodeTestEnv("exports", exps, value);
  if (value === null) {
    expect(() => resolvePath(input, name)).toThrow();
  } else {
    expect(resolvePath(input, name)).toBe(path.resolve(dir, value));
  }
  remove();
};

export const checkFindEntry = (exps: Exports, value: string | null) => {};
