import { computed, ref, unref } from 'vue'
import { computePosition } from '@floating-ui/dom'

import type {
  MaybeReferenceRef,
  MaybeFloatingRef,
  MaybeRef,
  UseFloatingOptions,
  UseFloatingReturn,
  UseFloatingData
} from './types'
import { useQualifiedRefs } from './utils/useQualifiedRefs'
import { useCompareFloatingProps } from './utils/useCompareFloatingProps'

export function useFloating(
  referenceRef: MaybeReferenceRef,
  floatingRef: MaybeFloatingRef,
  options?: MaybeRef<UseFloatingOptions>
): UseFloatingReturn {
  const optionsRef = computed(() => {
    const userOptions = unref(options) || {}
    return {
      ...userOptions,
      strategy: userOptions.strategy || 'absolute',
      placement: userOptions.placement || 'bottom',
      middleware: userOptions.middleware
    }
  })

  const dataRef = ref<UseFloatingData>({
    // Setting these to `null` will allow the consumer to determine if
    // `computePosition()` has run yet
    x: null,
    y: null,
    strategy: optionsRef.value.strategy,
    placement: optionsRef.value.placement,
    middlewareData: {}
  })

  const update = () => {
    const reference = unref(referenceRef)
    const floating = unref(floatingRef)
    if (reference && floating) {
      const { value: options } = optionsRef
      computePosition(reference, floating, options).then((data) => {
        dataRef.value = data
        options.onUpdate && options.onUpdate(data)
      })
    }
  }

  const { pause: pauseWatchProps, resume: watchProps } = useCompareFloatingProps(optionsRef, update)

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
