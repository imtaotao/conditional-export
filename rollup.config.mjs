import path from 'node:path';
import ts from "typescript";
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from "./package.json" with { type: "json" };

const { dirname: __dirname } = import.meta;

const createOutput = (type, ext = 'js') => {
  const match = pkg[type].match(/(?<=entry\.)(.*)(?=\.)/)[0];
  const entry = match === 'esm-bundler' ? `${match}-${ext}` : match;
  return {
    [entry]: {
      format: match === 'esm-bundler' ? 'es' : match,
      file: path.resolve(__dirname, `dist/entry.${match}.${ext}`),
    }
  }
}

const outputConfigs = {
  ...createOutput('main'),
  ...createOutput('module'),
  ...createOutput('module', 'mjs'),
  ...createOutput('unpkg'),
};

const packageConfigs = Object.keys(outputConfigs).map((format) =>
  createConfig(format, outputConfigs[format]),
);

function createConfig(format, output) {
  let nodePlugins = [];
  const isUmdBuild = /umd/.test(format);
  const input = path.resolve(__dirname, 'src/index.ts')
  const external = isUmdBuild ? [] : Object.keys(pkg.dependencies);

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
      terser(),
      json({
        namedExports: false,
      }),
      typescript({
        clean: true, // no cache
        typescript: ts,
        tsconfig: path.resolve(__dirname, './tsconfig.build.json'),
      }),
      ...nodePlugins,
    ],
  };
}

export default packageConfigs;
