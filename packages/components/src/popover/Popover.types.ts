import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'
import type { FloatingData } from '@visoning/vue-floating-core'

import { PopupProps } from '../popup'
import type { PopupExposed } from '../popup'

export interface PopoverExposed extends PopupExposed {}

export type PopoverArrowSlotProps = FloatingData

export type CreateArrow = (props: PopoverArrowSlotProps) => VNode | null

export const PopupListenersForwarder = createListenerPropsForwarder(
  PopupProps,
  ['onFloatingDataUpdate', 'onUpdate:open', 'onOpen', 'onClose']
)

export const ExtendsPopupProps = pick(PopupProps, [
  'placement',
  'strategy',
  'middleware',
  'autoUpdate',

  'interactions',
  'delay',
  'hoverDelay',
  'clickDelay',
  'focusDelay',
  'allowPointerEnterTarget',
  'inactiveWhenClickOutside',

  'open',
  'defaultOpen',
  'disabled',
  'virtualElement',
  'appendTo',
  'autoUpdateOnClosed',
  'offset',
  'shift',
  'flip',
  'autoPlacement',
  'gpuAcceleration',
  'destoryedOnClosed',
  'floatingProps',
  'floatingWrapper',
  'zIndex'
])

export const PopoverPropsType = {
  ...ExtendsPopupProps,
  ...PopupListenersForwarder.props,

  /**
   * support: string | () => VNode | slot
   */
  title: [String, Function] as PropType<string | (() => VNode)>,

  /**
   * support: string | () => VNode | slot
   */
  content: [String, Function] as PropType<string | (() => VNode)>,

  /**
   * The theme of the popover.
   * @default 'light'
   */
  theme: String as PropType<'dark' | 'light'>,

  /**
   * The size of the popover.
   * @default 'meduim'
   */
  size: String as PropType<'small' | 'meduim'>,

  /**
   * @see https://cn.vuejs.org/guide/built-ins/transition.html
   */
  transitionProps: [String, Object] as PropType<string | Record<string, any>>,

  /**
   * Whether to show arrow if set.
   * @default true
   */
  showArrow: Boolean,

  /**
   * For style uniformity, we will never enable the configuration of arrow middleware,
   * you can customize arrow to make arrow more as expected.
   *
   * support: CreateArrow | slot
   */
  arrow: Function as PropType<CreateArrow>,

  /**
   * HTML attributes of node.
   */
  arrowProps: Object as PropType<Record<string, any>>,

  /**
   * HTML attributes of popover node.
   */
  popoverProps: Object as PropType<Record<string, any>>,

  /**
   * HTML attributes of popover-content node.
   */
  contentProps: Object as PropType<Record<string, any>>,

  /**
   * Custom popover node wrapper.
   */
  popoverWrapper: Function as PropType<(popup: VNode | null) => VNode>
} as const

export const PopoverTransitionName = 'visoning-popover'

export const PopoverDefaultProps = {
  theme: 'line',
  size: 'meduim',
  transitionProps: PopoverTransitionName,
  showArrow: true
} as const

export const PopoverProps = withDefaultProps(
  PopoverPropsType,
  PopoverDefaultProps
)

export type PopoverProps = ExtractPropTypes<typeof PopoverProps>
