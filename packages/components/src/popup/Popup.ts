import {
  defineComponent,
  ref,
  computed,
  h,
  VNode,
  onMounted,
  onUpdated,
  getCurrentInstance,
  isVue3,
  watch,
  onBeforeMount,
  onBeforeUnmount
} from 'vue-demi'
import { Comment } from 'vue'
import { offset, shift, flip, autoPlacement, arrow } from '@floating-ui/core'
import { Middleware, useManualEffect } from '@visoning/vue-floating-core'
import { FloatingComponent, FloatingComponentExposed } from '@visoning/vue-floating-core/components'
import type { FloatingComponentSlotProps } from '@visoning/vue-floating-core/components'
import {
  useClick,
  useFocus,
  useHover,
  useInteractionsContext
} from '@visoning/vue-floating-interactions'

import { Interaction, PopupExposed, PopupProps } from './Popup.types'
import { mergeListeners, mergeProps } from '../utils/mergeProps'
import { transformListeners, createVueMountProxy, createElement } from '../utils/compat'
import { isOn } from '../utils/isOn'
import { useElementProps } from '../utils/useElementsProps'

export const Popup = defineComponent({
  name: 'Popup',

  props: PopupProps,

  setup(props, { emit, slots, expose }) {
    //
    // Controlled state ====================================
    //

    const uncontrolledOpenRef = ref(!!props.defaultOpen)
    const mergedOpenRef = computed({
      get() {
        return props.open === undefined ? uncontrolledOpenRef.value : props.open
      },
      set(newOpen) {
        uncontrolledOpenRef.value = newOpen
        if (newOpen !== props.open) {
          emit('update:open', newOpen)
        }
      }
    })

    //
    // Element refs ====================================
    //

    const referenceRef = ref<HTMLElement>()
    const popupRef = ref<HTMLElement>()

    const arrowRef = ref<HTMLElement>()

    const floatingComponentRef = ref<FloatingComponentExposed>()

    const currentInstance = getCurrentInstance()
    const updateReference = () => {
      referenceRef.value = currentInstance?.proxy?.$el as HTMLElement
    }

    onMounted(updateReference)
    onUpdated(updateReference)

    //
    // Interactions ====================================
    //

    // interactions context
    const interactionsContext = useInteractionsContext(referenceRef, popupRef)

    watch(interactionsContext.open, (open) => {
      if (mergedOpenRef.value !== open) {
        mergedOpenRef.value = open
      }
    })

    watch(mergedOpenRef, (mergedOpen) => {
      if (interactionsContext.open.value !== mergedOpen) {
        interactionsContext.setOpen(mergedOpen)
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

    const floatingDataRef = computed(() => floatingComponentRef.value?.floatingData)

    const updateFloating = () => floatingComponentRef.value?.update()

    const popupExposed: PopupExposed = {
      floatingData: floatingDataRef,
      update: updateFloating
    }

    expose(popupExposed)

    //
    // Render helpers ====================================
    //

    // disabled
    const disabledRef = computed(
      () => props.disabled || (!mergedOpenRef.value && !props.autoUpdateOnClosed)
    )

    // middleware
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
      if (props.showArrow && arrowRef.value) {
        middleware.push(
          arrow({
            element: arrowRef.value
          })
        )
      }

      return middleware.concat(props.middleware || [])
    })

    // popup portal
    const popupTeleportNodeRef = ref<VNode | null>(null)

    const createTeleport = () => {
      if (props.appendToBody) {
        const popupPortal = createVueMountProxy({
          render() {
            return popupTeleportNodeRef.value
          }
        })
        popupPortal.mount()

        document.body.appendChild(popupPortal.$el!)

        return popupPortal.unmount
      }
    }

    // Vue loses placeholder node during transition processing,
    // so each time we need to recreate
    const { clear: unmountTeleport, reset: mountTeleport } = useManualEffect(createTeleport)

    watch(
      () => props.appendToBody,
      () => mountTeleport()
    )

    onBeforeMount(mountTeleport)
    onBeforeUnmount(unmountTeleport)

    // render arrow
    const renderArrow = () => {
      const arrow = props.arrow
      const createArrow = arrow ? (typeof arrow === 'function' ? arrow : () => arrow) : slots.arrow

      return createArrow && createArrow(floatingDataRef.value!)
    }

    // render popup
    const getPopupStyle = (data: FloatingComponentSlotProps) => {
      if (props.gpuAcceleration) {
        return {
          position: data.strategy,
          top: 0,
          left: 0,
          transform: `translate3d(${data.x}px, ${data.y}px, 0px)`
        }
      }

      return {
        position: data.strategy,
        left: `${data.x}px`,
        top: `${data.y}px`
      }
    }

    const renderPopup = (slotProps: FloatingComponentSlotProps) => {
      const { popupWrapper } = props
      const { value: mergedOpen } = mergedOpenRef

      let popup: VNode | null = null
      if (mergedOpen || !props.destoryedOnClosed) {
        popup = createElement(
          'div',
          {
            data: mergeProps(elementPropsRef.value.floating, {
              ref: popupRef as any,
              class: 'visoning-popup',
              style: getPopupStyle(slotProps),
              directives: [
                {
                  name: 'show',
                  value: mergedOpen
                }
              ]
            })
          },
          [slots.default?.(slotProps), props.showArrow && renderArrow()]
        )
      }

      popup = popupWrapper ? popupWrapper(popup) : popup

      if (!props.appendToBody) {
        popupTeleportNodeRef.value = null
        return popup
      } else {
        popupTeleportNodeRef.value = popup
      }
    }

    // render reference
    const renderReference = (slotProps: FloatingComponentSlotProps) => {
      const reference = slots.reference && getPopoverRealChild(slots.reference(slotProps))
      if (!reference) {
        return
      }

      if (isVue3) {
        ;(reference as any).props = mergeProps(
          (reference as any).props,
          elementPropsRef.value.reference
        )
      } else {
        const data = (reference as any).data || {}
        const {
          class: kls,
          style,
          ...mergedProps
        } = mergeProps(
          {
            ...data.attrs,
            class: data.class,
            style: data.style
          },
          elementPropsRef.value.reference
        )

        data.class = kls
        data.style = style

        const on: Record<string, any> = {}
        const attrs: Record<string, any> = {}
        for (const key in mergedProps) {
          if (isOn(key)) {
            on[key] = mergedProps[key]
          } else {
            attrs[key] = mergedProps[key]
          }
        }

        data.attrs = attrs
        data.on = mergeListeners(data.on, transformListeners(on))
        ;(reference as any).data = data
      }

      return reference
    }

    //
    // Render ====================================
    //

    return () =>
      createElement(FloatingComponent, {
        data: {
          ref: floatingComponentRef,
          floatingNode: popupRef.value,
          disabled: disabledRef.value,
          placement: props.placement,
          strategy: props.strategy,
          middleware: middlewareRef.value,
          autoUpdate: props.autoUpdate
        },
        scopedSlots: {
          default: renderPopup,
          reference: renderReference
        }
      })
  }
})

const isNotTextNode = isVue3
  ? (child: any) => child.type !== Comment
  : (child: any) => child.tag || (child.isComment && child.asyncFactory)

function getPopoverRealChild(children: VNode[]): VNode | undefined {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isNotTextNode(child as any)) {
      return child
    }
  }
}
