import { noop } from './noop'

export type CreateEffect = () => (() => void) | void

export const createEmptyEffect: CreateEffect = () => noop

export interface UseManualEffectReturn {
  clear: () => void
  reset: (effect?: () => void) => void
  hasEffect: () => boolean
}

export function useManualEffect(
  createEffect?: CreateEffect,
  immediate?: boolean
): UseManualEffectReturn {
  let clearEffect: ReturnType<CreateEffect>

  if (immediate && createEffect) {
    clearEffect = createEffect()
  }

  const clear = () => {
    if (clearEffect) {
      clearEffect()
      clearEffect = undefined
    }
  }

  return {
    clear,
    reset: (newEffect) => {
      clear()
      clearEffect = newEffect || (createEffect && createEffect())
    },
    hasEffect: () => !!clearEffect
  }
}
