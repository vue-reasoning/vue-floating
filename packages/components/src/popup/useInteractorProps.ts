import { computed } from 'vue-demi'
import type { ComputedRef, ExtractPropTypes } from 'vue-demi'
import { pick, isObject } from '@visoning/vue-utility'
import type {
  InteractionDelay,
  InteractorProps
} from '@visoning/vue-floating-interactions'

import { DelayProps, ExtendsInteractiorProps, PopupProps } from './Popup.types'

export type UseInteractionsPropsProps = Pick<
  PopupProps,
  | 'disabled'
  | 'interactions'
  | 'allowPointerEnterTarget'
  | 'inactiveWhenClickOutside'
  | 'delay'
  | 'hoverDelay'
  | 'clickDelay'
  | 'focusDelay'
>

export function useInteractorProps(
  props: UseInteractionsPropsProps
): ComputedRef<Partial<InteractorProps>> {
  const delayPropsRef = computed(() => {
    const delayProps = pick(props, Object.keys(DelayProps))
    return transformDelayProps(delayProps)
  })

  return computed(() => {
    return {
      ...pick(props, ...Object.keys(ExtendsInteractiorProps), 'disabled'),
      ...delayPropsRef.value
    } as Partial<InteractorProps>
  })
}

function transformDelayProps<T extends ExtractPropTypes<typeof DelayProps>>(
  props: T
): Record<keyof T, InteractionDelay> {
  return Object.keys(props).reduce<any>((ret, prop) => {
    const delay = props[prop as keyof T] as any
    ret[prop] = isObject(delay)
      ? { active: delay.open, inactive: delay.close }
      : delay
    return ret
  }, {})
}
