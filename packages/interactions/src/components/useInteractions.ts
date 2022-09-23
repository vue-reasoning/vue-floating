import { computed, unref } from 'vue-demi'
import { isString, mergeProps } from '@visoning/vue-utility'

import type { InteractionsContext } from '../useInteractionsContext'
import type { InteractorProps } from './Interactor.types'

import { useClick } from '../hooks/useClick'
import { useFocus } from '../hooks/useFocus'
import { useHover } from '../hooks/useHover'

export type Interaction = 'hover' | 'click' | 'focus'

export interface UseInteractionsProps
  extends Partial<
    Pick<
      InteractorProps,
      | 'interactions'
      | 'customInteractions'
      | 'delay'
      | 'hoverDelay'
      | 'clickDelay'
      | 'focusDelay'
      | 'allowPointerEnterTarget'
      | 'inactiveWhenClickOutside'
    >
  > {
  disabled?: boolean
}

export function useInteractionElementProps(
  context: InteractionsContext,
  props: UseInteractionsProps
) {
  const hasInteraction = (interaction: Interaction) => {
    const { interactions } = props
    if (!interactions || typeof interactions === 'boolean') {
      return false
    }
    return isString(interactions)
      ? interactions === interaction
      : interactions.includes(interaction)
  }

  const hoverElementProps = useHover(
    context,
    computed(() => {
      return {
        disabled: props.disabled || !hasInteraction('hover'),
        delay: props.hoverDelay ?? props.delay,
        allowPointerEnterTarget: props.allowPointerEnterTarget
      }
    })
  )

  const clickElementProps = useClick(
    context,
    computed(() => {
      return {
        disabled: props.disabled || !hasInteraction('click'),
        delay: props.delay,
        inactiveWhenClickOutside: !!props.inactiveWhenClickOutside
      }
    })
  )

  const focusElementProps = useFocus(
    context,
    computed(() => {
      return {
        disabled: props.disabled || !hasInteraction('focus'),
        delay: props.focusDelay ?? props.delay
      }
    })
  )

  const builtInElementProps = [
    hoverElementProps,
    clickElementProps,
    focusElementProps
  ]

  const customElementPropsRef = computed(
    () =>
      props.customInteractions?.map((interaction) =>
        unref(interaction(context))
      ) || []
  )

  return computed(() => {
    const elementProps = [
      ...builtInElementProps,
      ...customElementPropsRef.value
    ]

    return {
      interactor: mergeProps(
        ...elementProps.map((ref) => unref(ref).interactor)
      ),
      target: mergeProps(...elementProps.map((ref) => unref(ref).target))
    }
  })
}
