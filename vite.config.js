import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  preview: {
    allowedHosts: ['jjk-domainexpansion-production.up.railway.app'],
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
  }
})