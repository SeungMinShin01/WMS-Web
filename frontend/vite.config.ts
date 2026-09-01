import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // /api 로 시작하는 요청만 백엔드로 넘긴다.
    // 브라우저는 5173 한 출처만 보게 되어 CORS가 발생하지 않는다.
    // 배포 시 nginx가 같은 역할을 하므로 개발·배포 구조가 일치한다.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
