import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ["buffer", "process", "util", "react-router-dom"]
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "src/components"),
      hooks: path.resolve(__dirname, "src/hooks"),
      utils: path.resolve(__dirname, "src/utils"),
      pages: path.resolve(__dirname, "src/pages"),
      theme: path.resolve(__dirname, "src/theme"),
      icons: path.resolve(__dirname, "src/icons"),
      generated: path.resolve(__dirname, "src/generated"),
      process: "process/browser",
      buffer: "buffer",
      util: "util",
    }
  }
})
