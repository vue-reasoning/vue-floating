import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'

export default defineConfig({
  root: resolve(__dirname, './demo'),
  resolve: {
    alias: {
      '@visoning/vue-floating-core': resolve(__dirname, '../core/src'),
      '@visoning/vue-floating-interactions': resolve(__dirname, '../interactions/src')
    }
  },
  plugins: [vue2(), vue2Jsx()]
})
