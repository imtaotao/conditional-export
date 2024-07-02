import path from 'path';
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dependencies } from './package.json';

const outputConfigs = {
  cjs: {
    format: 'cjs',
    file: path.resolve(__dirname, 'dist/entry.cjs.js'),
  },
  'esm-bundler': {
    format: 'es',
    file: path.resolve(__dirname, 'dist/entry.esm-bundler.js'),
  },
  umd: {
    format: 'umd',
    file: path.resolve(__dirname, 'dist/entry.umd.js'),
  },
};

const packageConfigs = Object.keys(outputConfigs).map((format) =>
  createConfig(format, outputConfigs[format]),
);

function createConfig(format, output) {
  let nodePlugins = [];
  const isUmdBuild = /umd/.test(format);
  const input = path.resolve(__dirname, 'src/index.ts')
  const external = isUmdBuild ? [] : Object.keys(dependencies);

  output.externalLiveBindings = true;
  if (isUmdBuild) output.name = 'ConditionalExports';
  
  if (format !== 'cjs') {
    nodePlugins = [
      nodeResolve({ browser: isUmdBuild }),
      commonjs({ sourceMap: false }),
    ];
  }

  return {
    input,
    output,
    external,
    plugins: [
      cleanup(),
      json({
        namedExports: false,
      }),
      typescript({
        clean: true, // no cache
        typescript: require('typescript'),
        tsconfig: path.resolve(__dirname, './tsconfig.json'),
      }),
      ...nodePlugins,
    ],
  };
}

export default packageConfigs;
