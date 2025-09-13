import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/e2e/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    globals: false,
    testTimeout: 30000,
    globalSetup: ['./tests/setup.ts'],
    globalTeardown: ['./tests/teardown.ts'],
    // In CI, allow skipping e2e via env flags if desired
    // We intentionally keep include restricted to e2e here
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/types/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
