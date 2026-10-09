import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
// VITE_BASE permite publicar la demo en una subcarpeta (GitHub Pages: /prode-lineup/)
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
