import classNames from 'classnames'
import { computed, defineComponent, h, isVue3, ref } from 'vue-demi'
import { Transition } from 'vue'
import { arrow as coreArrow } from '@floating-ui/core'

import { Popup, PopupExposed } from '../popup'
import type { PopupSlotProps } from '../popup'
import { createCompatElement } from '../utils/compat'
import { isEmpty } from '../utils/isEmpty'
import { omit } from '../utils/omit'
import { PopoverOwnProps, PopoverProps, PopoverSlotProps } from './Popover.types'

import './styles/index.scss'

const prefixCls = 'visoning-popover'

export const Popover = defineComponent({
  name: 'Popover',

  props: PopoverProps,

  setup(props, { emit, slots }) {
    const popupExposedRef = ref<PopupExposed>()

    //
    // Arrow ====================================
    //

    const arrowRef = ref<HTMLElement>()

    const getArrowStyle = ({ placement, middlewareData }: PopoverSlotProps) => {
      const top = middlewareData.arrow?.y ?? 0
      const left = middlewareData.arrow?.x ?? 0

      const style: Record<string, any> = {
        '--arrow-top': `${top}px`,
        '--arrow-left': `${left}px`
      }

      // Because another value in the opposite direction to placement is always 0,
      // here we avoid the style override problem
      if (placement.includes('top') || placement.includes('bottom')) {
        style.left = `${left}px`
      } else {
        style.top = `${top}px`
      }

      return style
    }

    const createArrow = (slotProps: PopoverSlotProps) => {
      const customArrow = props.arrow || slots.arrow
      if (customArrow) {
        return typeof customArrow === 'function' ? customArrow(slotProps) : customArrow
      }

      return createCompatElement('div', {
        data: {
          ref: arrowRef,
          class: `${prefixCls}-arrow`,
          style: getArrowStyle(slotProps)
        }
      })
    }

    const middlewareRef = computed(() => {
      const middleware = props.middleware || []

      if (props.showArrow && arrowRef.value) {
        middleware.push(
          coreArrow({
            element: arrowRef.value
          })
        )
      }
      return middleware
    })

    //
    // Transition wrapper ====================================
    //

    const transitionWrapper = (popup: any) => {
      const { transitionProps, popupWrapper: userWrapper } = props

      if (transitionProps) {
        const normalizedProps =
          typeof transitionProps === 'string' ? { name: transitionProps } : transitionProps

        if (isVue3) {
          const rawPopup = popup
          popup = createCompatElement(Transition, {
            data: normalizedProps,
            scopedSlots: {
              default: () => rawPopup
            }
          })
        } else {
          popup = createCompatElement(
            isVue3 ? Transition : 'transition',
            {
              data: normalizedProps
            },
            [popup]
          )
        }
      }

      return typeof userWrapper === 'function' ? userWrapper(popup) : popup
    }

    // render content
    const renderContent = (slotProps: PopupSlotProps) => {
      const { showArrow } = props
      const title = props.title ?? slots.title?.()
      const content = props.content ?? slots.content?.()
      const hasTitle = !isEmpty(title)
      const hasContent = !isEmpty(content)

      return createCompatElement(
        'div',
        {
          data: {
            class: classNames(prefixCls, {
              'with-arrow': showArrow
            }),
            'data-placement': slotProps.placement
          }
        },
        [
          h(
            'div',
            {
              class: `${prefixCls}-content`
            },
            [
              hasTitle
                ? h(
                    'div',
                    {
                      class: `${prefixCls}-title`
                    },
                    [title]
                  )
                : null,
              hasContent ? content : slots.default?.()
            ]
          ),
          showArrow && createArrow(slotProps)
        ]
      )
    }

    return () =>
      createCompatElement(Popup, {
        data: {
          ...omit(props, Object.keys([PopoverOwnProps])),
          ref: popupExposedRef,
          middleware: middlewareRef.value,
          popupWrapper: transitionWrapper,
          'onUpdate:open': (open: boolean) => emit('update:open', open)
        },
        scopedSlots: {
          reference: slots.reference,
          default: renderContent
        }
      })
  }
})
