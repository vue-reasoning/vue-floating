import { computed, unref, watch } from 'vue-demi'
import type { Ref } from 'vue-demi'
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

export const HoverInteractionType = 'hover'

export type HoverInteractionInfo = BaseInteractionInfo<
  typeof HoverInteractionType,
  PointerEvent
>

export type MousePointerType = 'mouse' | 'touch' | 'pen'

export interface UseHoverOptions {
  /**
   * Conditionally enable/disable the hook.
   *
   * @default false
   */
  disabled?: boolean

  /**
   * Pointer types that trigger to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: MousePointerType[]

  /**
   * Delay in millisecond.
   */
  delay?: InteractionDelay

  /**
   * Whether to keep the active after the pointer leave interactor and enter target.
   */
  allowPointerEnterTarget?: boolean

  /**
   * Instead of closing the target element when the cursor leaves its interactor,
   * we can leave it open until a certain condition is satisfied.
   *
   * This handler runs on `pointermove`.
   */
  handleMoveExternal?: (event: PointerEvent) => boolean
}

export function useHover(
  context: InteractionsContext,
  options?: MaybeRef<UseHoverOptions>
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options) || {})

  const delaySetOpen = context.delaySetActiveFactory(
    computed(() => optionsRef.value.delay),
    HoverInteractionType
  )

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = optionsRef.value
    return (
      !pointerTypes || pointerTypes.includes(pointerType as MousePointerType)
    )
  }

  const externalControl = useManualEffect(() => {
    const doc = getDocument(context.interactor.value)
    doc.addEventListener('pointermove', handlePointerMoveExternal)
    return () =>
      doc.removeEventListener('pointermove', handlePointerMoveExternal)
  })

  // when the state changes, we clear the control effects
  watch(context.active, () => externalControl.clear())

  const handlePointerMoveExternal = (event: PointerEvent) => {
    if (!isAllowPointerEvent(event)) {
      return
    }

    const { handleMoveExternal } = optionsRef.value

    if (!context.active.value || !handleMoveExternal) {
      externalControl.clear()
      return
    }

    if (!handleMoveExternal(event)) {
      delaySetOpen(false, {
        event
      })
    }
  }

  const inContainers = (target: Element) => {
    const { value: interactor } = context.interactor
    const targets = [interactor]

    if (optionsRef.value.allowPointerEnterTarget) {
      targets.push(...context.targets.value)
    }

    return contains(target, targets)
  }

  const handlePointerEnter = (event: PointerEvent) => {
    externalControl.clear()

    if (isAllowPointerEvent(event)) {
      delaySetOpen(true, {
        event
      })
    }
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (inContainers(event.relatedTarget as Element)) {
      return
    }

    context.stopDelay('active')

    if (context.active.value) {
      if (optionsRef.value.handleMoveExternal) {
        externalControl.reset()
      } else {
        delaySetOpen(false, {
          event
        })
      }
    }
  }

  const handleTargetPointerEnter = (event: PointerEvent) => {
    externalControl.clear()

    if (isAllowPointerEvent(event)) {
      context.stopDelay('inactive')
    }
  }

  const handleTargetPointerLeave = (event: PointerEvent) => {
    if (!inContainers(event.relatedTarget as Element)) {
      delaySetOpen(false, {
        event
      })
    }
  }

  const elementProps: ElementProps = {
    interactor: {
      onPointerenter: handlePointerEnter,
      onPointerleave: handlePointerLeave
    },
    target: {
      onPointerenter: handleTargetPointerEnter,
      onPointerleave: handleTargetPointerLeave
    }
  }

  return computed(() => {
    const { value: options } = optionsRef
    if (options.disabled) {
      return {}
    }

    if (!options.allowPointerEnterTarget) {
      return {
        interactor: elementProps.interactor
      }
    }

    return elementProps
  })
}
