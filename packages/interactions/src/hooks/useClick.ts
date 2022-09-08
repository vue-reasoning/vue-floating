import { computed, Ref, ref, unref, watch } from 'vue-demi'

import type { ElementProps, InteractionsContext, MaybeRef, InteractionInfo, Delay } from '../types'
import { makeInteractionInfoFactory } from '../types'
import { useDelayInteraction } from '../utils/useDelayInteraction'

export const ClickKey = 'click'

const makeClickInfo = makeInteractionInfoFactory<ClickInteractionInfo>(ClickKey)

export interface ClickInteractionInfo extends InteractionInfo {
  type: typeof ClickKey
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

  let triggerEvent: ClickInteractionInfo['event']

  const { open: openDelay, close: closeDelay } = useDelayInteraction(
    computed(() => optionsRef.value.delay),
    {
      open: () => context.setOpen(true, makeClickInfo(triggerEvent)),
      close: () => context.setOpen(false, makeClickInfo(triggerEvent))
    }
  )

  watch(context.open, () => {
    openDelay.clear()
    closeDelay.clear()
  })

  const toggle = (event: ClickInteractionInfo['event']) => {
    triggerEvent = event

    const userControl = optionsRef.value.handleToggle
    const currentOpen = context.open.value
    if (userControl && !userControl(event, currentOpen)) {
      return
    }

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