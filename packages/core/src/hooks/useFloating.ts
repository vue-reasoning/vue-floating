import { computed, ref, unref, watch } from 'vue'
import type { WatchStopHandle } from 'vue'
import { computePosition } from '@floating-ui/dom'
import type { Middleware } from '@floating-ui/dom'

import type {
  MaybeReferenceRef,
  MaybeFloatingRef,
  MaybeRef,
  UseFloatingProps,
  UseFloatingReturn,
  UseFloatingData
} from '../types'
import { useNonNullableRefs } from './useNonNullableRefs'

const defaultProps = {
  placement: 'bottom',
  strategy: 'absolute'
} as const

export function useFloating(
  reference: MaybeReferenceRef,
  floating: MaybeFloatingRef,
  props?: MaybeRef<UseFloatingProps>
): UseFloatingReturn {
  const propsRef = computed(() => {
    const userProps = unref(props) || {}
    return {
      ...userProps,
      strategy: userProps.strategy || defaultProps.strategy,
      placement: userProps.placement || defaultProps.placement,
      middleware: userProps.middleware
    }
  })

  const dataRef = ref<UseFloatingData>({
    // Setting these to `null` will allow the consumer to determine if
    // `computePosition()` has run yet
    x: null,
    y: null,
    strategy: propsRef.value.strategy,
    placement: propsRef.value.placement,
    middlewareData: {}
  })

  let lastProps: UseFloatingProps = {}

  const update = () => {
    useNonNullableRefs<[MaybeReferenceRef, MaybeFloatingRef]>([unref(reference), unref(floating)], {
      handler: (reference, floating) => {
        const { value: props } = propsRef

        computePosition(reference, floating, props).then(data => {
          dataRef.value = data

          props.onUpdate && props.onUpdate()
        })
      }
    })
  }

  const onPropsChange = (props: UseFloatingProps) => {
    if (!equalFloatingProps(props, lastProps)) {
      lastProps = {
        ...props,
        middleware: props.middleware
          ? props.middleware.map(middleware => ({ ...middleware }))
          : undefined
      }

      update()
    }
  }

  let stopWatchProps: WatchStopHandle | null = null

  const stopWatchElements = useNonNullableRefs([reference, floating], {
    handler: () => {
      if (!stopWatchProps) {
        stopWatchProps = watch(propsRef, onPropsChange)
      }
      update()
    },
    dissatisfyHandler: () => {
      if (stopWatchProps) {
        stopWatchProps()
        stopWatchProps = null
      }
    },
    immediate: true
  })

  return {
    data: dataRef,
    update,
    stop: () => {
      if (stopWatchElements) {
        stopWatchElements()
      }
      if (stopWatchProps) {
        stopWatchProps()
        stopWatchProps = null
      }
    }
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

export function equalMiddlewares(a?: Middleware[], b?: Middleware[]) {
  if (!a || !b || a.length !== b.length) {
    return false
  }

  const remainings = [...b]

  let i = -1
  while (++i < a.length) {
    const index = remainings.findIndex(r => equalMiddleware(a[i], r))
    if (index === -1) {
      return false
    }

    remainings.splice(index, 1)
  }

  return true
}
