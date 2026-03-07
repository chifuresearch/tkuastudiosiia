import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // 新增這一行，啟動後會自動開啟預設瀏覽器
  }
})
