import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from 'path';
// https://vitejs.dev/config/
const pathSrc = path.resolve(__dirname,'src')
export default defineConfig({
  resolve: {
    alias:{
      '@':`${pathSrc}`
    }
  },
  plugins: [uni()],
});
