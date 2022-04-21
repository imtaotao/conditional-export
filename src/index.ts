// https://github.com/jkrems/proposal-pkg-exports
type BaseType = null | string;
type Exports = string | Array<Exports> | { [key: string]: Exports };

const defaultTargets = ["require"];

const valid = (value: BaseType) => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("./")) return null;
  return value;
};

const detailValue = (
  exports: Exports,
  targets: Array<string>,
  data?: Array<string>
): BaseType => {
  if (typeof exports === "string") {
    if (!data || !data.length) {
      return valid(exports);
    }
    let result = "";
    const parts = exports.split(/\*+/);
    for (let i = 0; i < parts.length; i++) {
      result += parts[i];
      if (i !== parts.length - 1) {
        result += data[i] || "";
      }
    }
    return valid(result);
  } else if (Array.isArray(exports)) {
    for (const val of exports) {
      const result = detailValue(val, targets, data);
      if (result) return result;
    }
    return null;
  } else if (typeof exports === "object") {
    let result;
    for (const key of targets) {
      result = detailValue(exports[key], targets, data);
      if (result) return result;
    }
    return detailValue(exports["default"], targets, data);
  }
  return null;
};

// 模糊匹配
const fuzzyMatch = (path: string, keys: Array<string>) => {
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
    } else {
      matched = key;
    }
  }

  return [matched, data] as const;
};

// The first layer may be conditional mapping
export const findPath = (
  path: string,
  exports: Record<string, Exports>,
  targets = defaultTargets
) => {
  if (path !== "." && !path.startsWith("./")) {
    throw new TypeError("path must be `.` or start with `./`");
  }
  if (!exports) return null;
  if (Array.isArray(exports)) return null;
  if (typeof exports !== "object") return null;
  let result = null;
  if (exports[path]) {
    result = detailValue(exports[path], targets);
  } else {
    const [key, data] = fuzzyMatch(path, Object.keys(exports));
    if (key) result = detailValue(exports[key], targets, data);
  }
  if (result && path.endsWith('/') && !result.endsWith('/')) {
    return null;
  }
  return result;
};

export const findEntry = (exports: Exports, targets = defaultTargets) => {
  if (typeof exports === "string") {
    return exports;
  } else if (!exports) {
    return null;
  } else if (Array.isArray(exports)) {
    return detailValue(exports, targets);
  } else {
    return findPath(".", exports, targets);
  }
};
