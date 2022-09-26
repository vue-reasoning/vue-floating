import {
  isVue3,
  Vue2,
  defineComponent,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  h as createElement,
  toRef,
  ExtractPropTypes,
  nextTick
} from 'vue-demi'
import type { VNode } from 'vue-demi'
import {
  mergeProps,
  pick,
  useListeners,
  isString,
  normalizeListenerKeys,
  isDef,
  useManualEffect,
  useControlledState,
  isObject
} from '@visoning/vue-utility'
import { FloatingCreator } from '@visoning/vue-floating-core'
import type {
  FloatingCreatorExposed,
  FloatingCreatorSlotProps
} from '@visoning/vue-floating-core'
import {
  Interactor,
  createInteractorForwardContext,
  useInteractorForwardContext,
  InteractionDelay
} from '@visoning/vue-floating-interactions'
import type { BaseInteractionInfo } from '@visoning/vue-floating-interactions'

import {
  DelayProps,
  ExtendsInteractiorProps,
  FloatingCreatorListenersForwarder,
  PopupProps
} from './Popup.types'
import type { PopupExposed } from './Popup.types'
import { createCompatElement } from '../utils/compat'
import { Teleport, vShow, withDirectives } from '../utils/vue3.imports'
import { useMiddlewares } from './useMiddlewares'

function transformDelayProps<T extends ExtractPropTypes<typeof DelayProps>>(
  props: T
): Record<keyof T, InteractionDelay> {
  return Object.keys(props).reduce<any>((ret, prop) => {
    const delay = props[prop as keyof T] as any
    ret[prop] = isObject(delay)
      ? { active: delay.open, inactive: delay.close }
      : delay
    return ret
  }, {})
}

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

    const listeners = useListeners()

    const [mergedOpenRef, uncontrolledOpenRef] = useControlledState(
      toRef(props, 'open'),
      toRef(props, 'defaultOpen')
    )

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

    const interactorForwards = createInteractorForwardContext()
    const interactiorContext = useInteractorForwardContext()

    const referenceElRef = computed(() => interactorForwards.interactor.value)
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

    const floatingNodeRef = ref<VNode>()

    const containerRef = computed(() => {
      const { appendTo } = props
      if (appendTo === false) {
        return referenceElRef.value
      }
      return isString(appendTo) ? document.querySelector(appendTo) : appendTo
    })

    if (!isVue3) {
      const createTeleport = () => {
        const { value: container } = containerRef
        if (!container) {
          return
        }

        const teleportInstance = new Vue2({
          render() {
            return floatingNodeRef.value
          }
        })

        teleportInstance.$mount()
        container.appendChild(teleportInstance.$el)

        return () => {
          teleportInstance.$destroy()
          teleportInstance.$el?.remove()
        }
      }

      const { clear: unmountTeleport, reset: remountTeleport } =
        useManualEffect(createTeleport)

      // Vue loses placeholder node during transition processing,
      // so each time we need to recreate
      watch(containerRef, () => remountTeleport())

      onMounted(() => void nextTick(remountTeleport))
      onBeforeUnmount(() => unmountTeleport())
    } else {
      // we use Teleport component in Vue3
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

    // render floating
    const getFloatingStyle = ({
      x,
      y,
      strategy,
      middlewareData
    }: FloatingCreatorSlotProps) => {
      const positionStyle = props.gpuAcceleration
        ? {
            top: 0,
            left: 0,
            transform: `translate3d(${x}px, ${y}px, 0px)`
          }
        : {
            top: `${y}px`,
            left: `${x}px`
          }

      const style: Record<string, any> = {
        ...positionStyle,
        position: strategy,
        zIndex: props.zIndex
      }

      if (middlewareData.hide && !middlewareData.hide.referenceHidden) {
        style.visibility = 'hidden'
      }

      return style
    }

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

      const { popupProps, popupWrapper } = props

      const popupNode = createCompatElement(
        'div',
        {
          data: mergeProps(popupProps, {
            class: classNames.popup
          })
        },
        slots.default?.(slotProps)
      )

      // v-show
      if (isVue3) {
        withDirectives(popupNode, [[vShow, open, 'show']])
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

      return popupWrapper ? popupWrapper(popupNode) : popupNode
    }

    // render reference
    const renderReference = (floatingNode?: VNode) => {
      const interactorProps = {
        ...pick(props, Object.keys(ExtendsInteractiorProps) as any),
        ...transformDelayProps(pick(props, Object.keys(DelayProps) as any)),
        active: mergedOpenRef.value,
        targets: [floatingElRef.value].filter(isDef)
      }
      const interactorListeners = {
        'onUpdate:active': setOpen
      }
      const children = slots.reference?.()
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
