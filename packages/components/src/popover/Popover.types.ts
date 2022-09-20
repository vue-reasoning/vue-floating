import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import type {
  Delay,
  InteractionInfo
} from '@visoning/vue-floating-interactions'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'

import { PopupDefaultProps, PopupProps } from '../popup'
import type { PopupSlotProps, PopupExposed } from '../popup'

export interface PopoverExposed extends PopupExposed {}

export type PopoverArrowSlotProps = PopupSlotProps

export type CreateArrow = (props: PopoverArrowSlotProps) => VNode | null

export type Interaction = 'click' | 'hover' | 'focus'

export const PopupListenerPropsForwarder = createListenerPropsForwarder(
  PopupProps,
  ['onFloatingDataUpdate']
)

export const ExtendsPopupProps = pick(PopupProps, [
  'placement',
  'strategy',
  'middleware',
  'autoUpdate',
  'open',
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
  'referenceProps',
  'popupProps',
  'popupWrapper',
  'floatingWrapper',
  'zIndex'
])

export const PopoverPropsType = {
  ...ExtendsPopupProps,

  ...PopupListenerPropsForwarder.props,

  /**
   * Default open when not manually set.
   */
  defaultOpen: Boolean,

  /**
   * Which actions cause popup shown. enum of 'hover','click','focus'.
   */
  interactions: Array as PropType<Interaction[]>,

  /**
   * Common delay in ms, before popup is open/close.
   */
  delay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on pointer click.
   */
  clickDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on pointer enter/leave.
   */
  hoverDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on focus/blur.
   */
  focusDelay: [Number, Object] as PropType<Delay>,

  /**
   * Whether to keep the popup open on mouse hover
   */
  keepOpenWhenPopupHover: Boolean,

  /**
   * Whether to close by clicking outside.
   * @default true
   */
  closeWhenClickOutside: Boolean,

  /**
   * support: string | () => VNode | slot
   */
  content: [String, Function] as PropType<string | (() => VNode)>,

  /**
   * support: string | () => VNode | slot
   */
  title: [String, Function] as PropType<string | (() => VNode)>,

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
  popoverProps: PopupProps.popupProps,

  /**
   * HTML attributes of popover-content node.
   */
  contentProps: PopupProps.popupProps,

  /**
   * Custom popover node wrapper.
   */
  popoverWrapper: PopupProps.popupWrapper,

  /**
   * Callback on open status changes.
   */
  'onUpdate:open': Function as PropType<
    (open: boolean, info: InteractionInfo) => void
  >,

  /**
   * Callback on popup open.
   */
  onOpen: Function as PropType<(info: InteractionInfo) => void>,

  /**
   * Callback on popup close.
   */
  onClose: Function as PropType<(info: InteractionInfo) => void>
} as const

export const PopoverTransitionName = 'visoning-popover'

export const PopoverDefaultProps = {
  ...PopupDefaultProps,
  // for controlled
  open: undefined,
  interactions: () => ['hover'],
  keepOpenWhenPopupHover: true,
  closeWhenClickOutside: true,
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
