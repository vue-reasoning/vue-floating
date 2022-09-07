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
  autoUpdateOptions?: MaybeRef<UseAutoUpdateOptions>
) {
  const { reset: resetAutoUpdate, clear: clearAutoUpdate } = useManualEffect()

  const { detect: createAutoUpdate, pause: pauseQualifiedDetect } = useQualifiedRefs<
    [MaybeReferenceRef, MaybeFloatingRef]
  >(
    [unref(reference), unref(floating)],
    (qualifys) => {
      if (qualifys) {
        resetAutoUpdate(autoUpdate(...qualifys, update, unref(autoUpdateOptions)))
      }
    },
    {
      immediate: true
    }
  )

  if (isRef(autoUpdateOptions)) {
    watch(autoUpdateOptions, (options) => {
      if (options.disabled === false) {
        pauseQualifiedDetect()
      } else {
        createAutoUpdate()
      }
    })
  }

  return () => {
    pauseQualifiedDetect()
    clearAutoUpdate()
  }
}
