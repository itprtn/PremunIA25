import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: mode === 'development' ? {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' localhost:* 192.168.*:* https://wybhtprxiwgzmpmnfceq.supabase.co wss://wybhtprxiwgzmpmnfceq.supabase.co;",
    } : undefined,
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use SWC for faster builds
      jsxRuntime: 'automatic'
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  // Configuration simplifiée pour éviter les conflits
  define: {
    global: 'globalThis',
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'lucide-react',
      'recharts',
      '@supabase/supabase-js'
    ],
    force: true
  },
  // Préchargement des modules
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    // Security: Enable minification and uglyfication in production
    minify: mode === 'production' ? 'terser' : false,
    // Optimiser la taille des chunks
    chunkSizeWarningLimit: 1000,
    // Activer la compression
    reportCompressedSize: false,
    terserOptions: {
      compress: {
        drop_debugger: mode === 'production', // Remove debugger statements
        pure_funcs: mode === 'production' ? ['console.log', 'console.warn'] : [],
      },
      mangle: {
        safari10: true, // Handle Safari 10+ issues
      },
    },
    rollupOptions: {
      // Optimisation du code splitting
      output: {
        // Séparer les vendor chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'icons': ['lucide-react'],
          'charts': ['recharts'],
          'utils': ['clsx', 'tailwind-merge']
        },
        // Obfuscate chunk names in production
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.split('.')[0] || 'chunk'
            : 'chunk';
          return mode === 'production' ? `assets/[hash]-${facadeModuleId.toLowerCase()}.js` : `assets/[name]-[hash].js`;
        },
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (mode === 'production') {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/[hash].css';
            }
            return 'assets/[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
    cssMinify: mode === 'production', // Minify CSS in production
    sourcemap: mode === 'development', // Source maps only in dev
  },
}));
