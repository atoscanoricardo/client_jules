/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
// import NuxtVitest from 'vite-plugin-nuxt-test' // Commenting out for now, can add later if truly needed

export default defineConfig({
  plugins: [
    vue(),
    // NuxtVitest(), // Keep commented if not immediately essential for basic setup
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'], // Will create this file later for global setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['tests/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '~': new URL('.', import.meta.url).pathname,
      '@': new URL('.', import.meta.url).pathname,
    }
  }
})
