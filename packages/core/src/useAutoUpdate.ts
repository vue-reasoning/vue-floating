import { unref, watch } from 'vue-demi'
import { autoUpdate } from '@floating-ui/dom'
import type { AutoUpdateOptions } from '@floating-ui/dom'
import type { MaybeRef } from '@visoning/vue-utility'
import { useManualEffect } from '@visoning/vue-utility'

import type { MaybeReferenceRef, MaybeFloatingRef } from './types'
import { useQualifiedItems } from './utils/useQualifiedItems'

export type UseAutoUpdateOptions = Partial<AutoUpdateOptions> & {
  /**
   * @default false
   */
  disabled?: boolean
}

/**
 * Automatically updates the position of the floating element when necessary.
 * @see https://floating-ui.com/docs/autoUpdate
 */
export function useAutoUpdate(
  reference: MaybeReferenceRef,
  floating: MaybeFloatingRef,
  update: () => void,
  options?: MaybeRef<UseAutoUpdateOptions>
) {
  const { reset: resetAutoUpdate, clear: clearAutoUpdate } = useManualEffect()

  const { mesure: watchElements, stop: stopWatchElements } = useQualifiedItems<
    [MaybeReferenceRef, MaybeFloatingRef]
  >([reference, floating], (qualifys) => {
    resetAutoUpdate(
      () => qualifys && autoUpdate(...qualifys, update, unref(options))
    )
  })

  const handleOptionsChange = (options: UseAutoUpdateOptions) => {
    if (!options.disabled) {
      watchElements()
    } else {
      stopWatchElements()
    }
  }

  const { clear: stopWatchOptions } = useManualEffect(
    () =>
      watch(() => unref(options!), handleOptionsChange, { immediate: true }),
    true
  )

  return () => {
    stopWatchOptions()
    stopWatchElements()
    clearAutoUpdate()
  }
}
