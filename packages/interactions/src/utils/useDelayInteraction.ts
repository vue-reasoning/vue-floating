import type { MaybeRef, Delay } from '../types'
import { getDelay } from '../types'
import { useDelay } from './useDelay'
import type { UseDelayReturn } from './useDelay'

export interface Callbacks {
  open?: () => void
  close?: () => void
}

export type CallbackType = Callbacks | ((value: boolean) => void)

export interface UseDelayInteractionReturn {
  open: UseDelayReturn
  close: UseDelayReturn
}

export function useDelayInteraction(
  delay: MaybeRef<Delay>,
  callback: CallbackType
): UseDelayInteractionReturn {
  const isUnifiedCallback = typeof callback === 'function'

  const open = isUnifiedCallback ? () => callback(true) : callback?.open
  const close = isUnifiedCallback ? () => callback(false) : callback?.close

  return {
    open: useDelay(getDelay('open', delay), open),
    close: useDelay(getDelay('close', delay), close)
  }
}
