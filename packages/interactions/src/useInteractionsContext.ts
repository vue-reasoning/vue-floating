import { computed, readonly, ref, unref } from 'vue-demi'
import type { MaybeFloatingRef, ReferenceType } from '@visoning/vue-floating-core'
import type { InteractionsContext, MaybeRef, InteractionInfo } from './types'

export function useInteractionsContext<RT extends ReferenceType = ReferenceType>(
  referenceRef: MaybeRef<RT | null | undefined>,
  floatingRef: MaybeFloatingRef
): InteractionsContext<RT> {
  const openRef = ref(false)
  const interactionInfoRef = ref<InteractionInfo>({
    type: null,
    event: null
  })

  const setOpen = (open: boolean, info?: InteractionInfo) => {
    if (openRef.value !== open) {
      openRef.value = open
    }

    interactionInfoRef.value.type = info?.type || null
    interactionInfoRef.value.event = info?.event || null
  }

  return {
    open: readonly(openRef),
    setOpen,
    info: interactionInfoRef,
    refs: {
      reference: computed(() => unref(referenceRef)),
      floating: computed(() => unref(floatingRef))
    }
  }
}
