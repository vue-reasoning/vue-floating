import { computed, ref, unref, watch } from 'vue-demi'
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

export const ClickInteractionType = 'click'
export const ClickOutsideInteractionType = 'clickOutsideControl'

type ClickEvent = KeyboardEvent | MouseEvent

export type ClickInteractionInfo = BaseInteractionInfo<
  typeof ClickInteractionType | typeof ClickOutsideInteractionType,
  ClickEvent
>

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
   */
  delay?: InteractionDelay

  /**
   * Whether to close by clicking outside.
   */
  inactiveWhenClickOutside?: boolean

  /**
   * Callback before reference click, This handler runs on click.
   *
   * We will use the return value of the callback to confirm whether the click should be allowed or not.
   */
  handleToggle?: (event: ClickEvent, active: boolean) => boolean
}

export function useClick(
  context: InteractionsContext,
  options: MaybeRef<UseClickOptions> = {}
): InteractionHookReturn {
  const optionsRef = computed(() => unref(options))

  const delaySetOpen = context.delaySetActiveFactory(
    computed(() => optionsRef.value.delay),
    ClickInteractionType
  )

  const isAllowPointerType = (type: string) => {
    const { pointerTypes } = optionsRef.value
    return !pointerTypes || pointerTypes.includes(type as ClickPointerType)
  }

  const handleClickOutside = (event: PointerEvent) => {
    const { value: interactor } = context.interactor
    const { value: targets } = context.targets
    if (!contains(event.target as Element, [interactor].concat(targets))) {
      delaySetOpen(false, {
        type: ClickOutsideInteractionType,
        event
      })
    }
  }

  const clickOutsideControl = useManualEffect(() => {
    const doc = getDocument(context.interactor.value)
    doc.addEventListener('pointerdown', handleClickOutside)
    return () => doc.removeEventListener('pointerdown', handleClickOutside)
  })

  const toggle = (event: ClickEvent) => {
    if (contains(event.target as Element, context.targets.value)) {
      // Can't be inactive by clicking on targets
      return
    }
    // use control
    const currentActive = context.active.value
    const userControl = optionsRef.value.handleToggle
    if (!userControl || userControl(event, currentActive)) {
      delaySetOpen(!currentActive, {
        event
      })
    }
  }

  let pointerDownType: string | null = null

  const handlePointerDown = (event: PointerEvent) => {
    pointerDownType = event.pointerType
  }

  const handleClick = (event: MouseEvent) => {
    if (event.button !== 0) {
      return
    }
    if (!pointerDownType || isAllowPointerType(pointerDownType)) {
      toggle(event)
      pointerDownType = null
    }
  }

  const isButton = () =>
    (context.interactor.value as Element)?.tagName === 'BUTTON'

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isButton()) {
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
    if (pointerDownType) {
      pointerDownType = null
    }

    if (isButton()) {
      return
    }

    if (event.key === ' ') {
      toggle(event)
    }
  }

  const cleanupEffect = watch(
    [
      context.active,
      () =>
        optionsRef.value.disabled || !optionsRef.value.inactiveWhenClickOutside
    ],
    ([active, disabled]) => {
      clickOutsideControl.clear()

      if (active && !disabled) {
        clickOutsideControl.reset()
      }
    },
    {
      immediate: true
    }
  )

  const elementProps: ElementProps = {
    interactor: {
      onPointerdown: handlePointerDown,
      onClick: handleClick,
      onKeydown: handleKeyDown,
      onKeyup: handleKeyUp
    }
  }

  return {
    cleanupEffect,
    elementProps: computed(() =>
      optionsRef.value.disabled ? {} : elementProps
    )
  }
}
