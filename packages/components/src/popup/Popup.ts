import {
  isVue3,
  defineComponent,
  ref,
  computed,
  watch,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUpdated
} from 'vue-demi'
import type { VNode } from 'vue-demi'
import { withDirectives, vShow, Teleport, cloneVNode } from 'vue'
import { offset, shift, flip, autoPlacement } from '@floating-ui/core'
import { useManualEffect } from '@visoning/vue-floating-core'
import type { Middleware } from '@visoning/vue-floating-core'
import {
  FloatingCreator,
  FloatingCreatorExposed,
  FloatingCreatorSlotProps,
  FloatingData
} from '@visoning/vue-floating-core/components'
import {
  useClick,
  useFocus,
  useHover,
  useInteractionsContext
} from '@visoning/vue-floating-interactions'
import type { InteractionInfo } from '@visoning/vue-floating-interactions'

import { Interaction, PopupExposed, PopupProps } from './Popup.types'
import { mergeListeners, mergeProps } from '../utils/mergeProps'
import { createSimpleCompatVueInstance, createCompatElement } from '../utils/compat'
import { useElementProps } from '../utils/useElementsProps'
import { isOn, transformLegacyListeners } from '../utils/on'
import { getRawChildren, wrapTextNodeIfNeed } from '../utils/getRawChildren'
import { useForwardReferenceContext } from './ForwardReferenceContext'

const popupCls = 'visoning-popup'

const floatingCls = 'visoning-floating'

