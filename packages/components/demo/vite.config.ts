import { resolve } from 'path'
import { defineConfig } from 'vite'
import { isVue3 } from 'vue-demi'
import vue from '@vitejs/plugin-vue'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue-demi',
      '@visoning/vue-floating-core': resolve(__dirname, '../../core/src'),
      '@visoning/vue-floating-interactions': resolve(
        __dirname,
        '../../interactions/src'
      )
    }
  },
  plugins: isVue3 ? [vue()] : [vue2()]
})
