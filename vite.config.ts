import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',  // 监听所有网络接口
    port: 8080,
    strictPort: true,  // 端口被占用时报错而不是换端口
    cors: true  // 允许跨域
  }
})