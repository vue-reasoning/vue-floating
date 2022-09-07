import { computed, ComputedRef, isRef, unref } from 'vue-demi'
import type { Ref } from 'vue-demi'

import type { MaybeRef, DelayType, Delay } from '../types'
import { useDelay } from './useDelay'
import type { UseDelayReturn } from './useDelay'

export interface Callbacks {
  open?: Function
  close?: Function
}

export type CallbackType = Callbacks | ((value: boolean) => void)

export interface UseDelayInteractionReturn {
  open: UseDelayReturn
  close: UseDelayReturn
}

export function useDelayInteraction(
  delay?: MaybeRef<Delay>,
  callback?: CallbackType
): UseDelayInteractionReturn {
  const open = typeof callback === 'function' ? () => callback(true) : callback?.open
  const close = typeof callback === 'function' ? () => callback(false) : callback?.close

  return {
    open: useDelay(getDelay('open', delay), open),
    close: useDelay(getDelay('close', delay), close)
  }
}

function getDelay(type: DelayType, delay: Ref<Delay>): ComputedRef<number | undefined>
function getDelay(type: DelayType, delay?: Delay): number | undefined
function getDelay(
  type: DelayType,
  delay?: MaybeRef<Delay>
): ComputedRef<number | undefined> | number | undefined
function getDelay(
  type: DelayType,
  delay?: MaybeRef<Delay>
): ComputedRef<number | undefined> | number | undefined {
  const get = (delay: Delay) => (typeof delay === 'number' ? delay : delay && delay[type])
  return isRef(delay) ? computed(() => get(unref(delay))) : get(delay)
}
