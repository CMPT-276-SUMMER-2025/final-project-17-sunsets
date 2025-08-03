import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
  preview: {
    port: process.env.PORT,
    host: true,
    allowedHosts: ['metropolive.onrender.com']
})
