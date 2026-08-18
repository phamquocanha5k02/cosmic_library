import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Chuyển mọi request /api/* sang backend FastAPI (không cần sửa CORS)
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
