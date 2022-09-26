import { watch } from 'vue-demi'
import type { Ref } from 'vue-demi'
import type { ComputePositionConfig, Middleware } from '@floating-ui/core'
import { useManualEffect } from '@visoning/vue-utility'

export type FloatingOptions = Omit<ComputePositionConfig, 'platform'> & {
  disabled?: boolean
}

export function useFloatingOptionsChange(
  options: Ref<FloatingOptions>,
  onChange: (options: FloatingOptions) => void,
  immediate?: boolean
) {
  let lastOptions: FloatingOptions | null = null

  const updateLastProps = (options: FloatingOptions) => {
    lastOptions = {
      ...options,
      middleware: options.middleware ? [...options.middleware] : []
    }
  }

  const handlePropsChange = (options: FloatingOptions) => {
    if (!lastOptions || !equalFloatingProps(lastOptions, options)) {
      updateLastProps(options)
      onChange(options)
    }
  }

  const { clear: stop, mesure } = useManualEffect(
    () =>
      watch(options, handlePropsChange, {
        immediate: true
      }),
    immediate
  )

  return {
    stop,
    mesure
  }
}

function equalFloatingProps(a: FloatingOptions, b: FloatingOptions) {
  return (
    a.strategy === b.strategy &&
    a.placement === b.placement &&
    !!a.disabled === !!b.disabled &&
    equalMiddlewares(a.middleware, b.middleware)
  )
}

function equalMiddleware(a: Middleware, b: Middleware) {
  return a.name === b.name && a.options === b.options && a.fn === b.fn
}

function equalMiddlewares(a?: Middleware[], b?: Middleware[]) {
  if (!a || !b || a.length !== b.length) {
    return false
  }

  const remainings = [...b]

  let i = -1
  while (++i < a.length) {
    const index = remainings.findIndex((r) => equalMiddleware(a[i], r))
    if (index === -1) {
      return false
    }

    remainings.splice(index, 1)
  }

  return true
}
