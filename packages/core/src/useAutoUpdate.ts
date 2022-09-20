import { isRef, unref, watch } from 'vue-demi'
import { autoUpdate, AutoUpdateOptions } from '@floating-ui/dom'
import type { MaybeRef } from '@visoning/vue-floating-interactions'

import type { MaybeReferenceRef, MaybeFloatingRef } from './types'
import { useQualifiedRefs } from './utils/useQualifiedRefs'
import { useManualEffect } from './utils/useManualEffect'

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

  const { mesure: watchElements, stop: stopWatchElements } = useQualifiedRefs<
    [MaybeReferenceRef, MaybeFloatingRef]
  >([reference, floating], (qualifys) => {
    resetAutoUpdate(qualifys && autoUpdate(...qualifys, update, unref(options)))
  })

  const handleOptionsChange = (options: UseAutoUpdateOptions) => {
    if (!options.disabled) {
      watchElements()
    } else {
      stopWatchElements()
    }
  }

  const { mesure: watchProps, clear: stopWatchProps } = useManualEffect(
    () => watch(() => unref(options!), handleOptionsChange),
    true
  )

  if (isRef(options)) {
    watchProps()
  }

  return () => {
    stopWatchProps()
    stopWatchElements()
    clearAutoUpdate()
  }
}
