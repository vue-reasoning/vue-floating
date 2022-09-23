import { computed, ref, unref, watch } from 'vue-demi'
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
): Readonly<Ref<ElementProps>> {
  const optionsRef = computed(() => unref(options))

  const delaySetOpen = context.delaySetActiveFactory(
    computed(() => optionsRef.value.delay)
  )

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = optionsRef.value
    return (
      !pointerTypes || pointerTypes.includes(pointerType as ClickPointerType)
    )
  }

  const inContainers = (target: Element) => {
    const { value: interactor } = context.interactor
    const { value: targets } = context.targets
    return contains(target, [interactor].concat(targets))
  }

  const handleClickOutside = (event: PointerEvent) => {
    if (!inContainers(event.target as Element)) {
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
    const userControl = optionsRef.value.handleToggle
    const currentActive = context.active.value
    if (!userControl || userControl(event, currentActive)) {
      delaySetOpen(!currentActive, {
        type: ClickInteractionType,
        event
      })
    }
  }

  const blockClickRef = ref(false)

  const handlePointerDown = (event: PointerEvent) => {
    blockClickRef.value = !isAllowPointerEvent(event)
  }

  const handleClick = (event: MouseEvent) => {
    if (!blockClickRef.value) {
      toggle(event)
      blockClickRef.value = true
    }
  }

  const isButton = () =>
    (context.interactor.value as Element)?.tagName === 'Button'

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
    if (isButton()) {
      return
    }

    if (event.key === ' ') {
      toggle(event)
    }
  }

  watch(context.active, (active) => {
    clickOutsideControl.clear()

    const { value: options } = optionsRef

    if (!options.disabled && options.inactiveWhenClickOutside && active) {
      clickOutsideControl.reset()
    }
  })

  const elementProps: ElementProps = {
    interactor: {
      onPointerdown: handlePointerDown,
      onClick: handleClick,
      onKeydown: handleKeyDown,
      onKeyup: handleKeyUp
    },
    target: {
      onClick: handleClickOutside
    }
  }

  return computed(() => (optionsRef.value.disabled ? {} : elementProps))
}
