import {
  isVue3,
  defineComponent,
  computed,
  ref,
  h as createElement
} from 'vue-demi'
import { arrow as coreArrow } from '@floating-ui/dom'
import {
  pick,
  mergeProps,
  isFunction,
  isString,
  normalizeListenerKeys
} from '@visoning/vue-utility'

import { Popup } from '../popup'
import type { PopupSlotProps, PopupExposed } from '../popup'
import { createCompatElement } from '../utils/compat'
import { Transition } from '../utils/vue3.imports'
import {
  ExtendsPopupProps,
  PopupListenersForwarder,
  PopoverProps,
  PopoverTransitionName
} from './Popover.types'
import type { PopoverArrowSlotProps, PopoverExposed } from './Popover.types'

import './styles/index.scss'

export const classNames = {
  popover: 'visoning-popover',
  content: 'visoning-popover-content',
  title: 'visoning-popover-title',
  arrow: 'visoning-popover-arrow',
  dark: 'theme-dark'
}

export const Popover = defineComponent({
  name: 'VisoningPopover',

  inheritAttrs: false,

  props: PopoverProps,

  setup(props, { attrs, expose, slots }) {
    //
    // Arrow ====================================
    //

    const arrowRef = ref<HTMLElement>()

    const getArrowStyle = ({
      placement,
      middlewareData
    }: PopoverArrowSlotProps) => {
      const top = middlewareData.arrow?.y ?? 0
      const left = middlewareData.arrow?.x ?? 0
      const style: Record<string, any> = {
        '--vp-arrow-top': `${top}px`,
        '--vp-arrow-left': `${left}px`
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

    const createArrow = (slotProps: PopoverArrowSlotProps) => {
      const createor = props.arrow || slots.arrow
      if (createor) {
        return createor(slotProps)
      }
      return createElement('div', {
        ref: arrowRef,
        class: classNames.arrow,
        style: getArrowStyle(slotProps)
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

    const popupWrapper = (popup: any) => {
      const { transitionProps: userTransitionProps } = props

      if (userTransitionProps) {
        const transitionProps = isString(userTransitionProps)
          ? { name: userTransitionProps }
          : {
              name: PopoverTransitionName,
              ...(userTransitionProps as any) // for compile
            }

        if (isVue3) {
          const rawPopup = popup
          popup = createElement(Transition, transitionProps, {
            default: () => rawPopup
          })
        } else {
          popup = createElement(
            'transition',
            {
              props: transitionProps
            },
            [popup]
          )
        }
      }

      return props.popoverWrapper ? props.popoverWrapper(popup) : popup
    }

    //
    // Exposed ====================================
    //

    const popupExposedRef = ref<PopupExposed>()

    const exposed: PopoverExposed = {
      updatePosition: () => popupExposedRef.value?.updatePosition(),
      getFloatingData: () => popupExposedRef.value?.getFloatingData(),
      getElements: () => popupExposedRef.value?.getElements() || {}
    }

    expose(exposed)

    //
    // Render ====================================
    //

    // render content
    const renderContent = (slotProps: PopupSlotProps) => {
      const titleCreator = props.title ?? slots.title
      const contentCreator = props.content ?? slots.content ?? slots.default

      const title = isFunction(titleCreator) ? titleCreator() : titleCreator
      const content = isFunction(contentCreator)
        ? contentCreator()
        : contentCreator

      return createCompatElement(
        'div',
        {
          data: mergeProps(props.popoverProps, {
            class: [
              classNames.popover,
              `size-${props.size}`,
              props.theme === 'dark' && classNames.dark
            ],
            'data-placement': slotProps.placement
          })
        },
        [
          createCompatElement(
            'div',
            {
              data: mergeProps(props.contentProps, {
                class: classNames.content
              })
            },
            [
              title &&
                createElement(
                  'div',
                  {
                    class: classNames.title
                  },
                  [title]
                ),
              content
            ]
          ),
          props.showArrow && createArrow(slotProps)
        ]
      )
    }

    return () => {
      const popupVNodeProps = {
        ref: popupExposedRef
      }

      const popupProps = {
        ...pick(props, Object.keys(ExtendsPopupProps)),
        middleware: middlewareRef.value,
        popupWrapper,
        popupProps: mergeProps(props.popoverProps, {
          class: classNames.popover
        })
      }

      const popupListeners = PopupListenersForwarder.forwards()

      const scopedSlots = {
        reference: slots.reference,
        default: renderContent
      }

      if (isVue3) {
        return createElement(
          Popup,
          {
            ...attrs,
            ...popupProps,
            ...popupListeners,
            ...popupVNodeProps
          },
          scopedSlots
        )
      } else {
        return createElement(Popup, {
          ...popupVNodeProps,
          props: popupProps,
          on: normalizeListenerKeys(popupListeners),
          attrs,
          scopedSlots
        })
      }
    }
  }
})
