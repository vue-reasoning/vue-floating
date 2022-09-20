import { defineComponent, h as createElement, ref } from 'vue-demi'
import { isDef, pick, mergeProps } from '@visoning/vue-utility'

import {
  ExtendsPopoverProps,
  PopoverListenerPropsForwarder,
  TooltipProps
} from './Tooltip.types'
import { Popover, PopoverProps } from '../popover'
import type { PopoverExposed } from '../popover'
import { createCompatElement } from '../utils/compat'

const classNames = {
  tooltip: 'visoning-tooltip',
  content: 'visoning-tooltip-content'
}

export const Tooltip = defineComponent({
  name: 'Tooltip',

  inheritAttrs: false,

  props: TooltipProps,

  setup(props, { attrs, slots }) {
    //
    // Exposed ====================================
    //

    const popoverExposedRef = ref<PopoverExposed>()

    //
    // Render ====================================
    //

    // render content
    const renderContent = () => {
      const content = props.content ?? slots.content
      const contentNode = typeof content === 'function' ? content() : content

      return createElement(
        'div',
        {
          style: {
            textAlign: props.textAlign
          }
        },
        [
          createElement(
            'span',
            {
              class: classNames.content
            },
            [isDef(contentNode) ? contentNode : slots.default?.()]
          )
        ]
      )
    }

    const PopoverPropsKeys = Object.keys(PopoverProps)
    const ExtendsPopoverPropsKeys = Object.keys(ExtendsPopoverProps)

    return () => {
      const popoverProps = {
        ...pick(props, ExtendsPopoverPropsKeys),
        ...PopoverListenerPropsForwarder.forwards,
        theme: 'dark',
        interactions: ['hover'],
        referenceProps: mergeProps(
          // TODO
          attrs,
          props.reference
        ),
        popoverProps: mergeProps(props.tooltipProps, {
          class: classNames.tooltip
        }),
        popoverWrapper: props.tooltipWrapper
      }

      return createCompatElement(Popover, {
        data: {
          ...popoverProps,
          ref: popoverExposedRef
        },
        scopedSlots: {
          reference: slots.reference,
          arrow: slots.arrow,
          content: renderContent
        },
        propKeys: PopoverPropsKeys
      })
    }
  }
})
