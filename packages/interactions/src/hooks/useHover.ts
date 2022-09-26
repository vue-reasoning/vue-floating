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
import { getDocument } from '../utils/getDocument'

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
): InteractionHookReturn {
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

  const moveExternalControl = useManualEffect(() => {
    const doc = getDocument(context.interactor.value)
    doc.addEventListener('pointermove', handleMoveExternal)
    return () => doc.removeEventListener('pointermove', handleMoveExternal)
  })

  const handleMoveExternal = (event: PointerEvent) => {
    if (!isAllowPointerEvent(event)) {
      return
    }

    const { handleMoveExternal } = optionsRef.value
    if (!handleMoveExternal?.(event)) {
      moveExternalControl.clear()
      delaySetOpen(false, {
        event
      })
    }
  }

  const inContainers = (target: Element) => {
    const { value: interactor } = context.interactor
    const containers = [interactor]

    if (optionsRef.value.allowPointerEnterTarget) {
      containers.push(...context.targets.value)
    }

    return contains(target, containers)
  }

  const handlePointerEnter = (event: PointerEvent) => {
    moveExternalControl.clear()

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
        moveExternalControl.mesure()
      } else {
        delaySetOpen(false, {
          event
        })
      }
    }
  }

  const handleTargetPointerEnter = (event: PointerEvent) => {
    moveExternalControl.clear()

    if (isAllowPointerEvent(event)) {
      context.stopDelay('inactive')
    }
  }

  const handleTargetPointerLeave = (event: PointerEvent) => {
    if (inContainers(event.relatedTarget as Element)) {
      return
    }
    delaySetOpen(false, {
      event
    })
  }

  // when the state changes, we clear the control effects
  const cleanupEffect = watch(context.active, () => moveExternalControl.clear())

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

  return {
    cleanupEffect,
    elementProps: computed(() => {
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
}
