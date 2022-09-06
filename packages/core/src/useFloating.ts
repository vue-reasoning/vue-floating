import { computed, ref, unref } from 'vue'
import { computePosition } from '@floating-ui/dom'

import type {
  MaybeReferenceRef,
  MaybeFloatingRef,
  MaybeRef,
  UseFloatingProps,
  UseFloatingReturn,
  UseFloatingData
} from './types'
import { useQualifiedRefs } from './utils/useQualifiedRefs'
import { useCompareFloatingProps } from './utils/useCompareFloatingProps'

export function useFloating(
  referenceRef: MaybeReferenceRef,
  floatingRef: MaybeFloatingRef,
  props?: MaybeRef<UseFloatingProps>
): UseFloatingReturn {
  const propsRef = computed(() => {
    const userProps = unref(props) || {}
    return {
      ...userProps,
      strategy: userProps.strategy || 'absolute',
      placement: userProps.placement || 'bottom',
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
    const reference = unref(referenceRef)
    const floating = unref(floatingRef)
    if (reference && floating) {
      const { value: props } = propsRef
      computePosition(reference, floating, props).then((data) => {
        dataRef.value = data
        props.onUpdate && props.onUpdate(data)
      })
    }
  }

  const { pause: pauseWatchProps, resume: watchProps } = useCompareFloatingProps(propsRef, update)

  const stopWatchElements = useQualifiedRefs(
    [referenceRef, floatingRef],
    (qualifys) => {
      if (qualifys) {
        update()
        watchProps()
      } else {
        pauseWatchProps()
      }
    },
    { immediate: true }
  )

  return {
    data: dataRef,
    update,
    stop: () => {
      stopWatchElements()
      pauseWatchProps()
    }
  }
}
