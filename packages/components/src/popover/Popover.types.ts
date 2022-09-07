import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import pick from 'lodash.pick'
import { FloatingComponentProps } from '@visoning/vue-floating-core/components'
import type { Delay } from '@visoning/vue-floating-interactions'

export type Interaction = 'click' | 'hover' | 'focus'

export const PopoverProps = {
  ...pick(FloatingComponentProps, ['placement', 'strategy', 'middleware', 'autoUpdate']),
  open: {
    type: Boolean,
    default: undefined
  },
  defaultOpen: Boolean,
  disabled: Boolean,
  interactions: {
    type: Array as PropType<Interaction[]>,
    default: () => ['hover']
  },
  clickDelay: [Number, Object] as PropType<Delay>,
  hoverDelay: [Number, Object] as PropType<Delay>,
  focusDelay: [Number, Object] as PropType<Delay>,
  autoUpdateOnClosed: {
    type: Boolean,
    default: true
  },
  destoryedOnClosed: Boolean,
  floatingProps: Object as PropType<Record<string, any>>,
  floatingWrapper: Function as PropType<(floating: VNode | null) => VNode>,
  'onUpdate:open': Function as PropType<(shown: boolean) => void>
} as const

export type PopoverProps = ExtractPropTypes<typeof PopoverProps>
