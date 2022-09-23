import {
  isVue3,
  Vue2,
  defineComponent,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  h as createElement
} from 'vue-demi'
import type { VNode } from 'vue-demi'
import {
  mergeProps,
  pick,
  useListeners,
  isString,
  normalizeListenerKeys
} from '@visoning/vue-utility'
import { useManualEffect, FloatingCreator } from '@visoning/vue-floating-core'
import type {
  FloatingCreatorExposed,
  FloatingCreatorSlotProps
} from '@visoning/vue-floating-core'
import {
  BaseInteractionInfo,
  createInteractorForwardContext,
  Interactor,
  InteractorProps,
  useInteractorContext
} from '@visoning/vue-floating-interactions'

import { FloatingCreatorListenersForwarder, PopupProps } from './Popup.types'
import type { PopupExposed } from './Popup.types'
import { createCompatElement } from '../utils/compat'
import { Teleport, vShow, withDirectives } from '../utils/vue3.imports'
import { useMiddlewares } from './useMiddlewares'

const classNames = {
  floating: 'visoning-floating',
  popup: 'visoning-popup'
} as const

export const Popup = defineComponent({
  name: 'VisoningPopup',

  inheritAttrs: false,

  props: PopupProps,

  setup(props, { slots, attrs, expose }) {
    //
    // Controlled state ====================================
    //

    const uncontrolledOpenRef = ref(!!props.defaultOpen)
    const mergedOpenRef = computed(() =>
      props.open === undefined ? uncontrolledOpenRef.value : props.open
    )

    const listeners = useListeners()

    const setOpen = (open: boolean, info?: BaseInteractionInfo) => {
      uncontrolledOpenRef.value = open
      if (open !== props.open) {
        listeners.emit('update:open', open, info)
        listeners.emit(open ? 'open' : 'close', info)
      }
    }

    //
    // Element refs ====================================
    //

    const referenceElRef = createInteractorForwardContext()

    const interactiorContext = useInteractorContext()
    // continue forward ref
    watch(referenceElRef, (el) => interactiorContext?.setInteractor(el))

    const mergedReferenceElRef = computed(
      () => props.virtualElement || referenceElRef.value
    )

    const floatingElRef = ref<HTMLElement>()

    //
    // Middleware ====================================
    //

    const middlewareRef = useMiddlewares(props)

    //
    // Append to ====================================
    //

    const containerRef = computed(() => {
      const { appendTo } = props
      if (appendTo === false) {
        return referenceElRef.value
      }
      return isString(appendTo) ? document.querySelector(appendTo) : appendTo
    })

    const floatingNodeRef = ref<VNode>()

    if (!isVue3) {
      const createTeleport = () => {
        const { value: container } = containerRef

        const teleportInstance = new Vue2({
          render() {
            return floatingNodeRef.value
          }
        })
        teleportInstance.$mount()

        // allow throw error
        container!.appendChild(teleportInstance.$el)

        return () => {
          teleportInstance.$destroy()
          teleportInstance.$el?.remove()
        }
      }

      // Vue loses placeholder node during transition processing,
      // so each time we need to recreate
      const { clear: unmountTeleport, reset: mountTeleport } =
        useManualEffect(createTeleport)

      watch(containerRef, () => mountTeleport())

      onMounted(mountTeleport)
      onBeforeUnmount(unmountTeleport)
    } else {
      // We use Teleport component in Vue
    }

    //
    // Expose ====================================
    //

    const floatingCreatorExposedRef = ref<FloatingCreatorExposed>()

    const exposed: PopupExposed = {
      getElements: () => ({
        floating: floatingElRef.value,
        reference: referenceElRef.value
      }),
      updatePosition: () => floatingCreatorExposedRef.value?.updatePosition(),
      getFloatingData: () => floatingCreatorExposedRef.value?.getFloatingData()
    }

    expose(exposed)

    //
    // Render ====================================
    //

    const getFloatingStyle = (data: FloatingCreatorSlotProps) => {
      if (props.gpuAcceleration) {
        return {
          position: data.strategy,
          top: 0,
          left: 0,
          transform: `translate3d(${data.x}px, ${data.y}px, 0px)`,
          zIndex: props.zIndex
        }
      }
      return {
        position: data.strategy,
        top: `${data.y}px`,
        left: `${data.x}px`,
        zIndex: props.zIndex
      }
    }

    // render floating
    const renderFloating = (
      slotProps: FloatingCreatorSlotProps,
      popupNode?: VNode
    ) => {
      let floatingNode = createCompatElement(
        'div',
        {
          data: mergeProps(props.floatingProps, {
            ref: floatingElRef,
            class: classNames.floating,
            style: getFloatingStyle(slotProps)
          })
        },
        [popupNode]
      )

      // wrapper
      if (props.floatingWrapper) {
        floatingNode = props.floatingWrapper(floatingNode)
      }

      // append to
      if (isVue3) {
        return createElement(
          Teleport,
          {
            to: containerRef.value
          },
          {
            default: () => [floatingNode]
          }
        )
      } else {
        floatingNodeRef.value = floatingNode
      }
    }

    // render popup
    const renderPopup = (slotProps: FloatingCreatorSlotProps) => {
      const { value: open } = mergedOpenRef
      const { destoryedOnClosed } = props
      if (!open && destoryedOnClosed) {
        // v-if
        return
      }

      const popupNode = createCompatElement(
        'div',
        {
          data: mergeProps(props.popupProps, {
            class: classNames.popup
          })
        },
        slots.default?.(slotProps)
      )

      // v-show
      if (isVue3) {
        withDirectives && withDirectives(popupNode, [[vShow, open, 'show']])
      } else {
        const vShowDirective = {
          name: 'show',
          value: open
        }
        // TODO: filter show directive first??
        ;(
          (popupNode as any).data.directives ||
          ((popupNode as any).data.directives = [])
        ).push(vShowDirective)
      }

      return props.popupWrapper ? props.popupWrapper(popupNode) : popupNode
    }

    // render reference
    const renderReference = (floatingNode?: VNode) => {
      const children = slots.reference?.()
      const interactorProps = {
        ...pick(props, Object.keys(InteractorProps)),
        active: mergedOpenRef.value
      }
      const interactorListeners = {
        'onUpdate:active': setOpen
      }
      if (isVue3) {
        return createElement(
          Interactor,
          {
            ...attrs,
            ...interactorProps,
            ...interactorListeners
          },
          [children, floatingNode]
        )
      } else {
        return createElement(
          Interactor,
          {
            attrs,
            props: interactorProps,
            on: normalizeListenerKeys(interactorListeners)
          },
          children
          // floatingNode is mounted by teleport
        )
      }
    }

    return () => {
      const disabled =
        props.disabled || (!mergedOpenRef.value && !props.autoUpdateOnClosed)

      const floatingCreatorVNodeProps = {
        ref: floatingCreatorExposedRef
      }

      const floatingCreatorProps = {
        reference: mergedReferenceElRef.value,
        floating: floatingElRef.value,
        disabled,
        placement: props.placement,
        strategy: props.strategy,
        autoUpdate: props.autoUpdate,
        middleware: middlewareRef.value
      }

      const floatingCreatorListeners =
        FloatingCreatorListenersForwarder.forwards()

      const scopedSlots = {
        default: (slotProps: FloatingCreatorSlotProps) => {
          const popup = renderPopup(slotProps)
          const floating = renderFloating(slotProps, popup)
          return renderReference(floating)
        }
      }

      if (isVue3) {
        return createElement(
          FloatingCreator,
          {
            ...floatingCreatorProps,
            ...floatingCreatorListeners,
            ...floatingCreatorVNodeProps
          },
          scopedSlots
        )
      } else {
        return createElement(FloatingCreator, {
          ...floatingCreatorVNodeProps,
          props: floatingCreatorProps,
          on: normalizeListenerKeys(floatingCreatorListeners),
          scopedSlots
        })
      }
    }
  }
})
