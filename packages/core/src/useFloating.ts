import { computed, Ref, ref, unref } from 'vue-demi'
import { computePosition } from '@floating-ui/dom'
import type { MaybeRef } from '@visoning/vue-utility'

import type { MaybeReferenceRef, MaybeFloatingRef, FloatingData } from './types'
import { useQualifiedItems } from './utils/useQualifiedItems'
import { useFloatingOptionsChange } from './utils/useFloatingOptionsChange'
import type { FloatingOptions } from './utils/useFloatingOptionsChange'

export type UseFloatingOptions = FloatingOptions

export interface FloatingControl {
  /**
   * @see https://floating-ui.com/docs/computePosition#return-value
   */
  data: Readonly<Ref<FloatingData>>
  update: () => void
  stop: () => void
}

/**
 * Uue hooks based on `computePosition`.
 * @see https://floating-ui.com/docs/computePosition
 */
export function useFloating(
  referenceRef: MaybeReferenceRef,
  floatingRef: MaybeFloatingRef,
  options?: MaybeRef<UseFloatingOptions>
): FloatingControl {
  const optionsRef = computed(() => {
    const userOptions = unref(options) || {}
    return {
      ...userOptions,
      strategy: userOptions.strategy || 'absolute',
      placement: userOptions.placement || 'bottom',
      middleware: userOptions.middleware
    }
  })

  const dataRef = ref<FloatingData>({
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
  } = useQualifiedItems(
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
    true
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
