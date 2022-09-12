import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'

import { PopupProps, PopupSlotProps } from '../popup'
import type { FloatingData } from '../popup'
import { pick } from '../utils/pick'

export interface PopoverExposed {
  floatingData: FloatingData | undefined
  update: () => void
}

export type PopoverArrowSlotProps = PopupSlotProps

export type CreateArrow = (props: PopoverArrowSlotProps) => VNode | null

export const PopoverExtendsPopupProps = {
  ...pick(PopupProps, [
    'placement',
    'strategy',
    'middleware',
    'autoUpdate',
    'open',
    'defaultOpen',
    'disabled',
    'virtualElement',
    'appendTo',
    'interactions',
    'delay',
    'clickDelay',
    'hoverDelay',
    'focusDelay',
    'keepOpenWhenPopupHover',
    'closeWhenClickOutside',
    'autoUpdateOnClosed',
    'offset',
    'shift',
    'flip',
    'autoPlacement',
    'gpuAcceleration',
    'destoryedOnClosed',
    'referenceProps',
    'floatingWrapper',
    'zIndex',
    'onUpdate:open',
    'onOpen',
    'onClose',
    'onFloatingDataUpdate'
  ])
} as const

export const PopoverProps = {
  ...PopoverExtendsPopupProps,

  /**
   * support: string | VNode | slot
   */
  content: [String, Object] as PropType<string | VNode>,

  /**
   * support: string | VNode | slot
   */
  title: [String, Object] as PropType<string | VNode>,

  /**
   * The theme of the popover.
   * @default 'light'
   */
  theme: {
    type: String as PropType<'dark' | 'light'>,
    default: 'light'
  },

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
   * HTML attributes of node.
   */
  arrowProps: Object as PropType<Record<string, any>>,

  /**
   * HTML attributes of node.
   */
  popoverProps: PopupProps.popupProps,

  /**
   * Custom popover node wrapper.
   */
  popoverWrapper: PopupProps.popupWrapper
} as const

export type PopoverProps = ExtractPropTypes<typeof PopoverProps>
