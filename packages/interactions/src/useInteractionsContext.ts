import { computed, ref, unref, watch } from 'vue-demi'
import type { Ref } from 'vue-demi'
import { isString, isUndef, useTimeout } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

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
  setActive: (active: boolean, info?: BaseInteractionInfo<T, U>) => void
  activeInfo: Readonly<Ref<ActiveInfo<T, U>>>

  // delay control
  delaySetActive: (
    active: boolean,
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
  //
  // Active control ====================================
  //

  const activeRef = ref(false)
  const activeInfoRef = ref({}) as InteractionsContext<T, U>['activeInfo']

  const setActive: InteractionsContext<T, U>['setActive'] = (active, info) => {
    info = info ? { ...info } : info

    if (activeRef.value !== active) {
      activeRef.value = active
      activeInfoRef.value.final = info
    }

    activeInfoRef.value.lastTry = info
  }

  //
  // Delay control ====================================
  //

  const delayControl = useTimeout()
  const delayInfoRef = ref({}) as InteractionsContext<T, U>['delayInfo']

  let delayStartTime: number | null = null

  const allowResetDelay = (active: boolean, delay = -Infinity) => {
    if (!delayStartTime) {
      return true
    }
    const { lastTry } = delayInfoRef.value
    // We reset the delayer When one of the following conditions is met:
    return (
      // 1. no last delay
      !lastTry ||
      !lastTry.delay ||
      // 2. the setting value is different
      active !== lastTry.active ||
      // 3. less latency currently
      delay <= lastTry.delay - (Date.now() - delayStartTime)
    )
  }

  const delaySetActive: InteractionsContext<T, U>['delaySetActive'] = (
    active,
    delay,
    info
  ) => {
    if (active === activeRef.value) {
      // block unnecessary settings
      return
    }

    const lastTryInfo = {
      ...info,
      active,
      delay
    } as BaseDelayInfo<T, U>

    if (allowResetDelay(active, delay)) {
      delayControl.reset(() => setActive(active, info), delay)
      delayStartTime = Date.now()
      delayInfoRef.value.final = lastTryInfo
    }

    delayInfoRef.value.lastTry = lastTryInfo
  }

  const stopDelay: InteractionsContext<T, U>['stopDelay'] = (type) => {
    if (
      isUndef(type) ||
      (type === 'active') === delayInfoRef.value.final?.active
    ) {
      delayControl.clear()
      delayStartTime = null
    }
  }

  const delaySetActiveFactory: InteractionsContext<
    T,
    U
  >['delaySetActiveFactory'] = (delay, info) => {
    const defaultInfo = isString(info)
      ? {
          type: info
        }
      : info

    const getDelay = (active: boolean) => {
      const unrefDelay = unref(delay)
      if (!unrefDelay || typeof unrefDelay === 'number') {
        return unrefDelay
      }
      return active ? unrefDelay.active : unrefDelay.inactive
    }

    return (active, overrideInfo) => {
      delaySetActive(active, getDelay(active), {
        ...defaultInfo,
        ...overrideInfo
      } as BaseDelayInfo<T, U>)
    }
  }

  // clear delay set when the open state change
  watch(activeRef, () => {
    stopDelay()
    delayStartTime = null
  })

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
