import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      filename: "dist/stats.html"
    })
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:2817",
        changeOrigin: true
      }
    }
  },

  build: {
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          markdown: ["react-markdown", "remark-gfm"]
        }
      }
    }
  }
})