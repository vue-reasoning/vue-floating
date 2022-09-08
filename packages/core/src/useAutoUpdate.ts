import { isRef, unref, watch } from 'vue-demi'
import { autoUpdate, AutoUpdateOptions } from '@floating-ui/dom'

import type { MaybeReferenceRef, MaybeFloatingRef, MaybeRef } from './types'
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

  const { mesure: watchElements, pause: pauseWatchElements } = useQualifiedRefs<
    [MaybeReferenceRef, MaybeFloatingRef]
  >(
    [unref(reference), unref(floating)],
    (qualifys) => {
      resetAutoUpdate(qualifys && autoUpdate(...qualifys, update, unref(options)))
    },
    {
      immediate: true
    }
  )

  const { reset: watchProps, clear: stopWatchProps } = useManualEffect(() =>
    watch(
      () => unref(options!),
      (options) => {
        if (!!options.disabled) {
          watchElements()
        } else {
          pauseWatchElements()
        }
      }
    )
  )

  if (isRef(options)) {
    watchProps()
  }

  return () => {
    stopWatchProps()
    pauseWatchElements()
    clearAutoUpdate()
  }
}
