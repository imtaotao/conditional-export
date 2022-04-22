<div align='center'>
<h2>node-package-exports</h2>

[![NPM version](https://img.shields.io/npm/v/node-package-exports.svg?style=flat-square)](https://www.npmjs.com/package/node-package-exports)

</div>

Find entry or path in package.json exports. https://github.com/jkrems/proposal-pkg-exports


### findEntry

Default conditions is `['require']`;

```js
import { findEntry } from 'node-package-exports';

const exports = {
  '.': {
    require: './index.cjs',
    development: './index.development.js',
    default: './index.js',
  },
}

findEntry(exports); // ./index.cjs
findEntry(exports, ['development']); // ./index.development.js
findEntry(exports, ['production']); // ./index.js
```


### findPath

```js
import { findPath } from 'node-package-exports';

const exports = {
  './lib/*': {
    require: './src/*.cjs',
    development: './src/*.development.js',
    default: './src/*.js',
  },
}

findPath('./lib/index', exports); // ./src/index.cjs
findPath('./lib/index', exports, ['development']); // ./src/index.development.js
findPath('./lib/index', exports, ['production']); // ./src/index.js
```

Multiple conditions.

```js
import { findPath } from 'node-package-exports';

const exports = {
  './a': {
    node: {
      import: './feature-node.mjs',
      require: './feature-node.cjs',
    },
    default: './feature.default.mjs',
  }
};

findPath('./a', exports); // './feature.default.mjs'
findPath('./a', exports, ['node', 'require']); // './feature-node.cjs'
```


### findPkgData

```js
import { findPkgData } from 'node-package-exports';

const exports = {
  './': './src/util/',
  './timezones/': './data/timezones/',
  './timezones/utc': './data/timezones/utc/index.mjs',
};

const data = findPkgData('@vue/core/timezones/pdt.mjs', exports);
// {
//   name: '@vue/core',
//   version: '',
//   path: './data/timezones/pdt.mjs',
//   resolve: '@vue/core/data/timezones/pdt.mjs',
//   raw: '@vue/core/timezones/pdt.mjs',
// }

// If the module doesn't exist, you should throw an error.
if (!data.path) {
  throw new Error(`Module '${data.raw}' Not Found`);
}
```


### parseModuleId

```js
import { parseModuleId } from 'node-package-exports';

parseModuleId('vue')
// {
//   name: 'vue',
//   path: '',
//   version: '',
//   raw: 'vue',
// }

parseModuleId('vue/');
// {
//   name: 'vue',
//   path: './',
//   version: '',
//   raw: 'vue/',
// }

parseModuleId('@vue/core@v1.0.0/a.js');
// {
//   name: '@vue/core',
//   path: './a.js',
//   version: 'v1.0.0',
//   raw: '@vue/core@v1.0.0/a.js',
// }
```


### Extended usage

When you want to convert to absolute path, you can handle it like this.

```js
import { findPkgData } from 'node-package-exports';

const data = findPkgData('vue/src/index.js', { ... })
// NodeJs
const resolvePath = path.resolve(pkgDir, data.path);
// Browser
const resolveUrl = new URL(data.path, pkgDir).href;
```


### CDN

```html
<!DOCTYPE html>
<html lang='en'>
<body>
  <script src='https://unpkg.com/node-package-exports/dist/entry.umd.js'></script>
  <script>
    const { findPath, findEntry, findPkgData, parseModuleId } = NodePackageExports;
    // ...
  </script>
</body>
</html>
```


## TODO

[Support imports Field](https://github.com/jkrems/proposal-pkg-exports#3-imports-field)
