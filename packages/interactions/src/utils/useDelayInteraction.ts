import { computed, ComputedRef, isRef, Ref, unref } from 'vue'
import type { FunctionWithArgs, MaybeRef } from '../types'
import { useDelay, UseDelayReturn } from './useDelay'

export type DelayType = 'open' | 'close'
export type Delay = number | Partial<Record<DelayType, number>> | undefined

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

export interface Callbacks {
  open?: FunctionWithArgs
  close?: FunctionWithArgs
}

export type CallbackType = Callbacks | FunctionWithArgs<[boolean]>

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
