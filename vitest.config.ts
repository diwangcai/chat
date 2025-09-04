import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    testTimeout: 10000,
    include: ['tests/unit/**/*.{test,spec}.{js,ts,tsx}', 'tests/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: [
      'tests/e2e/**/*',
      'scripts/**/*',
      'features/**/__tests__/**/*',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/**/*.{js,ts,tsx}',
        'components/**/*.{js,ts,tsx}',
        'hooks/**/*.{js,ts,tsx}',
        'lib/**/*.{js,ts,tsx}',
        'utils/**/*.{js,ts,tsx}'
      ],
      exclude: [
        'app/api/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        'tests/**',
        'scripts/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  optimizeDeps: {
    include: ['date-fns', 'date-fns/locale']
  },
  define: {
    // 企业级解决方案：预定义全局变量避免动态导入
    'process.env.NODE_ENV': '"test"'
  },
  esbuild: {
    jsx: 'automatic'
  },
})
