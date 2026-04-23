import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    // Client build: uses index.html as entry (default behavior)
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  ssr: {
    noExternal: ['react-router-dom']
  }
});
