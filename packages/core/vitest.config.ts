import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue2'
import Jsx from '@vitejs/plugin-vue2-jsx'

export default defineConfig({
  plugins: [Vue(), Jsx()],
  test: {
    globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/.[tj]sx$/]
    }
  }
})
