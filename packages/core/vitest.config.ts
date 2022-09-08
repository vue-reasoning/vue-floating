import { defineConfig } from 'vitest/config'
import { isVue3 } from 'vue-demi'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue2 from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'

export default defineConfig({
  plugins: isVue3 ? [vue(), vueJsx()] : [vue2(), vue2Jsx()],
  test: {
    globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/.[tj]sx$/]
    }
  }
})
