import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // 分离 vendor chunk，利用浏览器缓存（React 不常变，业务代码常变）
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
        },
      },
    },
    // 启用 CSS 压缩
    cssMinify: true,
    // 生产环境移除 console（可选）
    // minify 选项 Vite 默认已用 esbuild 压缩
  },
});