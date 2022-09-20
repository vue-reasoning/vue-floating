import { computed, Ref, unref, watch } from 'vue-demi'
import { useManualEffect } from '@visoning/vue-floating-core'

import type {
  ElementProps,
  InteractionsContext,
  MaybeRef,
  InteractionInfo,
  Delay
} from '../types'
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

  const delaySetOpen = context.delay.createDelaySetOpen(
    computed(() => optionsRef.value.delay),
    {
      type: FocusInteractionType
    }
  )

  const inContainers = (target: Element) => {
    const { floating, reference } = context.refs
    const containers = [floating.value, reference.value]
    return contains(target, containers)
  }

  const handleFocus = (event: FocusEvent) => {
    delaySetOpen(true, {
      event
    })
  }

  const handleFloatingFocus = () => {
    context.delay.stop('close')
  }

  const handleBlur = (event: FocusEvent) => {
    if (inContainers(event.relatedTarget as Element)) {
      return
    }

    delaySetOpen(false, {
      event
    })
  }

  const blurControl = useManualEffect(() => {
    const doc = getDocument(context.refs.floating.value)
    const defaultView = doc.defaultView || window

    defaultView.addEventListener('blur', handleBlur)
    return () => defaultView.removeEventListener('blur', handleBlur)
  })

  watch(
    [context.open, () => optionsRef.value.disabled],
    ([open, disabled]) => {
      blurControl.clear()

      if (open && !disabled) {
        blurControl.reset()
      }
    },
    {
      immediate: true
    }
  )

  const elementProps = {
    reference: {
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    floating: {
      onFocus: handleFloatingFocus
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
