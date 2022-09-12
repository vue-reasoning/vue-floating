import { computed, unref, watch } from 'vue-demi'
import type { Ref } from 'vue-demi'
import { useManualEffect } from '@visoning/vue-floating-core'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'
import { getDocument } from '../utils/getDocument'

export const HoverInteractionType = 'hover'

export interface HoverInteractionInfo extends InteractionInfo {
  type: typeof HoverInteractionType
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
   * Whether to keep the open status on mouse hover
   */
  keepOpenWhenPopupHover?: boolean

  /**
   * Instead of closing the floating element when the cursor leaves its reference,
   * we can leave it open until a certain condition is satisfied.
   *
   * This handler runs on `pointermove`.
   */
  handleLeave?: (event: PointerEvent) => boolean
}

export function useHover(
  context: InteractionsContext,
  options: MaybeRef<UseHoverOptions> = {}
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))

  const interactionInfo = {
    type: HoverInteractionType
  } as HoverInteractionInfo

  const setInteractionInfo = (
    type: HoverInteractionInfo['type'],
    event: HoverInteractionInfo['event']
  ) => {
    interactionInfo.type = type
    interactionInfo.event = event
  }

  const userControl = useManualEffect(() => {
    const doc = getDocument(context.refs.floating.value)
    doc.addEventListener('pointermove', handlePointerMove)

    return () => {
      doc.removeEventListener('pointermove', handlePointerMove)
    }
  })

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => optionsRef.value.delay),
    (open) => context.setOpen(open, interactionInfo)
  )

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = optionsRef.value
    return !pointerTypes || pointerTypes.includes(pointerType as MousePointerType)
  }

  const inContainers = (target: Element) => {
    const { floating, reference } = context.refs
    const containers = optionsRef.value.keepOpenWhenPopupHover
      ? [floating.value, reference.value]
      : [reference.value]
    return contains(target, containers)
  }

  const handlePointerEnter = (event: PointerEvent) => {
    userControl.clear()

    if (!isAllowPointerEvent(event)) {
      return
    }

    closeDelay.clear()

    if (!context.open.value) {
      setInteractionInfo(HoverInteractionType, event)
      openDelay.delay()
    }
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (!isAllowPointerEvent(event) || inContainers(event.relatedTarget as Element)) {
      return
    }

    openDelay.clear()

    if (context.open.value) {
      if (optionsRef.value.handleLeave) {
        userControl.reset()
      } else {
        setInteractionInfo(HoverInteractionType, event)
        closeDelay.delay()
      }
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    const handleLeave = optionsRef.value.handleLeave

    if (!context.open.value || !handleLeave) {
      userControl.clear()
      return
    }

    setInteractionInfo(HoverInteractionType, event)

    if (handleLeave(event)) {
      closeDelay.delay()
    }
  }

  const handleFloatingPointerEnter = (event: PointerEvent) => {
    userControl.clear()

    if (!isAllowPointerEvent(event)) {
      return
    }

    closeDelay.clear()
  }

  const handleFloatingPointerLeave = (event: PointerEvent) => {
    if (!isAllowPointerEvent(event) || inContainers(event.relatedTarget as Element)) {
      return
    }

    setInteractionInfo(HoverInteractionType, event)
    closeDelay.delay()
  }

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
    userControl.clear()
  })

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

  return computed(() => {
    const { value: options } = optionsRef
    if (options.disabled) {
      return {}
    }

    if (!options.keepOpenWhenPopupHover) {
      return {
        reference: elementProps.reference
      }
    }

    return elementProps
  })
}
