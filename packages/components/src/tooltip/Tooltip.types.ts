import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'

import { FloatingData, PopoverProps } from '../popover'
import type { PopoverArrowSlotProps } from '../popover'
import { pick } from '../utils/pick'
import type { CSSProperties } from 'vue'

export type { CreateArrow } from '../popover'

export const TooltipExtendsPopoverProps = {
  ...pick(PopoverProps, [
    'referenceNode',
    'placement',
    'strategy',
    'middleware',
    'autoUpdate',
    'open',
    'defaultOpen',
    'delay',
    'width',
    'appendTo',
    'offset',
    'shift',
    'flip',
    'autoPlacement',
    'gpuAcceleration',
    'destoryedOnClosed',
    'referenceProps',
    'zIndex',
    'onUpdate:open',
    'onOpen',
    'onClose',
    'theme',
    'transitionProps',
    'showArrow',
    'arrow',
    'arrowProps'
  ])
} as const

export const TooltipProps = {
  ...TooltipExtendsPopoverProps,

  /**
   * support: string | VNode | slot
   */
  content: [String, Object] as PropType<string | VNode>,

  /**
   * align tooltip content. enum of CSS text-align.
   * @default 'start'
   */
  textAlign: {
    type: String as PropType<
      'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start'
    >,
    default: 'start'
  },

  /**
   * HTML attributes of node.
   */
  tooltipProps: PopoverProps.popoverProps,

  /**
   * Custom tooltip node wrapper.
   */
  tooltipWrapper: PopoverProps.popoverWrapper
} as const

export type TooltipProps = ExtractPropTypes<typeof TooltipProps>

export interface TooltipExposed {
  floatingData: FloatingData | undefined
  update: () => void
}

export type TooltipArrowSlotProps = PopoverArrowSlotProps
