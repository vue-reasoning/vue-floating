export interface UseManualEffectReturn {
  reset: (effect?: Function) => void
  clear: () => void
  hasEffect: () => boolean
}

export function useManualEffect(createEffect?: () => Function): UseManualEffectReturn {
  let effect = createEffect && createEffect()

  const clear = () => {
    if (effect) {
      effect()
      effect = undefined
    }
  }

  return {
    reset: (newEffect) => {
      clear()
      effect = newEffect || (createEffect && createEffect())
    },
    clear,
    hasEffect: () => !!effect
  }
}
