import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Suppress chunk size warnings (expected for React + MUI apps)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from MUI
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          warning.message.includes('"use client"')
        ) {
          return;
        }
        // Use default warning handler for other warnings
        warn(warning);
      }
    }
  }
})

