import { watch } from 'vue'
import type { Ref, WatchOptions } from 'vue'
import type { Middleware } from '@floating-ui/dom'

import type { UseFloatingProps } from '../types'

export function useCompareFloatingProps(
  props: Ref<UseFloatingProps>,
  onChange: () => void,
  watchOptions?: WatchOptions
) {
  let lastProps: UseFloatingProps | null = null

  const updateLastProps = (props: UseFloatingProps) => {
    lastProps = {
      ...props,
      middleware: props.middleware ? [...props.middleware] : []
    }
  }

  const handlePropsChange = (props: UseFloatingProps) => {
    if (!lastProps || !equalFloatingProps(lastProps, props)) {
      updateLastProps(props)
      onChange()
    }
  }

  let pause: (() => void) | null = null
  const resume = () => {
    pause = pause || watch(props, handlePropsChange, watchOptions)
  }

  resume()

  return {
    pause: () => {
      if (pause) {
        pause()
        pause = null
      }
    },
    resume
  }
}

function equalFloatingProps(a: UseFloatingProps, b: UseFloatingProps) {
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
