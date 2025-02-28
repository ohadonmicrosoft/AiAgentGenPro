import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      // Bundle size analyzer (generates stats.html)
      mode === 'analyze' &&
        visualizer({
          open: true,
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Chunk strategy
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-table',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
            ],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          },
        },
      },
      // Minification options
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    server: {
      port: parseInt(env.CLIENT_PORT || '3000'),
      proxy: {
        '/api': {
          target: `http://localhost:${env.SERVER_PORT || 5000}`,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'firebase/app',
        'firebase/auth',
      ],
    },
  };
});