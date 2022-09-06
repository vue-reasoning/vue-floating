import { computed, unref, watch } from 'vue-demi'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { makeInteractionInfoFactory } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'

export interface UseFocusOptions {
  /**
   * Delay in millisecond.
   * Waits for the specified time when the event listener runs before changing the open state.
   */
  delay?: Delay
}

export const FocusKey = 'focus'

const makeFocusInfo = makeInteractionInfoFactory<FocusInteractionInfo>(FocusKey)

export interface FocusInteractionInfo extends InteractionInfo {
  type: typeof FocusKey
  event: FocusEvent
}

export function useFocus(
  context: InteractionsContext,
  options: MaybeRef<UseFocusOptions> = {}
): ElementProps {
  let triggerEvent: FocusInteractionInfo['event']

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => unref(options).delay),
    {
      open: () => context.setOpen(true, makeFocusInfo(triggerEvent)),
      close: () => context.setOpen(false, makeFocusInfo(triggerEvent))
    }
  )

  watch(context.open, (open) => {
    if (open) {
      closeDelay.clear()
    } else {
      openDelay.clear()
    }
  })

  const triggerInContainers = (event: FocusEvent) => {
    const { floating, reference } = context.refs
    return contains(event.relatedTarget as Element, [floating.value, reference.value])
  }

  const handleFocus = (event: FocusEvent) => {
    closeDelay.clear()

    if (!context.open.value) {
      triggerEvent = event
      openDelay.delay()
    }
  }

  const handleBlur = (event: FocusEvent) => {
    if (triggerInContainers(event)) {
      return
    }
    openDelay.clear()

    if (context.open.value) {
      triggerEvent = event
      openDelay.delay()
    }
  }

  const handleFloatingFocus = () => {
    closeDelay.clear()
  }

  const handleFloatingBlur = (event: FocusEvent) => {
    if (triggerInContainers(event)) {
      return
    }
    triggerEvent = event
    closeDelay.delay()
  }

  return {
    reference: {
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    floating: {
      onFocus: handleFloatingFocus,
      onBlur: handleFloatingBlur
    }
  }
}
