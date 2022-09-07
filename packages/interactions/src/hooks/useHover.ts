import { computed, unref, watch } from 'vue-demi'
import type { Ref } from 'vue-demi'

import type {
  ElementProps,
  InteractionsContext,
  MaybeRef,
  InteractionInfo,
  FunctionWithArgs,
  Delay
} from '../types'
import { makeInteractionInfoFactory } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'
import { getDocument } from '../utils/getDocument'

export const HoverKey = 'hover'

const makeHoverInfo = makeInteractionInfoFactory<HoverInteractionInfo>(HoverKey)

export interface HoverInteractionInfo extends InteractionInfo {
  type: typeof HoverKey
  event: PointerEvent
}

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
   * Waits for the specified time when the event listener runs before changing the open state.
   */
  delay?: Delay

  /**
   * Instead of closing the floating element when the cursor leaves its reference,
   * we can leave it open until a certain condition is satisfied.
   *
   * This handler runs on `pointermove`.
   */
  handleClose?: (event: PointerEvent) => boolean
}

export function useHover(
  context: InteractionsContext,
  options: MaybeRef<UseHoverOptions> = {}
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))
  const userControlRef = computed(() => optionsRef.value.handleClose)
  const userWantControlRef = computed(() => !!userControlRef.value)

  let triggerEvent: HoverInteractionInfo['event']

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => optionsRef.value.delay),
    {
      open: () => context.setOpen(true, makeHoverInfo(triggerEvent)),
      close: () => context.setOpen(false, makeHoverInfo(triggerEvent))
    }
  )

  const isAllowPointerType = (pointerType: string) => {
    const { pointerTypes } = optionsRef.value
    return !pointerTypes || pointerTypes.includes(pointerType as MousePointerType)
  }

  const triggerInContainers = (event: PointerEvent) => {
    const { floating, reference } = context.refs
    return [floating.value, reference.value].some(
      (container) =>
        container && contains(container as HTMLElement, [event.relatedTarget as Element])
    )
  }

  const shouldAllowPointerAction = (event: PointerEvent, isLeave = false) => {
    return isAllowPointerType(event.pointerType) && (!isLeave || !triggerInContainers(event))
  }

  const handlePointerEnter = (event: PointerEvent) => {
    clearUserControlEffect()
    if (!shouldAllowPointerAction(event)) {
      return
    }

    closeDelay.clear()

    if (!context.open.value) {
      triggerEvent = event
      openDelay.delay()
    }
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (!shouldAllowPointerAction(event, true)) {
      return
    }

    openDelay.clear()

    if (context.open.value) {
      const doClose = () => {
        triggerEvent = event
        closeDelay.delay()
      }

      if (userWantControlRef.value) {
        handleUserControl(doClose)
      } else {
        doClose()
      }
    }
  }

  let userControlEffect: FunctionWithArgs | null = null

  const handleUserControl = (next: FunctionWithArgs) => {
    clearUserControlEffect()

    const handlePointerMove = (event: PointerEvent) => {
      if (!context.open.value || !userWantControlRef.value) {
        clearUserControlEffect()
        return
      }

      if (userControlRef.value!(event)) {
        next()
      }
    }

    const floatingDoc = getDocument(context.refs.floating.value)
    floatingDoc.addEventListener('pointermove', handlePointerMove)

    userControlEffect = () => {
      floatingDoc.removeEventListener('pointermove', handlePointerMove)
    }
  }

  const clearUserControlEffect = () => {
    if (userControlEffect) {
      userControlEffect()
      userControlEffect = null
    }
  }

  const handleFloatingPointerEnter = (event: PointerEvent) => {
    clearUserControlEffect()
    if (!shouldAllowPointerAction(event)) {
      return
    }

    closeDelay.clear()
  }

  const handleFloatingPointerLeave = (event: PointerEvent) => {
    if (!shouldAllowPointerAction(event, true)) {
      return
    }

    triggerEvent = event
    closeDelay.delay()
  }

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
    clearUserControlEffect()
  })

  watch(
    () => optionsRef.value.disabled,
    (disabled) => {
      if (disabled) {
        clearUserControlEffect()
      }
    }
  )

  const elementProps = {
    reference: {
      onPointerenter: handlePointerEnter,
      onPointerleave: handlePointerLeave
    },
    floating: {
      onPointerenter: handleFloatingPointerEnter,
      onPointerleave: handleFloatingPointerLeave
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
