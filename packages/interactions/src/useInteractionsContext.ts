import { computed, readonly, ref, unref, watch } from 'vue-demi'
import type {
  MaybeFloatingRef,
  ReferenceType
} from '@visoning/vue-floating-core'

import type {
  InteractionsContext,
  MaybeRef,
  InteractionInfo,
  DelayControl,
  InteractionDelayInfo
} from './types'
import { InitialInteractionType, UnkownInteractionType } from './types'
import { useInteractionDelay } from './utils/useInteractionDelay'
import { useTimeout } from './utils/useTimeout'

export function useInteractionsContext<
  RT extends ReferenceType = ReferenceType,
  Info extends InteractionInfo = InteractionInfo
>(
  referenceRef: MaybeRef<RT | null | undefined>,
  floatingRef: MaybeFloatingRef
): InteractionsContext<RT, Info> {
  //
  // Open state control ====================================
  //

  const openRef = ref(false)

  const interactionInfoRef = ref({
    type: InitialInteractionType,
    event: null,
    triggerType: InitialInteractionType,
    triggerEvent: null
  }) as InteractionsContext<RT, Info>['interactionInfo']

  const setOpen: InteractionsContext<RT, Info>['setOpen'] = (open, info) => {
    const { value: interactionInfo } = interactionInfoRef

    const type = info?.type ?? UnkownInteractionType
    const event = info?.event

    if (openRef.value !== open) {
      openRef.value = open
      interactionInfo.type = type
      interactionInfo.event = event
    }

    interactionInfo.triggerType = type
    interactionInfo.triggerEvent = event
  }

  //
  // Delay control ====================================
  //

  const timeoutControl = useTimeout()
  // clear delay set when the open state change
  watch(openRef, () => timeoutControl.stop())

  const delayInfoRef = ref<InteractionDelayInfo<Info['type']> | null>(null)

  const delaySetOpen: DelayControl<Info>['setOpen'] = (delay, open, info) => {
    const { value: delayInfo } = delayInfoRef
    if (!delayInfo || open !== delayInfo.nextOpen || delay < delayInfo.delay) {
      // interrupt slower delay
      delayInfoRef.value = {
        type: info?.type as any,
        delay,
        nextOpen: open
      }

      timeoutControl.reset(delay, () => {
        setOpen(open, info)
        delayInfoRef.value = null
      })
    }
  }

  const stopDelay: DelayControl<Info>['stop'] = (type) => {
    if (
      type === undefined ||
      (type === 'close') === !delayInfoRef.value?.nextOpen
    ) {
      timeoutControl.stop()
    }
  }

  const createDelaySetOpen: DelayControl<Info>['createDelaySetOpen'] = (
    delay,
    info
  ) => {
    const delayRefs = useInteractionDelay(computed(() => unref(delay)))

    return (open, overrideInfo) => {
      const finalInfo = {
        type: UnkownInteractionType,
        ...info,
        ...overrideInfo
      } as Info

      delaySetOpen(
        open ? delayRefs.open.value : delayRefs.close.value,
        open,
        finalInfo
      )
    }
  }

  //
  // Return ====================================
  //

  return {
    open: readonly(openRef),
    setOpen,
    interactionInfo: interactionInfoRef,
    delay: {
      setOpen: delaySetOpen,
      info: delayInfoRef,
      createDelaySetOpen,
      stop: stopDelay
    },
    refs: {
      reference: computed(() => unref(referenceRef)),
      floating: computed(() => unref(floatingRef))
    }
  }
}
