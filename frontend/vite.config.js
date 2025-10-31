import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
          utils: ['axios', 'socket.io-client'],
          store: ['./src/store/useAuthStore', './src/store/useChatStore'] // Add store chunks
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['js-big-decimal'] // Exclude if not needed
  },
  css: {
    devSourcemap: false, // Disable in development for better performance
  }
})