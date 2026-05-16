/// <reference types="vitest/config" />
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssMinify: 'esbuild'
  },
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.e2e.ts', 'src/**/*.e2e.tsx'],
  }
})
