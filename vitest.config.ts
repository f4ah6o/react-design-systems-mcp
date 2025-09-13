import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: (() => {
      const base = ['node_modules', 'dist'] as string[]
      if (process.env.CI === 'true' && process.env.SKIP_LONG_RUNNING_TESTS === 'true') {
        base.push('tests/e2e/**')
      }
      return base
    })(),
    // Explicit imports from 'vitest' used in tests
    globals: false,
    testTimeout: 30000,
    globalSetup: ['./tests/setup.ts'],
    globalTeardown: ['./tests/teardown.ts'],
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

