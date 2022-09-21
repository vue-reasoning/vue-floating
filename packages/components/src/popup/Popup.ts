import {
  isVue3,
  Vue2,
  defineComponent,
  ref,
  computed,
  watch,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  h as createElement
} from 'vue-demi'
import type { VNode } from 'vue-demi'
import * as Vue3 from 'vue'
import { offset, shift, flip, autoPlacement } from '@floating-ui/dom'
import {
  useFirstQualifiedElement,
  isHandlerKey,
  mergeProps,
  isComment,
  isText,
  partition,
  cloneVNode,
  normalizeListenerKeys,
  isDef
} from '@visoning/vue-utility'
import { useManualEffect } from '@visoning/vue-floating-core'
import type { Middleware } from '@visoning/vue-floating-core'
import {
  FloatingCreator,
  FloatingCreatorProps,
  FloatingCreatorSlotProps
} from '@visoning/vue-floating-core/components'
import type { FloatingCreatorExposed } from '@visoning/vue-floating-core/components'

import {
  FloatingCreatorListenerPropsForwarder,
  PopupProps
} from './Popup.types'
import type { PopupExposed } from './Popup.types'
import { createCompatElement } from '../utils/compat'
import {
  createReferenceForwardContext,
  useSafeReferenceForwardContent
} from './ReferenceForwardContext'

const classNames = {
  floating: 'visoning-floating',
  popup: 'visoning-popup',
  textWrapper: 'visonimg-popup-text-wrapper'
} as const

