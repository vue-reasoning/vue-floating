import { isVue3, defineComponent, h as createElement, ref } from 'vue-demi'
import {
  pick,
  mergeProps,
  isFunction,
  normalizeListenerKeys
} from '@visoning/vue-utility'

import {
  ExtendsPopoverProps,
  PopoverListenerForwarder,
  TooltipProps
} from './Tooltip.types'
import { Popover } from '../popover'
import type { PopoverExposed } from '../popover'

export const classNames = {
  tooltip: 'visoning-tooltip',
  content: 'visoning-tooltip-content'
}

export const Tooltip = defineComponent({
  name: 'Tooltip',

  inheritAttrs: false,

  props: TooltipProps,

  setup(props, { attrs, slots, expose }) {
    //
    // Exposed ====================================
    //

    const popoverExposedRef = ref<PopoverExposed>()

    const exposed: PopoverExposed = {
      updatePosition: () => popoverExposedRef.value?.updatePosition(),
      getFloatingData: () => popoverExposedRef.value?.getFloatingData(),
      getElements: () => popoverExposedRef.value?.getElements() || {}
    }

    expose(exposed)

    //
    // Render ====================================
    //

    // render content
    const renderContent = () => {
      const contentCreator = props.content ?? slots.content ?? slots.default
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
            [isFunction(contentCreator) ? contentCreator() : contentCreator]
          )
        ]
      )
    }

    return () => {
      const popoverVNodeProps = {
        ref: popoverExposedRef
      }

      const popoverProps = {
        ...pick(props, Object.keys(ExtendsPopoverProps)),
        popoverProps: mergeProps(props.tooltipProps, {
          class: classNames.tooltip
        }),
        popoverWrapper: props.tooltipWrapper
      }

      const popoverListeners = PopoverListenerForwarder.forwards()

      const scopedSlots = {
        reference: slots.reference,
        arrow: slots.arrow,
        content: renderContent
      }

      if (isVue3) {
        return createElement(
          Popover,
          {
            ...attrs,
            ...popoverProps,
            ...popoverListeners,
            ...popoverVNodeProps
          },
          scopedSlots
        )
      } else {
        return createElement(Popover, {
          ...popoverVNodeProps,
          props: popoverProps,
          on: normalizeListenerKeys(popoverListeners),
          attrs,
          scopedSlots
        })
      }
    }
  }
})
