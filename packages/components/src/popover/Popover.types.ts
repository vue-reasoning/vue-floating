import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import { PopupProps, PopupSlotProps } from '../popup'

export type Interaction = 'click' | 'hover' | 'focus'

export type PopoverSlotProps = PopupSlotProps

export type CreateArrow = (props: PopoverSlotProps) => VNode | null

export const PopoverOwnProps = {
  /**
   * support: string | VNode | slot
   */
  content: [String, Object] as PropType<string | VNode>,

  /**
   * support: string | VNode | slot
   */
  title: [String, Object] as PropType<string | VNode>,

  /**
   * @see https://cn.vuejs.org/guide/built-ins/transition.html
   */
  transitionProps: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: 'visoning-popover'
  },

  /**
   * Whether to show arrow if set.
   * @default true
   */
  showArrow: {
    type: Boolean,
    default: true
  },

  /**
   * For style uniformity, we will never enable the configuration of arrow middleware,
   * you can customize arrow to make arrow more as expected.
   *
   * support: VNode | slot
   */
  arrow: [Object, Function] as PropType<VNode | null | CreateArrow>,

  /**
   * Whether the arrow is shown in the center of the reference.
   * @default true
   */
  // arrowShowInCenter: {
  //   type: Boolean,
  //   default: true
  // },

  /**
   * HTML attributes of node.
   */
  arrowProps: Object as PropType<Record<string, any>>
} as const

export type PopoverOwnProps = ExtractPropTypes<typeof PopoverOwnProps>

export const PopoverProps = {
  ...PopupProps,
  ...PopoverOwnProps
} as const

export type PopoverProps = ExtractPropTypes<typeof PopoverProps>
