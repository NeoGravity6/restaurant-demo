import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel serves the app from the domain root; GitHub Pages needs the
  // repo-name subpath. Vercel sets the VERCEL env var during its build.
  base: process.env.VERCEL ? '/' : '/restaurant-demo/',
})