export const Popup = defineComponent({
  name: 'VisoningPopup',

  inheritAttrs: false,

  props: PopupProps,

  setup(props, { slots, expose }) {
    const currentInstance = getCurrentInstance()

    //
    // Element refs ====================================
    //

    // reference capture
    const firstRealElementRef = useFirstQualifiedElement(
      currentInstance,
      (element) => element.nodeType === 1
    )
    const referenceForwardRef = createReferenceForwardContext()
    const referenceRealElementRef = computed(
      () =>
        // We will wrap the text node as a real element node,
        // if the root node of a component is text, then this component is a multi-subset component.
        // In this case, we cannot know exactly which subset the user wants As a real reference,
        // so we need to return "null" for ForwardReference to pass.
        firstRealElementRef.value || referenceForwardRef.value
    )

    // reference forward
    const referenceForward = useSafeReferenceForwardContent()
    if (referenceForward) {
      watch(referenceRealElementRef, () =>
        referenceForward.forwardReference(referenceRealElementRef.value)
      )
    }

    const mergedReferenceElRef = computed(
      () => props.virtualElement || referenceRealElementRef.value
    )
    const floatingElRef = ref<HTMLElement>()

    //
    // Expose ====================================
    //

    const floatingCreatorExposedRef = ref<FloatingCreatorExposed>()

    const exposed: PopupExposed = {
      updatePosition: () => floatingCreatorExposedRef.value?.updatePosition(),
      getFloatingData: () => floatingCreatorExposedRef.value?.getFloatingData(),
      getElements: () => ({
        floating: floatingElRef.value,
        reference: mergedReferenceElRef.value
      })
    }

    expose(exposed)

    //
    // Middleware ====================================
    //

    const normalizeMiddlewareOptions = (
      opt: boolean | Record<string, any>,
      candidate: Record<string, any> = {}
    ) => {
      return typeof opt === 'object' ? opt : candidate
    }

    const middlewareRef = computed(() => {
      const middleware: Middleware[] = []

      if (props.offset) {
        middleware.push(offset(props.offset))
      }
      if (props.shift) {
        middleware.push(shift(normalizeMiddlewareOptions(props.shift)))
      }
      if (props.flip) {
        middleware.push(flip(normalizeMiddlewareOptions(props.flip)))
      }
      if (props.autoPlacement) {
        middleware.push(
          autoPlacement(normalizeMiddlewareOptions(props.autoPlacement))
        )
      }

      return middleware.concat(props.middleware || [])
    })

    //
    // Render ====================================
    //

    // render popup
    const renderPopup = (slotProps: FloatingCreatorSlotProps) => {
      const { open, destoryedOnClosed } = props
      // v-if
      if (!open && destoryedOnClosed) {
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
        Vue3.withDirectives(popupNode, [[Vue3.vShow, open, 'show']])
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

      // wrapper
      const { popupWrapper } = props
      return popupWrapper ? popupWrapper(popupNode) : popupNode
    }

    // append to
    const floatingNodeRef = ref<VNode | null>(null)

    if (!isVue3) {
      const createTeleport = () => {
        const { appendTo } = props
        if (!appendTo) {
          return
        }

        const teleportInstance = new Vue2({
          render() {
            return floatingNodeRef.value
          }
        })

        teleportInstance.$mount()

        const target =
          typeof appendTo === 'string'
            ? document.querySelector(appendTo)
            : appendTo
        // allow throw error
        ;(target as HTMLElement).appendChild(teleportInstance.$el)

        return () => {
          teleportInstance.unmount()
          teleportInstance.$el?.remove()
        }
      }

      // Vue loses placeholder node during transition processing,
      // so each time we need to recreate
      const { clear: unmountTeleport, reset: mountTeleport } =
        useManualEffect(createTeleport)

      watch(
        () => props.appendTo,
        (appendTo) => (appendTo ? mountTeleport() : unmountTeleport())
      )

      onMounted(mountTeleport)
      onBeforeUnmount(unmountTeleport)
    } else {
      // We use Teleport component in Vue3
    }

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
      let floatingNode = createElement(
        'div',
        {
          ref: floatingElRef,
          class: classNames.floating,
          style: getFloatingStyle(slotProps)
        },
        [popupNode]
      )

      // wrapper
      if (props.floatingWrapper) {
        floatingNode = props.floatingWrapper(floatingNode)
      }

      floatingNodeRef.value = null

      if (!props.appendTo) {
        return floatingNode
      }

      // append to
      if (isVue3) {
        return createElement(
          Vue3.Teleport as any,
          {
            to: props.appendTo
          },
          {
            default: () => [floatingNode]
          }
        )
      } else {
        floatingNodeRef.value = floatingNode
      }
    }

    // render reference
    const renderReference = (
      slotProps: FloatingCreatorSlotProps,
      floatingNode?: VNode
    ) => {
      const rawChildren =
        slots.reference && getPopupRawChildren(slots.reference(slotProps))
      if (!rawChildren || !rawChildren.length) {
        return
      }

      const rawChild = wrapperTextNode(rawChildren[0])
      const { referenceProps } = props

      if (isVue3) {
        const child = referenceProps
          ? cloneVNode(rawChild, referenceProps)
          : rawChild
        return [child, floatingNode]
      } else {
        const {
          class: userClass,
          style: userStyle,
          ...otherAttrs
        } = referenceProps || {}

        // elementProps will always pass only attrs
        const [userOn, userAttr] = partition(otherAttrs, (_, key) =>
          isHandlerKey(key as string)
        )

        const child = cloneVNode(rawChild, {
          class: userClass,
          style: userStyle,
          on: normalizeListenerKeys(userOn),
          attrs: userAttr
        })

        if (floatingNode) {
          child.children = [floatingNode].concat(child.children).filter(isDef)
        }

        return child
      }
    }

    const FloatingCreatorPropsKeys = Object.keys(FloatingCreatorProps)

    return () => {
      const disabled =
        props.disabled || (!props.open && !props.autoUpdateOnClosed)

      const floatingCreatorProps = {
        ...FloatingCreatorListenerPropsForwarder.forwards(),
        reference: mergedReferenceElRef.value,
        floating: floatingElRef.value,
        disabled,
        placement: props.placement,
        strategy: props.strategy,
        middleware: middlewareRef.value,
        autoUpdate: props.autoUpdate
      }

      return createCompatElement(FloatingCreator, {
        data: {
          ...floatingCreatorProps,
          ref: floatingCreatorExposedRef
        },
        propKeys: FloatingCreatorPropsKeys,
        scopedSlots: {
          default: (slotProps: FloatingCreatorSlotProps) => {
            return renderReference(
              slotProps,
              renderFloating(slotProps, renderPopup(slotProps))
            )
          }
        }
      })
    }
  }
})

function getPopupRawChildren(children: VNode[]) {
  return isVue3
    ? Vue3.getTransitionRawChildren(children, false)
    : children.filter((child) => !isComment(child))
}

function wrapperTextNode(vnode: VNode) {
  if (isText(vnode)) {
    return createElement(
      'span',
      {
        class: classNames.textWrapper
      },
      [vnode]
    )
  }
  return vnode
}
