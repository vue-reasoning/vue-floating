import { computed, Ref, unref, watch } from 'vue-demi'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { makeInteractionInfoFactory } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'

export interface UseFocusOptions {
  /**
   * Conditionally enable/disable the hook.
   *
   * @default false
   */
  disabled?: boolean

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
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))

  let triggerEvent: FocusInteractionInfo['event']

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => optionsRef.value.delay),
    {
      open: () => context.setOpen(true, makeFocusInfo(triggerEvent)),
      close: () => context.setOpen(false, makeFocusInfo(triggerEvent))
    }
  )

  const triggerInContainers = (event: FocusEvent) => {
    const { floating, reference } = context.refs
    return [floating.value, reference.value].some(
      (container) =>
        container && contains(container as HTMLElement, [event.relatedTarget as Element])
    )
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

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
  })

  const elementProps = {
    reference: {
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    floating: {
      onFocus: handleFloatingFocus,
      onBlur: handleFloatingBlur
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
