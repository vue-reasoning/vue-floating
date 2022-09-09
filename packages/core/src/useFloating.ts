import { computed, ref, unref, watch } from 'vue-demi'
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

  const safeUpdate = () => {
    const reference = unref(referenceRef)
    const floating = unref(floatingRef)
    if (reference && floating) {
      const { value: options } = optionsRef
      computePosition(reference, floating, options).then((data) => {
        dataRef.value = data
      })
    }
  }

  const {
    detect: detectElements,
    mesure: watchElements,
    stop: stopWatchElements
  } = useQualifiedRefs([referenceRef, floatingRef], (qualifys) => qualifys && safeUpdate())

  let disabled: boolean = false
  const handleOptionsChange = (options: UseFloatingOptions) => {
    const lastDisabled = disabled
    disabled = !!options.disabled

    // If disabled changes, it means that some watching has been suspended
    if (disabled !== lastDisabled) {
      if (disabled) {
        stopWatchElements()
      } else {
        detectElements()
        watchElements()
      }
    } else if (!disabled) {
      safeUpdate()
    }
  }

  const { stop: stopWatchProps } = useFloatingOptionsChange(optionsRef, handleOptionsChange, {
    immediate: true
  })

  return {
    data: dataRef,
    update: safeUpdate,
    stop: () => {
      stopWatchProps()
      stopWatchElements()
    }
  }
}
