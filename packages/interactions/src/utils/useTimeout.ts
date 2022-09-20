import { ref, unref } from 'vue-demi'
import type { MaybeRef } from '../types'

export function useTimeout(time?: MaybeRef<number>, handler?: () => void) {
  const delaying = ref(false)

  let timeout: number | null = null

  const stop = () => {
    if (timeout) {
      window.clearTimeout(timeout)
      timeout = null
      delaying.value = false
    }
  }

  const withoutDelay = (handler?: () => void) => {
    if (handler) {
      delaying.value = true
      handler()
      delaying.value = false
    }
  }

  const reset = (_time?: number, _handler?: () => void) => {
    stop()

    const finalTime = _time ?? unref(time)
    const finalHandler = _handler || handler

    if (!finalTime || finalTime < 0) {
      withoutDelay(finalHandler)
      return
    }

    timeout = window.setTimeout(() => {
      stop()
      finalHandler?.()
    }, finalTime)
  }

  return {
    stop,
    reset,
    delaying
  }
}
