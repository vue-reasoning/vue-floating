import { ref, unref } from 'vue-demi'
import type { Ref } from 'vue-demi'

import type { MaybeRef } from '../types'

export interface UseDelayReturn {
  delay: (clean?: boolean) => void
  clear: () => void
  delaying: Ref<boolean>
}

export function useDelay(delay?: MaybeRef<number | undefined>, cb?: Function): UseDelayReturn {
  const delayingRef = ref(false)

  if (!delay) {
    return {
      delay: () => cb?.(),
      clear: () => {},
      delaying: delayingRef
    }
  }

  let timeout: number | null = null

  const clear = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      delayingRef.value = false
    }
  }

  return {
    delay: (clearFirst) => {
      if (clearFirst) {
        clear()
      }

      if (timeout) {
        return
      }

      const delayTime = unref(delay)
      if (!delayTime) {
        cb?.()
        return
      }

      delayingRef.value = true

      timeout = window.setTimeout(() => {
        clear()
        cb?.()
      }, delayTime)
    },
    clear,
    delaying: delayingRef
  }
}
