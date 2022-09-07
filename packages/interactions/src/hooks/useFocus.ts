import { computed, Ref, unref, watch } from 'vue-demi'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { makeInteractionInfoFactory } from '../types'
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
      closeDelay.delay()
    }
  }

  const handleFloatingFocus = () => {
    closeDelay.clear()
  }

  let focusEffect: Function | null = null

  const clearFocusEffect = () => {
    if (focusEffect) {
      focusEffect()
      focusEffect = null
    }
  }

  watch(
    [context.open, () => optionsRef.value.disabled],
    ([open, disabled]) => {
      clearFocusEffect()

      if (open && !disabled) {
        const doc = getDocument(context.refs.floating.value)
        doc.addEventListener('blur', handleBlur)

        focusEffect = () => doc.removeEventListener('blur', handleBlur)
      }
    },
    {
      immediate: true
    }
  )

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
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
