import { computed, ref, unref } from 'vue'
import { computePosition } from '@floating-ui/dom'

import type {
  MaybeReferenceRef,
  MaybeFloatingRef,
  MaybeRef,
  UseFloatingProps,
  UseFloatingReturn,
  UseFloatingData
} from '../types'
import { useNonNullableRefs } from './useNonNullableRefs'
import { useFloatingProps } from './useFloatingProps'

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

  const { stop: stopWatchProps, resume: doWatchProps } = useFloatingProps(propsRef, update)

  const stopWatchElements = useNonNullableRefs([reference, floating], {
    handler: () => {
      doWatchProps()
      update()
    },
    dissatisfyHandler: () => {
      stopWatchProps()
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
      stopWatchProps()
    }
  }
}
