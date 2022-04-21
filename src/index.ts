// https://github.com/jkrems/proposal-pkg-exports
type BaseType = null | string;
type Exports = string | null | Array<Exports> | { [key: string]: Exports };

const defaultConditions = ["require"];

const valid = (value: BaseType) => {
  if (typeof value !== "string") return null;
  if (!value.startsWith("./")) return null;
  return value;
};

const detailValue = (
  exps: Exports,
  conditions: Array<string>,
  data?: Array<string>
): BaseType => {
  if (exps === null) {
    return null;
  } else if (typeof exps === "string") {
    if (!data || !data.length) {
      return valid(exps);
    }
    let result = "";
    const parts = exps.split(/\*+/);
    for (let i = 0; i < parts.length; i++) {
      result += parts[i];
      if (i !== parts.length - 1) {
        result += data[i] || "";
      }
    }
    return valid(result);
  } else if (Array.isArray(exps)) {
    for (const val of exps) {
      const result = detailValue(val, conditions, data);
      if (result) return result;
    }
    return null;
  } else if (typeof exps === "object") {
    let result;
    const keys = Object.keys(exps);
    for (const key of keys) {
      if (key === "default" || conditions.includes(key)) {
        result = detailValue(exps[key], conditions, data);
        if (result) return result;
      }
    }
  }
  return null;
};

// 模糊匹配
const fuzzyMatch = (path: string, keys: Array<string>) => {
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

  let prefix;
  let matched;
  const data = [];
  const pathLen = path.length;

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

export const findPath = (
  path: string,
  exps: Record<string, Exports>,
  conditions = defaultConditions
) => {
  if (path !== "." && !path.startsWith("./")) {
    throw new TypeError("path must be `.` or start with `./`");
  }
  if (!exps) return null;
  if (Array.isArray(exps)) return null;
  if (typeof exps !== "object") return null;

  let result = null;
  let matchKey = null;
  let matchPrefix = null;

  if (exps[path]) {
    matchKey = path;
    matchPrefix = path;
    result = detailValue(exps[path], conditions);
  } else {
    // When looking for path, we must match, no conditional match is required
    const [key, prefix, data] = fuzzyMatch(path, Object.keys(exps));
    if (key) {
      matchKey = key;
      matchPrefix = prefix;
      result = detailValue(exps[key], conditions, data);
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

export const findEntry = (exps: Exports, conditions = defaultConditions) => {
  if (typeof exps === "string") {
    return exps;
  } else if (!exps) {
    return null;
  } else if (Array.isArray(exps)) {
    return detailValue(exps, conditions);
  } else {
    // If syntactic sugar doesn't exist, try conditional match
    return findPath(".", exps, conditions) || detailValue(exps, conditions);
  }
};
