import { computed, Ref, unref, watch } from 'vue-demi'
import type { MaybeRef } from '@visoning/vue-utility'

import type {
  ElementProps,
  BaseInteractionInfo,
  InteractionDelay
} from '../types'
import type { InteractionsContext } from '../useInteractionsContext'
import { contains } from '../utils/contains'
import { getDocument } from '../utils/getDocument'
import { useManualEffect } from '../utils/useManualEffect'

export interface UseFocusOptions {
  /**
   * Conditionally enable/disable the hook.
   *
   * @default false
   */
  disabled?: boolean

  /**
   * Delay in millisecond.
   */
  delay?: InteractionDelay
}

export const FocusInteractionType = 'focus'

export type FocusInteractionInfo = BaseInteractionInfo<
  typeof FocusInteractionType,
  FocusEvent
>

export function useFocus(
  context: InteractionsContext,
  options?: MaybeRef<UseFocusOptions>
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options) || {})

  const delaySetOpen = context.delaySetActiveFactory(
    computed(() => optionsRef.value.delay),
    FocusInteractionType
  )

  const inContainers = (event: FocusEvent) => {
    const { value: interactor } = context.interactor
    const { value: targets } = context.targets
    return contains(
      event.relatedTarget as HTMLElement,
      [interactor, event.target as HTMLElement].concat(targets)
    )
  }

  const handleFocus = (event: FocusEvent) => {
    delaySetOpen(true, {
      event
    })
  }

  const handleTargetFocus = () => {
    context.stopDelay('inactive')
  }

  const handleBlur = (event: FocusEvent) => {
    if (!inContainers(event)) {
      delaySetOpen(false, {
        event
      })
    }
  }

  const blurControl = useManualEffect(() => {
    const doc = getDocument(context.interactor.value)
    const defaultView = doc.defaultView || window

    defaultView.addEventListener('blur', handleBlur)
    return () => defaultView.removeEventListener('blur', handleBlur)
  })

  watch(
    [context.active, () => optionsRef.value.disabled],
    ([active, disabled]) => {
      blurControl.clear()

      if (active && !disabled) {
        blurControl.reset()
      }
    },
    {
      immediate: true
    }
  )

  const elementProps: ElementProps = {
    interactor: {
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    target: {
      onFocus: handleTargetFocus
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