export const Popup = defineComponent({
  name: 'VisoningPopup',

  inheritAttrs: !isVue3,

  props: PopupProps,

  setup(props, { emit, slots, expose }) {
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
        emit('update:open', open, info)

        if (open) {
          emit('open', info)
        } else {
          emit('close', info)
        }
      }
    }

    //
    // Element refs ====================================
    //

    const floatingElRef = ref<HTMLElement>()
    const referenceElRef = ref<HTMLElement>()

    const mergedReferenceElRef = computed(() => props.virtualElement || referenceElRef.value)

    const currentInstance = getCurrentInstance()
    if (!isVue3) {
      const updateReference = () => {
        referenceElRef.value = currentInstance?.proxy?.$el as HTMLElement
      }

      onMounted(updateReference)
      onUpdated(updateReference)
    }

    //
    // Interactions ====================================
    //

    // interactions context
    const interactionsContext = useInteractionsContext(mergedReferenceElRef, floatingElRef)

    watch(interactionsContext.open, (open) => {
      setOpen(open, interactionsContext.info.value)
    })

    watch(mergedOpenRef, (mergedOpen) => {
      if (interactionsContext.open.value !== mergedOpen) {
        interactionsContext.setOpen(mergedOpen, {
          type: 'component'
        })
      }
    })

    // element props
    const hasInteraction = (interaction: Interaction) => props.interactions.includes(interaction)

    const elementPropsRef = useElementProps(
      useHover(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('hover'),
          delay: props.hoverDelay ?? props.delay
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
          delay: props.clickDelay ?? props.delay
        }))
      ),
      // user
      {
        floating: props.popupProps,
        reference: props.referenceProps
      }
    )

    //
    // Expose ====================================
    //

    const floatingCreatorExposedRef = ref<FloatingCreatorExposed>()

    const exposed: PopupExposed = {
      getFloatingData: () => floatingCreatorExposedRef.value?.getFloatingData(),
      updatePosition: () => floatingCreatorExposedRef.value?.updatePosition()
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
        middleware.push(autoPlacement(normalizeMiddlewareOptions(props.autoPlacement)))
      }

      return middleware.concat(props.middleware || [])
    })

    //
    // Render ====================================
    //

    // render popup
    const renderPopup = (slotProps: FloatingCreatorSlotProps) => {
      const { value: mergedOpen } = mergedOpenRef
      // v-if
      if (!mergedOpen && props.destoryedOnClosed) {
        return
      }

      let popupNode = createCompatElement(
        'div',
        {
          data: mergeProps(elementPropsRef.value.floating, {
            class: popupCls
          })
        },
        slots.default?.(slotProps)
      )

      // v-show
      if (isVue3) {
        withDirectives(popupNode as any, [[vShow, mergedOpen, 'show']])
      } else {
        const vShowDirective = {
          name: 'show',
          value: mergedOpen
        }
        // TODO: filter show directive first??
        ;((popupNode as any).data.directives || ((popupNode as any).data.directives = [])).push(
          vShowDirective
        )
      }

      // wrapper
      const { popupWrapper } = props

      return popupWrapper ? popupWrapper(popupNode) : popupNode
    }

    // append to
    const floatingNodeRef = ref<VNode | null>(null)

    if (!isVue3) {
      const createTeleport = () => {
        const teltportInstance = createSimpleCompatVueInstance({
          render() {
            return floatingNodeRef.value
          }
        })

        teltportInstance.mount()

        const { appendTo } = props
        const target = typeof appendTo === 'string' ? document.querySelector(appendTo) : appendTo
        // Throw error
        ;(target as HTMLElement).appendChild(teltportInstance.$el!)

        // return clear effect
        return teltportInstance.unmount
      }

      // Vue loses placeholder node during transition processing,
      // so each time we need to recreate
      const { clear: unmountTeleport, reset: mountTeleport } = useManualEffect(createTeleport)

      watch(
        () => props.appendTo,
        (appendTo) => {
          if (appendTo) {
            mountTeleport()
          } else {
            unmountTeleport()
          }
        }
      )

      onMounted(mountTeleport)
      onBeforeUnmount(unmountTeleport)
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
    const renderFloating = (slotProps: FloatingCreatorSlotProps, popupNode?: VNode) => {
      let floatingNode = createCompatElement(
        'div',
        {
          data: {
            ref: floatingElRef,
            class: floatingCls,
            style: getFloatingStyle(slotProps)
          }
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

      // teleport
      if (isVue3) {
        return createCompatElement(Teleport, {
          data: {
            to: props.appendTo
          },
          scopedSlots: {
            default: () => [floatingNode]
          }
        })
      } else {
        floatingNodeRef.value = floatingNode
      }
    }

    // render reference
    const renderReference = (slotProps: FloatingCreatorSlotProps, floatingNode?: VNode) => {
      const rawChildren = slots.reference && getRawChildren(slots.reference(slotProps))
      if (!rawChildren) {
        return
      }

      let rawChild = wrapTextNodeIfNeed(rawChildren[0] as any) as any

      if (isVue3) {
        rawChild = cloneVNode(rawChild, {
          ...mergeProps(currentInstance?.proxy.$attrs, elementPropsRef.value.reference)
        })

        // Capture reference
        // Because Vue supports element hoisting for HOC, so we can do this,
        // it is also to avoid that the real $el cannot be obtained through currentInstance
        // when the node is in the Fragment.
        withDirectives(rawChild as any, [
          [
            {
              mounted(el) {
                referenceElRef.value = el
              },
              updated(el) {
                referenceElRef.value = el
              },
              unmounted() {
                referenceElRef.value = undefined
              }
            }
          ]
        ]) as unknown as VNode

        return [rawChild, floatingNode]
      } else {
        const data = rawChild.data || (rawChild.data = {})
        const {
          class: kls,
          style,
          ...mergedAttrs
        } = mergeProps(
          {
            // elementProps will always pass only attrs
            ...data.attrs,
            class: data.class,
            style: data.style
          },
          elementPropsRef.value.reference
        )

        const on: Record<string, any> = {}
        const attrs: Record<string, any> = {}
        for (const key in mergedAttrs) {
          if (isOn(key)) {
            on[key] = mergedAttrs[key]
          } else {
            attrs[key] = mergedAttrs[key]
          }
        }

        data.class = kls
        data.style = style
        data.attrs = attrs
        data.on = mergeListeners(data.on, transformLegacyListeners(on))

        if (floatingNode) {
          rawChild.children = (
            Array.isArray(rawChild.children) ? rawChild.children : ([rawChild.children] as any)
          )
            .filter((child: any) => child != undefined)
            .concat(floatingNode)
        }
      }

      return rawChild
    }

    return () => {
      const disabledFloating = props.disabled || (!mergedOpenRef.value && !props.autoUpdateOnClosed)

      return createCompatElement(FloatingCreator, {
        data: {
          ref: floatingCreatorExposedRef,
          reference: mergedReferenceElRef.value,
          floating: floatingElRef.value,
          disabled: disabledFloating,
          placement: props.placement,
          strategy: props.strategy,
          middleware: middlewareRef.value,
          autoUpdate: props.autoUpdate,
          onUpdate: (floatingData: FloatingData) => emit('floating-data-update', floatingData)
        },
        scopedSlots: {
          default: (slotProps: FloatingCreatorSlotProps) =>
            renderReference(slotProps, renderFloating(slotProps, renderPopup(slotProps)))
        }
      })
    }
  }
})
