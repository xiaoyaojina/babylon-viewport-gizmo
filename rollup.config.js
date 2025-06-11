import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      exports: 'named',
      inlineDynamicImports: true,
      sourcemap: true
    },
    external: [/@babylonjs\/.*/],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve({
        modulesOnly: true,
        mainFields: ['module', 'main']
      }),
      commonjs(),
      terser({
        compress: {
          passes: 2,
          drop_console: true
        }
      })
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.esm.js',
      format: 'es',
      exports: 'named',
      inlineDynamicImports: true,
      sourcemap: true
    },
    external: [/@babylonjs\/.*/],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      resolve({
        modulesOnly: true,
        mainFields: ['module', 'main']
      }),
      commonjs(),
      terser({
        compress: {
          passes: 2,
          drop_console: true
        }
      })
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  }
]; 