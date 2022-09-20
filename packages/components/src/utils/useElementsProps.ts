import { computed, unref } from 'vue-demi'
import type {
  ElementProps,
  MaybeRef
} from '@visoning/vue-floating-interactions'
import { mergeProps } from '@visoning/vue-utility'

export function useElementProps(...args: MaybeRef<ElementProps>[]) {
  return computed(() => {
    const elementProps: ElementProps = {}

    for (let i = 0; i < args.length; i++) {
      const props = unref(args[i])

      elementProps.floating = mergeProps(elementProps.floating, props.floating)
      elementProps.reference = mergeProps(
        elementProps.reference,
        props.reference
      )
    }

    return elementProps
  })
}
