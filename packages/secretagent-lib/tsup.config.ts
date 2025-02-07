import { defineConfig } from 'tsup';
import { injectDmnoGlobals } from 'dmno/inject-globals';

const injectedDmno = injectDmnoGlobals();

export default defineConfig({
  // Entry points
  entry: ['src/index.ts'],
  dts: true, // Generate .d.ts files
  sourcemap: true, // Generate sourcemaps
  treeshake: true, // Remove unused code
  clean: true, // Clean output directory before building
  outDir: 'dist', // Output directory
  format: ['esm', 'cjs'], // Output format(s)

  // add replacements
  esbuildOptions(options, context) {
    options.define ||= {};
    options.define = {
      ...options.define,
      ...injectedDmno.staticReplacements.dmnoConfig,
    };
  },
});
