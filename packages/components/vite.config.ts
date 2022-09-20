import { resolve } from 'path'
import { defineConfig } from 'vite'
import esbuild from 'rollup-plugin-esbuild'
import { isVue3 } from 'vue-demi'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index'
    },
    rollupOptions: {
      plugins: [esbuild()],
      external: [
        'vue',
        'vue-demi',
        '@floating-ui/core',
        '@visoning/vue-floating-core',
        '@visoning/vue-floating-core/components',
        '@visoning/vue-floating-interactions',
        '@visoning/vue-utility'
      ]
    }
  },
  plugins: [...(isVue3 ? [vue(), vueJsx()] : [vue2(), vue2Jsx()])]
})
