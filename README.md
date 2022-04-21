<div align="center">
<h2>node-package-exports</h2>

[![NPM version](https://img.shields.io/npm/v/node-package-exports.svg?style=flat-square)](https://www.npmjs.com/package/node-package-exports)

</div>

Find entry or path in package.json exports.
> http://nodejs.cn/api/packages.html#conditional-exports


### NPM

Targets default to `['require']`;

```js
import { findPath, findEntry } from 'node-package-exports';

const exports = {
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

findEntry(exports); // ./index.cjs
findEntry(exports, ['development']); // ./index.development.js
findEntry(exports, ['production']); // ./index.js

findPath('./lib/index', exports); // ./src/index.cjs
findPath('./lib/index', exports, ['development']); // ./src/index.development.js
findPath('./lib/index', exports, ['production']); // ./src/index.js
```

### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/node-package-exports/dist/entry.umd.js"></script>
  <script>
    const { findPath, findEntry } = NodePackageExports;
    // ...
  </script>
</body>
</html>
```
