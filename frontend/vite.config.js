import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Poll for file changes so hot-reload works when the frontend runs inside a
    // Docker container on Windows (host file events don't reach the container).
    watch: { usePolling: true },
  },
})
