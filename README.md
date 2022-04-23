<div align='center'>
<h2>node-package-exports</h2>

[![NPM version](https://img.shields.io/npm/v/node-package-exports.svg?style=flat-square)](https://www.npmjs.com/package/node-package-exports)

</div>

Find entry or path in package.json exports. https://github.com/jkrems/proposal-pkg-exports


### findEntryInExports

Default conditions is `['require']`;

```js
import { findEntryInExports } from 'node-package-exports';

const exports = {
  '.': {
    require: './index.cjs',
    development: './index.development.js',
    default: './index.js',
  },
}

findEntryInExports(exports); // ./index.cjs
findEntryInExports(exports, ['development']); // ./index.development.js
findEntryInExports(exports, ['production']); // ./index.js
```


### findPathInExports

```js
import { findPathInExports } from 'node-package-exports';

const exports = {
  './lib/*': {
    require: './src/*.cjs',
    development: './src/*.development.js',
    default: './src/*.js',
  },
}

findPathInExports('./lib/index', exports); // ./src/index.cjs
findPathInExports('./lib/index', exports, ['development']); // ./src/index.development.js
findPathInExports('./lib/index', exports, ['production']); // ./src/index.js
```

Multiple conditions.

```js
import { findPathInExports } from 'node-package-exports';

const exports = {
  './a': {
    node: {
      import: './feature-node.mjs',
      require: './feature-node.cjs',
    },
    default: './feature.default.mjs',
  }
};

findPathInExports('./a', exports); // './feature.default.mjs'
findPathInExports('./a', exports, ['node', 'require']); // './feature-node.cjs'
```


### findPkgData

```js
import { findPkgData } from 'node-package-exports';

const exports = {
  './': './src/util/',
  './timezones/': './data/timezones/',
  './timezones/utc': './data/timezones/utc/index.mjs',
}

const data = findPkgData('@vue/core/timezones/pdt.mjs', exports);
// {
//   name: '@vue/core',
//   version: '',
//   path: './data/timezones/pdt.mjs',
//   resolve: '@vue/core/data/timezones/pdt.mjs',
//   raw: '@vue/core/timezones/pdt.mjs',
// }
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

const data = findPkgData('vue/src/index.js', exports, ['require', ...]);

if (data.path !== null) {
  const resolvePath = isNodeEnv
    ? path.resolve(pkgDir, data.path) // NodeJs
    : new URL(data.path, pkgDir).href; // Browser
} else {
  // If the module doesn't exist, you should throw an error.
  throw new Error(`Module '${data.raw}' Not Found`);
}
```


### CDN

```html
<!DOCTYPE html>
<html lang='en'>
<body>
  <script src='https://unpkg.com/node-package-exports/dist/entry.umd.js'></script>
  <script>
    const {
      findPkgData,
      findPathInExports,
      findEntryInExports,
      parseModuleId,
    } = NodePackageExports;
    
    // ...
  </script>
</body>
</html>
```


### TODO

[Support imports Field](https://github.com/jkrems/proposal-pkg-exports#3-imports-field)
