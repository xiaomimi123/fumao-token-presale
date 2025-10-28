import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 配置
  // 仓库名：fumao-token-presale
  // 部署路径：presale-site/blockstranding-presale
  // 最终访问路径：https://xiaomimi123.github.io/fumao-token-presale/presale-site/blockstranding-presale/
  base: '/fumao-token-presale/presale-site/blockstranding-presale/',
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // 排除会干扰 React 的模块
      exclude: ['react', 'react-dom'],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 确保 buffer 正确解析
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    exclude: [
      "same-runtime/dist/jsx-dev-runtime",
      "same-runtime/dist/jsx-runtime",
    ],
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
