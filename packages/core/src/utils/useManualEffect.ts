export type CreateEffect = () => (() => void) | void

export const createEmptyEffect: CreateEffect = () => () => {}

export interface UseManualEffectReturn {
  clear: () => void
  reset: (effect?: () => void) => void
  mesure: () => void
}

export function useManualEffect(
  createEffect?: CreateEffect,
  immediate?: boolean
): UseManualEffectReturn {
  let clearEffect: ReturnType<CreateEffect>

  const clear: UseManualEffectReturn['clear'] = () => {
    if (clearEffect) {
      clearEffect()
      clearEffect = undefined
    }
  }

  const reset: UseManualEffectReturn['reset'] = (newEffect) => {
    clear()
    clearEffect = newEffect || (createEffect && createEffect())
  }

  const mesure: UseManualEffectReturn['mesure'] = () => {
    if (!clearEffect) {
      clearEffect = createEffect && createEffect()
    }
  }

  if (immediate) {
    mesure()
  }

  return {
    clear,
    reset,
    mesure
  }
}
