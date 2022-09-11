import classNames from 'classnames'
import { defineComponent, h, ref } from 'vue-demi'

import type { PopupExposed } from '../popup'
import { createCompatElement } from '../utils/compat'
import { isEmpty } from '../utils/isEmpty'
import { pick } from '../utils/pick'
import { TooltipExtendsPopoverProps, TooltipProps } from './Tooltip.types'
import { Popover } from '../popover'
import { listenersForward } from '../utils/listenersForward'
import { mergeProps } from '../utils/mergeProps'

// import './styles/index.scss'

const prefixCls = 'visoning-tooltip'

export const Tooltip = defineComponent({
  name: 'Tooltip',

  props: TooltipProps,

  setup(props, { emit, slots }) {
    const popoverExposedRef = ref<PopupExposed>()

    //
    // Arrow ====================================
    //

    // render content
    const renderContent = () => {
      const content = props.content ?? slots.content?.()
      const hasContent = !isEmpty(content)

      return createCompatElement(
        'div',
        {
          data: {
            style: {
              textAlign: props.textAlign
            }
          }
        },
        [
          h(
            'span',
            {
              class: `${prefixCls}-content`
            },
            [hasContent ? content : slots.default?.()]
          )
        ]
      )
    }

    return () => {
      const extendsProps = {
        ...pick(props, Object.keys(TooltipExtendsPopoverProps) as Array<keyof TooltipProps>),
        ...listenersForward(emit, ['onUpdate:open', 'open', 'close'])
      }

      return createCompatElement(Popover, {
        data: {
          ...extendsProps,
          ref: popoverExposedRef,
          interactions: ['hover'],
          popoverProps: mergeProps(props.tooltipProps, {
            class: prefixCls
          }),
          popoverWrapper: props.tooltipWrapper
        },
        scopedSlots: {
          reference: slots.reference,
          content: renderContent
        }
      })
    }
  }
})
