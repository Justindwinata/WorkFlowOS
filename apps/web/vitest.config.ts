import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/*.e2e.{ts,tsx}', 'node_modules'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@config': path.resolve(__dirname, '../../packages/config/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
});