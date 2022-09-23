import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'
import type { FloatingData } from '@visoning/vue-floating-core'

import { PopoverProps } from '../popover'
import type { PopoverExposed } from '../popover'

export interface TooltipExposed extends PopoverExposed {}

export type TooltipArrowSlotProps = FloatingData

export const PopoverListenerForwarder = createListenerPropsForwarder(
  PopoverProps,
  ['onFloatingDataUpdate', 'onUpdate:open', 'onOpen', 'onClose']
)

export const ExtendsPopoverProps = pick(PopoverProps, [
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
  'zIndex',

  'content',
  'contentProps'
])

export const TooltipPropsType = {
  ...ExtendsPopoverProps,
  ...PopoverListenerForwarder.props,

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
  tooltipProps: Object as PropType<Record<string, any>>,

  /**
   * Custom tooltip node wrapper.
   */
  tooltipWrapper: Function as PropType<(popup: VNode | null) => VNode>
} as const

export const TooltipDefaultProps = {
  interactions: 'hover',
  theme: 'drak',
  textAlign: 'start'
} as const

export const TooltipProps = withDefaultProps(
  TooltipPropsType,
  TooltipDefaultProps
)

export type TooltipProps = ExtractPropTypes<typeof TooltipProps>
