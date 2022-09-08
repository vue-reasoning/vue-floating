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
import { offset, shift, flip, autoPlacement } from '@floating-ui/core'
import { Middleware, useManualEffect } from '@visoning/vue-floating-core'
import { FloatingComponent } from '@visoning/vue-floating-core/components'
import type { FloatingSlotProps } from '@visoning/vue-floating-core/components'
import {
  useClick,
  useFocus,
  useHover,
  useInteractionsContext
} from '@visoning/vue-floating-interactions'

import { Interaction, PopupProps } from './Popup.types'
import { mergeListeners, mergeProps } from '../utils/mergeProps'
import { transformListeners, transformLegacyVNodeData, createVueMountProxy } from '../utils/compat'
import { isOn } from '../utils/isOn'
import { useElementProps } from '../utils/useElementsProps'

let uid = 0

export const Popup = defineComponent({
  name: 'Popup',

  props: PopupProps,

  setup(props, { emit, slots }) {
    const id = `__visoning_popup_${uid++}`

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
      // hover
      useHover(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('hover'),
          delay: props.hoverDelay
        }))
      ),
      // focus
      useFocus(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('focus'),
          delay: props.focusDelay
        }))
      ),
      // click
      useClick(
        interactionsContext,
        computed(() => ({
          disabled: !hasInteraction('click'),
          delay: props.clickDelay
        }))
      ),
      // user
      {
        floating: props.popupProps,
        reference: props.referenceProps
      }
    )

    //
    // Render helpers ====================================
    //

    // disabled
    const disabledFloatingRef = computed(
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

      return middleware.concat(props.middleware || [])
    })

    // popup portal
    const popupRenderNodeRef = ref<VNode | null>(null)

    // Vue loses placeholder node during transition processing,
    // so each time we need to recreate
    const { clear: unmountTeleport, reset: mountTeleport } = useManualEffect(() => {
      if (props.appendToBody) {
        const popupPortal = createVueMountProxy({
          name: 'PopupComponent',
          render() {
            return popupRenderNodeRef.value
          }
        })

        popupPortal.mount()
        document.body.appendChild(popupPortal.$el!)

        return popupPortal.unmount
      }
    })

    onBeforeMount(mountTeleport)
    onBeforeUnmount(unmountTeleport)

    watch(() => props.appendToBody, mountTeleport)

    // render popup
    const getPopupStyle = (data: FloatingSlotProps) => {
      if (props.gpuAcceleration) {
        return {
          position: data.strategy,
          top: 0,
          left: 0,
          transform: `transform: translate3d(${data.x}px, ${data.y}px, 0px);`
        }
      }

      return {
        position: data.strategy,
        top: `${data.y}px`,
        left: `${data.x}px`
      }
    }

    const renderPopup = (slotProps: FloatingSlotProps) => {
      const { popupWrapper } = props
      const { value: mergedOpen } = mergedOpenRef

      let popup: VNode | null = null
      if (mergedOpen || !props.destoryedOnClosed) {
        const data = transformLegacyVNodeData({
          props: {
            ...elementPropsRef.value.floating,
            key: id,
            ref: popupRef,
            style: getPopupStyle(slotProps),
            directives: [
              {
                name: 'show',
                value: mergedOpen
              }
            ]
          }
        })

        popup = h('div', data.props, [
          h(
            'div',
            {
              class: 'visoning-popover-content'
            },
            slots.default?.(slotProps)
          )
        ])
      }

      popup = popupWrapper ? popupWrapper(popup) : popup

      if (!props.appendToBody) {
        popupRenderNodeRef.value = null
        return popup
      } else {
        popupRenderNodeRef.value = popup
      }
    }

    const renderReference = (slotProps: FloatingSlotProps) => {
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

        data.props = attrs
        data.on = mergeListeners(data.on, transformListeners(on))
        ;(reference as any).data = data
      }

      return reference
    }

    //
    // Render ====================================
    //

    return () => {
      const data = transformLegacyVNodeData({
        props: {
          floatingNode: popupRef.value,
          disabled: disabledFloatingRef.value,
          placement: props.placement,
          strategy: props.strategy,
          middleware: middlewareRef.value,
          autoUpdate: props.autoUpdate
        },
        scopedSlots: {
          reference: (slotProps: FloatingSlotProps) => renderReference(slotProps),
          default: (slotProps: FloatingSlotProps) => renderPopup(slotProps)
        }
      })

      if (isVue3) {
        return h(FloatingComponent, data.props, data.scopedSlots as any)
      }

      return h(FloatingComponent, data)
    }
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
