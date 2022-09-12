import { computed, Ref, ref, unref, watch } from 'vue-demi'
import { useManualEffect } from '@visoning/vue-floating-core'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { getDocument } from '../utils/getDocument'
import { useDelayInteraction } from '../utils/useDelayInteraction'
import { contains } from '../utils/contains'

export const ClickInteractionType = 'click'
export const ClickOutsideInteractionType = 'clickOutside'

export interface ClickInteractionInfo extends InteractionInfo {
  type: typeof ClickInteractionType | typeof ClickOutsideInteractionType
  event: KeyboardEvent | MouseEvent
}

export type ClickPointerType = 'mouse' | 'touch' | 'pen'

export interface UseClickOptions {
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
  pointerTypes?: ClickPointerType[]

  /**
   * Delay in millisecond.
   * Waits for the specified time when the event listener runs before changing the open state.
   */
  delay?: Delay

  /**
   * Whether to close by clicking outside.
   */
  closeWhenClickOutside?: boolean

  /**
   * Callback before reference click, This handler runs on click.
   * We will use the return value of the callback to confirm whether the click should be allowed or not.
   */
  handleToggle?: (event: ClickInteractionInfo['event'], currentOpen: boolean) => boolean
}

export function useClick(
  context: InteractionsContext,
  options: MaybeRef<UseClickOptions> = {}
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))

  const interactionInfo = {
    type: ClickInteractionType
  } as ClickInteractionInfo

  const setInteractionInfo = (
    type: ClickInteractionInfo['type'],
    event: ClickInteractionInfo['event']
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

  const handleClickOutside = (event: PointerEvent) => {
    if (
      isAllowPointerEvent(event) &&
      // to other handlers
      !inContainers(event.target as Element) &&
      context.open.value
    ) {
      setInteractionInfo(ClickOutsideInteractionType, event)
      openDelay.clear()
      closeDelay.delay()
    }
  }

  const clickOutside = useManualEffect(() => {
    const doc = getDocument(context.refs.floating.value)
    doc.addEventListener('pointerdown', handleClickOutside)

    return () => doc.removeEventListener('pointerdown', handleClickOutside)
  })

  const toggle = (event: ClickInteractionInfo['event']) => {
    const userControl = optionsRef.value.handleToggle
    const currentOpen = context.open.value
    if (userControl && !userControl(event, currentOpen)) {
      return
    }

    setInteractionInfo(ClickInteractionType, event)

    if (currentOpen || openDelay.delaying.value) {
      openDelay.clear()
      closeDelay.delay()
    } else {
      closeDelay.clear()
      openDelay.delay()
    }
  }

  const blockClickRef = ref(false)

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = optionsRef.value
    return !pointerTypes || pointerTypes.includes(pointerType as ClickPointerType)
  }

  const handlePointerDown = (event: PointerEvent) => {
    blockClickRef.value = !isAllowPointerEvent(event)
  }

  const handleClick = (event: MouseEvent) => {
    if (blockClickRef.value) {
      return
    }
    toggle(event)
  }

  const isReferenceButton = () => {
    return (context.refs.reference.value as Element)?.tagName === 'Button'
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isReferenceButton()) {
      return
    }

    if (event.key === ' ') {
      // Prvent scrolling
      event.preventDefault()
    }

    if (event.key === 'Enter') {
      toggle(event)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (isReferenceButton()) {
      return
    }

    if (event.key === ' ') {
      toggle(event)
    }
  }

  watch(context.open, (open) => {
    openDelay.clear()
    closeDelay.clear()
    clickOutside.clear()

    if (open && optionsRef.value.closeWhenClickOutside) {
      clickOutside.reset()
    }
  })

  const elementProps = {
    reference: {
      onPointerdown: handlePointerDown,
      onClick: handleClick,
      onKeydown: handleKeyDown,
      onKeyup: handleKeyUp
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
