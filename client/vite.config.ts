import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Specify the root directory where index.html is located
    root: path.resolve(__dirname),
    plugins: [
      react(),
      // Bundle size analyzer (generates stats.html)
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "stats.html",
          gzipSize: true,
          brotliSize: true,
        }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Remove direct path alias to allow import map to work in the browser
      },
    },
    build: {
      // Set outDir to match Firebase hosting configuration
      outDir: "../dist/client",
      sourcemap: mode !== "production",
      // Chunk strategy
      rollupOptions: {
        external: [
          // Explicitly mark problematic dependencies as external
          "react-router-dom",
          "sonner",
          "react-intersection-observer",
          // Explicitly mark class-variance-authority as external to use import map
          "class-variance-authority"
        ],
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "ui-vendor": [
              "@tanstack/react-query",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              // Remove from vendor chunk to use import map
            ],
            "firebase-vendor": [
              "firebase/app",
              "firebase/auth",
              "firebase/firestore",
            ],
          },
        },
      },
      // Minification options
      minify: mode === "production" ? "terser" : false,
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
      // Ensure build doesn't fail on warnings
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: parseInt(env.CLIENT_PORT || "3000"),
      proxy: {
        "/api": {
          target: `http://localhost:${env.SERVER_PORT || 5000}`,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "wouter",
        "@tanstack/react-query",
        "firebase/app",
        "firebase/auth",
        // Remove class-variance-authority to use import map
        "react-intersection-observer",
      ],
      // Remove force option for class-variance-authority
    },
  };
});
