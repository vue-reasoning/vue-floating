import { computed, ref, unref, watch } from 'vue-demi'
import type { Ref } from 'vue-demi'
import { isString, isUndef } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

import { useTimeout } from './utils/useTimeout'
import type {
  ActiveInfo,
  BaseDelayInfo,
  BaseInteractionInfo,
  Delay,
  DelayInfo,
  InteractionDelay,
  InteractionDelayType,
  InteractorType
} from './types'

export interface InteractionsContext<T extends string = string, U = Event> {
  interactor: Readonly<Ref<InteractorType>>
  targets: Readonly<Ref<HTMLElement[]>>

  // active control
  active: Readonly<Ref<boolean>>
  setActive: (value: boolean, info?: BaseInteractionInfo<T, U>) => void
  activeInfo: Readonly<Ref<ActiveInfo<T, U>>>

  // delay control
  delaySetActive: (
    value: boolean,
    delay?: Delay,
    info?: BaseInteractionInfo<T, U>
  ) => void
  delayInfo: Readonly<Ref<DelayInfo<T, U>>>
  stopDelay: (type?: InteractionDelayType) => void
  delaySetActiveFactory: (
    delay?: MaybeRef<InteractionDelay>,
    defaultInfo?: T | Partial<Omit<BaseDelayInfo<T, U>, 'value' | 'delay'>>
  ) => (value: boolean, info?: Partial<BaseDelayInfo<T, U>>) => void
}

export interface UseInteractionsContextOptions {
  targets?: HTMLElement[]
}

export function useInteractionsContext<T extends string = string, U = Event>(
  interactor?: MaybeRef<InteractorType>,
  options?: MaybeRef<UseInteractionsContextOptions>
): InteractionsContext<T, U> {
  type R = InteractionsContext<T, U>

  //
  // Active control ====================================
  //

  const activeRef = ref(false)
  const activeInfoRef = ref({}) as R['activeInfo']

  const setActive: R['setActive'] = (value, info) => {
    info = info ? { ...info } : info

    const { value: activeInfo } = activeInfoRef

    if (activeRef.value !== value) {
      activeRef.value = value
      activeInfo.final = info
    }

    activeInfo.lastTry = info
  }

  //
  // Delay control ====================================
  //

  const delayControl = useTimeout()

  // clear delay set when the open state change
  watch(activeRef, () => delayControl.stop())

  const delayInfoRef = ref({}) as R['delayInfo']

  const isLessDelay = (delay = -Infinity) => {
    const remainingTime = delayControl.getRemainingTime()
    return remainingTime === null || delay <= remainingTime
  }

  const delaySetActive: R['delaySetActive'] = (value, delay, info) => {
    const newDelayInfo = {
      ...info,
      value,
      delay
    } as BaseDelayInfo<T, U>

    const { value: delayInfo } = delayInfoRef
    // We reset the delayer When one of the following conditions is met:
    // 1. no delay
    // 2. less latency currently
    // 3. the set value is different
    if (
      !delayInfo ||
      isLessDelay(delay) ||
      value !== delayInfo.lastTry?.value
    ) {
      delayControl.reset(delay, () => setActive(value, info))
      delayInfo.final = newDelayInfo
    }

    delayInfo.lastTry = newDelayInfo
  }

  const stopDelay: R['stopDelay'] = (type) => {
    if (
      isUndef(type) ||
      (type === 'active') === delayInfoRef.value.final?.value
    ) {
      delayControl.stop()
    }
  }

  const delaySetActiveFactory: R['delaySetActiveFactory'] = (delay, info) => {
    const defaultInfo = isString(info)
      ? {
          type: info
        }
      : info

    const getDelay = (value: boolean) => {
      const unrefDelay = unref(delay)

      if (!unrefDelay || typeof unrefDelay === 'number') {
        return unrefDelay
      }

      return value ? unrefDelay.active : unrefDelay.inactive
    }

    return (value, overrideInfo) => {
      delaySetActive(value, getDelay(value), {
        ...defaultInfo,
        ...overrideInfo
      } as any)
    }
  }

  return {
    interactor: computed(() => unref(interactor)),
    targets: computed(() => unref(options)?.targets || []),

    active: activeRef,
    activeInfo: activeInfoRef,
    setActive,

    delayInfo: delayInfoRef,
    delaySetActive,
    stopDelay,
    delaySetActiveFactory
  }
}
