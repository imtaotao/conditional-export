export type BaseType =
  | number
  | bigint
  | string
  | symbol
  | boolean
  | null
  | undefined;
export type Imports = Record<string, Exports>;
export type Exports = BaseType | Array<Exports> | { [key: string]: Exports };
export type PkgData = ReturnType<typeof findPkgData>;
export type ModuleIdData = ReturnType<typeof parseModuleId>;

const defaultConditions = ["require"];

const isNativeType = (value: unknown): value is BaseType => {
  const type = typeof value;
  return (
    type === "number" ||
    type === "bigint" ||
    type === "string" ||
    type === "symbol" ||
    type === "boolean" ||
    value == undefined ||
    value === null
  );
};

const valid = (path: null | string, isExps: boolean) => {
  if (typeof path !== "string") {
    return null;
  } else if (path.includes("../")) {
    return null;
  } else if (path.includes("/node_modules/")) {
    return null;
  } else if (!path.startsWith("./")) {
    if (isExps) return null;
  }
  return path;
};

const conditionMatch = (
  exps: Exports,
  conditions: Array<string>,
  isExps: boolean,
  data?: Array<string>
): null | string => {
  if (exps === null) {
    return null;
  } else if (typeof exps === "string") {
    if (!data || !data.length) {
      return valid(exps, isExps);
    }
    let result = "";
    const parts = exps.split(/\*+/);
    for (let i = 0; i < parts.length; i++) {
      result += parts[i];
      if (i !== parts.length - 1) {
        result += data[i] || "";
      }
    }
    return valid(result, isExps);
  } else if (Array.isArray(exps)) {
    for (const val of exps) {
      const result = conditionMatch(val, conditions, isExps, data);
      if (result) return result;
    }
    return null;
  } else if (typeof exps === "object") {
    let result;
    const keys = Object.keys(exps);
    for (const key of keys) {
      if (key === "default" || conditions.includes(key)) {
        result = conditionMatch(exps[key], conditions, isExps, data);
        if (result) return result;
      }
    }
  }
  return null;
};

// Support more complex fuzzy matching rules,
// backward compatible with the definition of the specification
const fuzzyMatchKey = (path: string, keys: Array<string>) => {
  let prefix;
  let matched;
  const data = [];
  const pathLen = path.length;

  const findNextKeyIdx = (key: string, idx: number) => {
    for (let i = idx; i < key.length; i++) {
      if (key[i] !== "*") return i;
    }
  };

  const findPathMatchIdx = (char: string | undefined, idx: number) => {
    if (!char) return pathLen;
    for (let i = idx; i < pathLen; i++) {
      if (char === path[i]) return i;
    }
    return -1;
  };

  keys = keys.sort((a, b) => b.length - a.length);

  for (const key of keys) {
    if (matched) break;
    let i = 0;
    let j = 0;
    for (i = 0; i < pathLen; i++) {
      if (path[i] === key[j]) {
        j++;
      } else if (key[j] === "*") {
        const nextKeyIdx = findNextKeyIdx(key, j + 1);
        const pathMatchIdx = findPathMatchIdx(key[nextKeyIdx!], i + 1);
        if (pathMatchIdx === -1) break;
        data.push(path.slice(i, pathMatchIdx));
        i = pathMatchIdx;
        j = nextKeyIdx! + 1;
      } else {
        break;
      }
    }

    if (j < key.length) {
      data.length = 0;
    } else if (i < pathLen) {
      if (key.endsWith("/")) {
        matched = key;
        prefix = path.slice(0, i);
      } else {
        data.length = 0;
      }
    } else {
      matched = key;
      prefix = path.slice(0, i);
    }
  }
  return [matched, prefix, data] as const;
};

