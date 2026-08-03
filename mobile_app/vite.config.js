import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    'process.env': {},
    global: 'window',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    port: 3000,
    host: true
  },
});
