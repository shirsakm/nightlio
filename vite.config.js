import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.VITE_API_URL) || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@codesandbox')) {
              return 'codesandbox-vendor';
            }
            if (id.includes('@codemirror') || id.includes('@lezer')) {
              return 'codemirror-vendor';
            }
            if (id.includes('@lexical')) {
              return 'lexical-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('@mdxeditor')) {
              return 'mdx-editor';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('prismjs') || id.includes('prism')) {
              return 'prism-vendor';
            }
            if (id.includes('lodash')) {
              return 'lodash-vendor';
            }
            if (id.includes('markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified')) {
              return 'markdown-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
