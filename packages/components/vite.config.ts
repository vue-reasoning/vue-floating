import { resolve } from 'path'
import { defineConfig } from 'vite'
import esbuild from 'rollup-plugin-esbuild'

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
  }
})
