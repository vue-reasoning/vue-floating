import { computed, ref, unref } from 'vue-demi'
import { computePosition } from '@floating-ui/dom'
import type { MaybeRef } from '@visoning/vue-utility'

import type {
  MaybeReferenceRef,
  MaybeFloatingRef,
  UseFloatingOptions,
  UseFloatingReturn,
  UseFloatingData
} from './types'
import { useQualifiedRefs } from './utils/useQualifiedRefs'
import { useFloatingOptionsChange } from './utils/useFloatingOptionsChange'

/**
 * Uue hooks based on `computePosition`.
 * @see https://floating-ui.com/docs/computePosition
 */
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

  const updatePosotion = () => {
    const reference = unref(referenceRef)
    const floating = unref(floatingRef)

    if (reference && floating) {
      computePosition(reference, floating, optionsRef.value).then((data) => {
        dataRef.value = data
      })
    }
  }

  const {
    detect: detectElements,
    mesure: watchElements,
    stop: stopWatchElements
  } = useQualifiedRefs(
    [referenceRef, floatingRef],
    (qualifys) => qualifys && updatePosotion()
  )

  let disabled: boolean = false

  const handleOptionsChange = (options: UseFloatingOptions) => {
    const lastDisabled = disabled
    disabled = !!options.disabled

    // If disabled changes, it means that some watching has been suspended
    if (disabled !== lastDisabled) {
      if (!disabled) {
        detectElements()
        watchElements()
      } else {
        stopWatchElements()
      }
    } else if (!disabled) {
      updatePosotion()
    }
  }

  const { stop: stopWatchProps } = useFloatingOptionsChange(
    optionsRef,
    handleOptionsChange,
    {
      immediate: true
    }
  )

  return {
    data: dataRef,
    update: updatePosotion,
    stop: () => {
      stopWatchProps()
      stopWatchElements()
    }
  }
}