const findPath = (
  path: string,
  obj: Imports,
  conditions: Array<string>,
  isExps: boolean
) => {
  let result = null;
  let matchKey = null;
  let matchPrefix = null;

  if (obj[path]) {
    matchKey = path;
    matchPrefix = path;
    result = conditionMatch(obj[path], conditions, isExps);
  } else {
    if (path.length > 1) {
      // When looking for path, we must match, no conditional match is required
      const [key, prefix, data] = fuzzyMatchKey(path, Object.keys(obj));
      if (key) {
        matchKey = key;
        matchPrefix = prefix;
        result = conditionMatch(obj[key], conditions, isExps, data);
      }
    }
  }
  if (result) {
    // If is dir match, the return must be dir
    const keyIsDir = matchKey!.endsWith("/");
    const resultIsDir = result.endsWith("/");
    if (keyIsDir && !resultIsDir) return null;
    if (!keyIsDir && resultIsDir) return null;
    if (path !== matchPrefix) {
      result += path.slice(matchPrefix!.length);
    }
  }
  return result;
};

export const findPathInExports = (
  path: string,
  exps: Exports,
  conditions = defaultConditions
) => {
  if (isNativeType(exps)) return null;
  if (Array.isArray(exps)) return null;
  if (path !== "." && !path.startsWith("./")) {
    throw new SyntaxError("path must be `.` or start with `./`");
  }
  return findPath(path, exps, conditions, true);
};

export const findPathInImports = (
  path: string,
  imports: Imports,
  conditions = defaultConditions
) => {
  if (isNativeType(imports)) return null;
  if (Array.isArray(imports)) return null;
  if (!path.startsWith("#")) {
    throw new SyntaxError("path must start with `#`");
  }
  return findPath(path, imports, conditions, false);
};

export const findEntryInExports = (
  exps: Exports,
  conditions = defaultConditions
) => {
  if (typeof exps === "string") {
    return valid(exps, true);
  } else {
    // If syntactic sugar doesn't exist, try conditional match
    return (
      findPathInExports(".", exps, conditions) ||
      conditionMatch(exps, conditions, true)
    );
  }
};

export const findPkgData = (
  moduleId: string,
  exps: Exports,
  conditions = defaultConditions
) => {
  let path = null;
  let resolve = null;
  const { raw, name, version, path: virtualPath } = parseModuleId(moduleId);

  if (!name) {
    throw new SyntaxError(`"${raw}" is not a valid module id`);
  }
  path = virtualPath
    ? findPathInExports(virtualPath, exps, conditions)
    : findEntryInExports(exps, conditions);
  // ./ => /
  // ./a => /a
  // ./a/ => /a/
  if (path) {
    resolve = `${name}${version ? `@${version}` : ""}${path.slice(1)}`;
  }

  return {
    raw,
    name,
    path,
    version,
    resolve,
  };
};

export const parseModuleId = (moduleId: string) => {
  let name = "";
  let path = "";
  let version = "";

  let buf = "";
  let slash = 0;
  let isScope = false;

  const set = (type: string) => {
    if (type === "path") path = buf;
    if (type === "name") name = buf;
    if (type === "version") version = buf;
    buf = "";
  };

  const setValueBySlash = (char: string) => {
    if (!name) {
      set("name");
    } else if (!version) {
      set("version");
    } else {
      buf += char;
    }
  };

  for (let i = 0, l = moduleId.length; i < l; i++) {
    const char = moduleId[i];
    if (char === "@") {
      if (i === 0) {
        buf += char;
        isScope = true;
      } else if (!name) {
        if (isScope) {
          if (slash === 1 && buf[buf.length - 1] !== "/") {
            set("name");
          } else {
            buf += char;
          }
        } else {
          set("name");
        }
      } else {
        buf += char;
      }
    } else if (char === "/") {
      if (slash === 0) {
        if (!isScope) {
          setValueBySlash(char);
        }
        buf += char;
      } else if (slash === 1) {
        if (isScope) {
          setValueBySlash(char);
        }
        buf += char;
      } else {
        buf += char;
      }
      slash++;
    } else {
      buf += char;
    }
  }

  if (!name) {
    set("name");
  } else if (!version) {
    moduleId[name.length] === "@" ? set("version") : set("path");
  } else if (!path) {
    set("path");
  }

  if (path) {
    path = `.${path}`;
  }

  // `@vue` -> ''
  // `@vue/` -> ''
  // `@vue//` -> ''
  if (isScope && (slash === 0 || name[name.length - 1] === "/")) {
    name = "";
    path = "";
    version = "";
  }

  return {
    name,
    path,
    version,
    raw: moduleId,
  };
};
