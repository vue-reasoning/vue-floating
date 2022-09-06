import { autoUpdate, AutoUpdateOptions } from '@floating-ui/dom'

import type { MaybeReferenceRef, MaybeFloatingRef } from './types'
import { useQualifiedRefs } from './utils/useQualifiedRefs'

export type UseAutoUpdateOptions = AutoUpdateOptions

/**
 * Automatically updates the position of the floating element when necessary.
 * @see https://floating-ui.com/docs/autoUpdate
 */
export function useAutoUpdate(
  reference: MaybeReferenceRef,
  floating: MaybeFloatingRef,
  update: () => void,
  autoUpdateOptions?: UseAutoUpdateOptions
) {
  let cleanup: Function | null = null

  const stopWatchElements = useQualifiedRefs<[MaybeReferenceRef, MaybeFloatingRef]>(
    [reference, floating],
    (qualifys) => {
      if (qualifys) {
        cleanup && cleanup()
        cleanup = autoUpdate(...qualifys, update, autoUpdateOptions)
      }
    },
    { immediate: true }
  )

  return () => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    stopWatchElements()
  }
}
