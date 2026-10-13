import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite dev server for the PS Laser Customer Portal (CS3111 Unit II - React).
// Port 5173 is the one whitelisted in the Spring/Node CORS config (services/CONTRACT.md).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
