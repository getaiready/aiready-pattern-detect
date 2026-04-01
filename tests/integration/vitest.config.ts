import { defineConfig } from 'vitest/config';
import { createAireadyVitestAliases } from '../../vitest-aliases';

export default defineConfig({
  test: {
    alias: createAireadyVitestAliases(__dirname, {
      packagesRootRelative: '../../packages',
      useIndexEntrypoints: false,
      includeCli: true,
      includeConsistency: true,
    }),
  },
});
