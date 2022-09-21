import {
  isVue3,
  defineComponent,
  computed,
  ref,
  h,
  getCurrentInstance,
  watch,
  h as createElement
} from 'vue-demi'
import * as Vue3 from 'vue'
import { arrow as coreArrow } from '@floating-ui/dom'
import {
  InteractionInfo,
  useClick,
  useFocus,
  useHover,
  useInteractionsContext
} from '@visoning/vue-floating-interactions'
import { useListeners, pick, mergeProps } from '@visoning/vue-utility'

import { Popup, PopupProps } from '../popup'
import type { PopupSlotProps, PopupExposed } from '../popup'
import { createCompatElement } from '../utils/compat'
import {
  Interaction,
  ExtendsPopupProps,
  PopupListenerPropsForwarder,
  PopoverProps,
  PopoverTransitionName,
  PopoverExposed
} from './Popover.types'
import type { PopoverArrowSlotProps } from './Popover.types'
import { useElementProps } from '../utils/useElementsProps'

import './styles/index.scss'

const classNames = {
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
    const currentInstance = getCurrentInstance()

    const listeners = useListeners(currentInstance)

    //
    // Controlled state ====================================
    //

    const uncontrolledOpenRef = ref(!!props.defaultOpen)
    const mergedOpenRef = computed(() =>
      props.open === undefined ? uncontrolledOpenRef.value : props.open
    )

    const setOpen = (open: boolean, info: InteractionInfo) => {
      uncontrolledOpenRef.value = open
      if (open !== props.open) {
        listeners.emit('update:open', open, info)

        if (open) {
          listeners.emit('open', info)
        } else {
          listeners.emit('close', info)
        }
      }
    }

    //
    // Interactions ====================================
    //

    const popupExposedRef = ref<PopupExposed>()

    const elementsRef = computed(() => popupExposedRef.value?.getElements())

    // interactions context
    const interactionsContext = useInteractionsContext(
      computed(() => elementsRef.value?.reference),
      computed(() => elementsRef.value?.floating)
    )

    watch(interactionsContext.open, (open) => {
      setOpen(open, interactionsContext.interactionInfo.value)
    })

    watch(mergedOpenRef, (mergedOpen) => {
      if (interactionsContext.open.value !== mergedOpen) {
        interactionsContext.setOpen(mergedOpen, {
          type: 'component'
        })
      }
    })

    // element props
    const hasInteraction = (interaction: Interaction) =>
      props.interactions.includes(interaction)

    const elementPropsRef = useElementProps(
      useHover(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('hover'),
          delay: props.hoverDelay ?? props.delay,
          keepOpenWhenPopupHover: !!props.keepOpenWhenPopupHover
        }))
      ),
      useFocus(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('focus'),
          delay: props.focusDelay ?? props.delay
        }))
      ),
      useClick(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('click'),
          delay: props.clickDelay ?? props.delay,
          closeWhenClickOutside: !!props.closeWhenClickOutside
        }))
      ),
      // user
      {
        floating: props.popupProps,
        reference: props.referenceProps
      }
    )

    //
    // Exposed ====================================
    //

    const exposed: PopoverExposed = {
      updatePosition: () => popupExposedRef.value?.updatePosition(),
      getFloatingData: () => popupExposedRef.value?.getFloatingData(),
      getElements: () => {
        const elements = popupExposedRef.value?.getElements()
        return {
          reference: elements?.reference,
          floating: elements?.floating
        }
      }
    }

    expose(exposed)

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

    const transitionWrapper = (popup: any) => {
      const { transitionProps, popoverWrapper } = props

      if (transitionProps) {
        const transitionData =
          typeof transitionProps === 'string'
            ? { name: transitionProps }
            : {
                name: PopoverTransitionName,
                ...(transitionProps as any) // for ts compile
              }

        if (isVue3) {
          const rawPopup = popup
          popup = createElement(Vue3.Transition, transitionData, {
            default: () => rawPopup
          })
        } else {
          popup = createElement(
            'transition',
            {
              props: transitionData
            },
            [popup]
          )
        }
      }

      return typeof popoverWrapper === 'function'
        ? popoverWrapper(popup)
        : popup
    }

    //
    // Render ====================================
    //

    // render content
    const renderContent = (slotProps: PopupSlotProps) => {
      const title = props.title ?? slots.title
      const content = props.content ?? slots.content

      const titleNode = typeof title === 'function' ? title() : title
      const contentNode = typeof content === 'function' ? content() : content

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
              titleNode && h('div', { class: classNames.title }, [titleNode]),
              contentNode ? contentNode : slots.default?.()
            ]
          ),
          props.showArrow && createArrow(slotProps)
        ]
      )
    }

    const PopupPropsKeys = Object.keys(PopupProps)
    const ExtendsPopupPropsKeys = Object.keys(ExtendsPopupProps)

    return () => {
      const { value: elementProps } = elementPropsRef

      const popupProps = {
        ...pick(props, ExtendsPopupPropsKeys),
        ...PopupListenerPropsForwarder.forwards(),
        open: mergedOpenRef.value,
        middleware: middlewareRef.value,
        popupWrapper: transitionWrapper,
        popupProps: mergeProps(elementProps.floating),
        referenceProps: mergeProps(
          // TODO
          attrs,
          props.referenceProps,
          elementProps.reference
        )
      }

      return createCompatElement(Popup, {
        data: {
          ...popupProps,
          ref: popupExposedRef
        },
        scopedSlots: {
          reference: slots.reference,
          default: renderContent
        },
        propKeys: PopupPropsKeys
      })
    }
  }
})
