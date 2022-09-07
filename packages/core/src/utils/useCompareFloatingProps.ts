import { watch } from 'vue-demi'
import type { Ref, WatchOptions } from 'vue-demi'
import type { Middleware } from '@floating-ui/dom'

import type { UseFloatingOptions } from '../types'
import { useManualEffect } from './useManualEffect'

export function useCompareFloatingProps(
  props: Ref<UseFloatingOptions>,
  onChange: () => void,
  watchOptions?: WatchOptions
) {
  let lastProps: UseFloatingOptions | null = null

  const updateLastProps = (props: UseFloatingOptions) => {
    lastProps = {
      ...props,
      middleware: props.middleware ? [...props.middleware] : []
    }
  }

  const handlePropsChange = (props: UseFloatingOptions) => {
    if (!lastProps || !equalFloatingProps(lastProps, props)) {
      updateLastProps(props)
      onChange()
    }
  }

  const { clear: pause, reset: mesure } = useManualEffect(() =>
    watch(props, handlePropsChange, watchOptions)
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
