import { autoUpdate, AutoUpdateOptions } from '@floating-ui/dom'

import type { MaybeReferenceRef, MaybeFloatingRef } from '../types'
import { useNonNullableRefs } from './useNonNullableRefs'

/**
 * Automatically updates the position of the floating element when necessary.
 * @see https://floating-ui.com/docs/autoUpdate
 */
export function useAutoUpdate(
  reference: MaybeReferenceRef,
  floating: MaybeFloatingRef,
  update: () => void,
  autoUpdateOptions?: AutoUpdateOptions
) {
  let cleanup: Function | null = null

  useNonNullableRefs<[MaybeReferenceRef, MaybeFloatingRef]>([reference, floating], {
    handler: (reference, floating) => {
      if (cleanup) {
        cleanup()
        cleanup = null
      }

      cleanup = autoUpdate(reference, floating, update, autoUpdateOptions)
    },
    immediate: true
  })

  return () => cleanup && cleanup()
}
