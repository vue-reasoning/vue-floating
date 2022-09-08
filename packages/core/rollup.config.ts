import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import type { RollupOptions } from 'rollup'

const esbuildPlugin = esbuild()

const dtsPlugin = dts()

const externals = ['vue-demi', 'vue', '@floating-ui/dom']

function createConfig({ name }: { name: string }): RollupOptions | RollupOptions[] {
  return [
    {
      input: `src/${name}.ts`,
      output: [
        {
          file: `dist/${name}.mjs`,
          format: 'esm',
          exports: 'named'
        },
        {
          file: `dist/${name}.js`,
          format: 'cjs',
          exports: 'named'
        }
      ],
      plugins: [esbuildPlugin],
      external: [...externals, ...(name.includes('/') ? ['..'] : [])]
    },
    {
      input: `src/${name}.ts`,
      output: [
        {
          file: `dist/${name}.d.ts`,
          format: 'es',
          exports: 'named'
        }
      ],
      plugins: [dtsPlugin],
      external: [...externals, ...(name.includes('/') ? ['..'] : [])]
    }
  ]
}

const configs: RollupOptions[] = ['index', 'components/index']
  .map((name) => createConfig({ name }))
  .flat()

export default configs
