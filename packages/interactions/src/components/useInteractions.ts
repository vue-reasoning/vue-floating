import { computed, unref } from 'vue-demi'
import { isString, mergeProps } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

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
  props?: MaybeRef<UseInteractionsProps>
) {
  const propsRef = computed<UseInteractionsProps>(() => unref(props) || {})

  const hasInteraction = (interaction: Interaction) => {
    const { interactions } = propsRef.value
    if (!interactions || typeof interactions === 'bigint') {
      return false
    }
    return isString(interactions)
      ? interactions === interaction
      : interactions.includes(interaction)
  }

  const hoverElementProps = useHover(
    context,
    computed(() => {
      const { value: props } = propsRef
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
      const { value: props } = propsRef
      return {
        disabled: props.disabled || !hasInteraction('click'),
        delay: props.clickDelay ?? props.delay,
        inactiveWhenClickOutside: !!props.inactiveWhenClickOutside
      }
    })
  )

  const focusElementProps = useFocus(
    context,
    computed(() => {
      const { value: props } = propsRef
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
      propsRef.value.customInteractions?.map((interaction) =>
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
