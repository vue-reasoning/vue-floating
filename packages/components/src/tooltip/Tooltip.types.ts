import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'

import { FloatingData, PopoverProps } from '../popover'
import type { PopoverArrowSlotProps } from '../popover'
import { pick } from '../utils/pick'

export interface TooltipExposed {
  floatingData: FloatingData | undefined
  update: () => void
}

export type TooltipArrowSlotProps = PopoverArrowSlotProps

export const TooltipExtendsPopoverProps = {
  ...pick(PopoverProps, [
    'placement',
    'strategy',
    'middleware',
    'autoUpdate',
    'open',
    'defaultOpen',
    'disabled',
    'virtualElement',
    'appendTo',
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
    'contentProps',
    'floatingWrapper',
    'zIndex',
    'onUpdate:open',
    'onOpen',
    'onClose',
    'onFloatingDataUpdate'
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
