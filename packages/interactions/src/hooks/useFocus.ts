import { computed, unref, watch } from 'vue-demi'
import type { MaybeRef } from '@visoning/vue-utility'
import { useManualEffect } from '@visoning/vue-utility'

import type {
  ElementProps,
  BaseInteractionInfo,
  InteractionDelay,
  InteractionHookReturn
} from '../types'
import type { InteractionsContext } from '../useInteractionsContext'
import { contains } from '../utils/contains'
import { getWindow } from '../utils/getWindow'

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
): InteractionHookReturn {
  const optionsRef = computed(() => unref(options) || {})

  const delaySetOpen = context.delaySetActiveFactory(
    computed(() => optionsRef.value.delay),
    FocusInteractionType
  )

  const inContainers = (target: Element) => {
    const { value: interactor } = context.interactor
    const { value: targets } = context.targets
    return contains(target, [interactor].concat(targets))
  }

  const handleFocus = (event: FocusEvent) => {
    delaySetOpen(true, {
      event
    })
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
    const win = getWindow(context.interactor.value)
    win.addEventListener('blur', handleBlur)
    return () => win.removeEventListener('blur', handleBlur)
  })

  const cleanupEffect = watch(
    [context.active, () => optionsRef.value.disabled],
    ([active, disabled]) => {
      blurControl.clear()

      if (active && !disabled) {
        blurControl.mesure()
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
      tabIndex: -1
    }
  }

  return {
    cleanupEffect,
    elementProps: computed(() =>
      optionsRef.value.disabled ? {} : elementProps
    )
  }
}
