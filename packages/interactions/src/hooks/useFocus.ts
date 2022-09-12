import { computed, Ref, unref, watch } from 'vue-demi'
import { useManualEffect } from '@visoning/vue-floating-core'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'
import { getDocument } from '../utils/getDocument'

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

export const FocusInteractionType = 'focus'

export interface FocusInteractionInfo extends InteractionInfo {
  type: typeof FocusInteractionType
  event: FocusEvent
}

export function useFocus(
  context: InteractionsContext,
  options: MaybeRef<UseFocusOptions> = {}
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))

  const interactionInfo = {
    type: FocusInteractionType
  } as FocusInteractionInfo

  const setInteractionInfo = (
    type: FocusInteractionInfo['type'],
    event: FocusInteractionInfo['event']
  ) => {
    interactionInfo.type = type
    interactionInfo.event = event
  }

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => optionsRef.value.delay),
    (open) => context.setOpen(open, interactionInfo)
  )

  const inContainers = (target: Element) => {
    const { floating, reference } = context.refs
    const containers = [floating.value, reference.value]
    return contains(target, containers)
  }

  const handleFocus = (event: FocusEvent) => {
    setInteractionInfo(FocusInteractionType, event)

    closeDelay.clear()
    !context.open.value && openDelay.delay()
  }

  const handleFloatingFocus = () => {
    closeDelay.clear()
  }

  const handleBlur = (event: FocusEvent) => {
    if (inContainers(event.relatedTarget as Element)) {
      return
    }

    setInteractionInfo(FocusInteractionType, event)

    openDelay.clear()
    context.open.value && closeDelay.delay()
  }

  const blur = useManualEffect(() => {
    const doc = getDocument(context.refs.floating.value)
    doc.addEventListener('blur', handleBlur)

    return () => doc.removeEventListener('blur', handleBlur)
  })

  watch(
    [context.open, () => optionsRef.value.disabled],
    ([open, disabled]) => {
      blur.clear()

      if (open && !disabled) {
        blur.reset()
      }
    },
    {
      immediate: true
    }
  )

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
    blur.clear()
  })

  const elementProps = {
    reference: {
      onFocus: handleFocus
    },
    floating: {
      onFocus: handleFloatingFocus
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
