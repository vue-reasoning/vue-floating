import { unref } from 'vue-demi'
import { isDef } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

export function useTimeout(time?: MaybeRef<number>, fn?: Function) {
  let timeout: number | null = null
  let startTime: number | null = null
  let delayTime: number | null = null

  const clear = () => {
    if (timeout) {
      window.clearTimeout(timeout)
      timeout = null

      startTime = null
      delayTime = null
    }
  }

  const withoutDelay = (handler?: Function) => handler?.()

  const reset = (overrideTime?: number, overrideFn?: Function) => {
    clear()

    const finalTime = overrideTime ?? unref(time)
    const finalFn = overrideFn || fn

    if (!finalTime || finalTime < 0) {
      withoutDelay(finalFn)
      return
    }

    startTime = Date.now()
    delayTime = finalTime

    timeout = window.setTimeout(() => {
      clear()
      withoutDelay(finalFn)
    }, finalTime)
  }

  const getElapsedTime = () =>
    isDef(startTime) ? Date.now() - startTime : null

  const getRemainingTime = () => {
    const timeElapsed = getElapsedTime()
    return isDef(timeElapsed) && isDef(delayTime)
      ? delayTime - timeElapsed
      : null
  }

  return {
    stop: clear,
    reset,
    getElapsedTime,
    getRemainingTime
  }
}
