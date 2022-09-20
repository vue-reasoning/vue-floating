import { computed, unref } from 'vue-demi'

import type { InteractionDelay, InteractionDelayType, MaybeRef } from '../types'

export const getDelay = (
  type: InteractionDelayType,
  delay?: InteractionDelay
) => (typeof delay === 'number' ? delay : delay && delay[type])

export function useInteractionDelay(delay?: MaybeRef<InteractionDelay>) {
  const delayRef = computed(() => unref(delay))
  return {
    open: computed(() => getDelay('open', delayRef.value) || 0),
    close: computed(() => getDelay('close', delayRef.value) || 0)
  }
}
