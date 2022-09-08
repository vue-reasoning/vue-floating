import { watch } from 'vue-demi'
import type { Ref, WatchOptions } from 'vue-demi'
import type { Middleware } from '@floating-ui/dom'

import type { UseFloatingOptions } from '../types'
import { useManualEffect } from './useManualEffect'

export function useFloatingOptionsChange(
  options: Ref<UseFloatingOptions>,
  onChange: () => void,
  watchOptions?: WatchOptions
) {
  let lastOptions: UseFloatingOptions | null = null

  const updateLastProps = (options: UseFloatingOptions) => {
    lastOptions = {
      ...options,
      middleware: options.middleware ? [...options.middleware] : []
    }
  }

  const handlePropsChange = (options: UseFloatingOptions) => {
    if (!lastOptions || !equalFloatingProps(lastOptions, options)) {
      updateLastProps(options)
      onChange()
    }
  }

  const { clear: pause, reset: mesure } = useManualEffect(
    () => watch(options, handlePropsChange, watchOptions),
    true
  )

  return {
    pause,
    mesure
  }
}

function equalFloatingProps(a: UseFloatingOptions, b: UseFloatingOptions) {
  return (
    a.strategy === b.strategy &&
    a.placement === b.placement &&
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
