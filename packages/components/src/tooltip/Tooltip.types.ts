import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'

import { PopoverDefaultProps, PopoverExposed, PopoverProps } from '../popover'
import type { PopoverArrowSlotProps } from '../popover'

export interface TooltipExposed extends PopoverExposed {}

export type TooltipArrowSlotProps = PopoverArrowSlotProps

export const PopoverListenerPropsForwarder = createListenerPropsForwarder(
  PopoverProps,
  ['onFloatingDataUpdate', 'onOpen', 'onClose', 'onUpdate:open']
)

export const ExtendsPopoverProps = pick(PopoverProps, [
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
  'size',
  'transitionProps',
  'showArrow',
  'arrow',
  'arrowProps',
  'referenceProps',
  'floatingWrapper',
  'zIndex'
])

export const TooltipPropsType = {
  ...ExtendsPopoverProps,

  ...PopoverListenerPropsForwarder.props,

  /**
   * support: string | VNode | slot
   */
  content: [String, Function] as PropType<string | (() => VNode)>,

  /**
   * align tooltip content. enum of CSS text-align.
   * @default 'start'
   */
  textAlign: String as PropType<
    'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start'
  >,

  /**
   * HTML attributes of node.
   */
  tooltipProps: PopoverProps.popoverProps,

  /**
   * Custom tooltip node wrapper.
   */
  tooltipWrapper: PopoverProps.popoverWrapper
} as const

export const TooltipDefaultProps = {
  ...PopoverDefaultProps,
  textAlign: 'start'
} as const

export const TooltipProps = withDefaultProps(
  TooltipPropsType,
  TooltipDefaultProps
)

export type TooltipProps = ExtractPropTypes<typeof TooltipProps>
