<div align='center'>
<h2>node-package-exports</h2>

[![NPM version](https://img.shields.io/npm/v/node-package-exports.svg?style=flat-square)](https://www.npmjs.com/package/node-package-exports)

</div>

Find entry or path in package.json exports.
> http://nodejs.cn/api/packages.html#conditional-exports


### NPM

Default conditions is `['require']`;

```js
import { findPath, findEntry } from 'node-package-exports';

const exps = {
  '.': {
    require: './index.cjs',
    development: './index.development.js',
    default: './index.js',
  },
  './lib/*': {
    require: './src/*.cjs',
    development: './src/*.development.js',
    default: './src/*.js',
  },
}

findEntry(exps); // ./index.cjs
findEntry(exps, ['development']); // ./index.development.js
findEntry(exps, ['production']); // ./index.js

findPath('./lib/index', exps); // ./src/index.cjs
findPath('./lib/index', exps, ['development']); // ./src/index.development.js
findPath('./lib/index', exps, ['production']); // ./src/index.js
```

multiple conditions

```js
const exps = {
  './a': {
    node: {
      import: './feature-node.mjs',
      require: './feature-node.cjs',
    },
    default: './feature.mjs',
  }
};
expect(findPath('./a', exps)).toBe('./feature.mjs');
expect(findPath('./a', exps, ['node', 'require'])).toBe('./feature-node.cjs');
```


### Extended usage

When you don't know if path exists, you can wrap it like this. 
Because `findPath` does not conditionally match the first-level structure, but `findEntry` will.

```js
const find = (path, exps, conditions) => {
  return path
    ? findPath(path, exps, conditions)
    : findEntry(exps, conditions);
}
```


### CDN

```html
<!DOCTYPE html>
<html lang='en'>
<body>
  <script src='https://unpkg.com/node-package-exports/dist/entry.umd.js'></script>
  <script>
    const { findPath, findEntry } = NodePackageExports;
    // ...
  </script>
</body>
</html>
```
