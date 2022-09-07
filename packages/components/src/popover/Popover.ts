import {
  defineComponent,
  ref,
  computed,
  h,
  VNode,
  unref,
  onMounted,
  onUpdated,
  getCurrentInstance,
  isVue3,
  watch
} from 'vue-demi'
import * as Vue from 'vue'
import type { Middleware } from '@visoning/vue-floating-core'
import { FloatingComponent } from '@visoning/vue-floating-core/components'
import type { FloatingSlotProps } from '@visoning/vue-floating-core/components'
import {
  ElementProps,
  useClick,
  useFocus,
  useHover,
  useInteractionsContext
} from '@visoning/vue-floating-interactions'

import { Interaction, PopoverProps } from './Popover.types'
import { mergeListeners, mergeProps } from '../utils/mergeProps'
import { transformListeners, transformLegacyVNodeData } from '../utils/compat'
import { isOn } from '../utils/isOn'

let uid = 0

export const Popover = defineComponent({
  name: 'Popover',

  props: PopoverProps,

  setup(props, { emit, slots }) {
    const id = `__visoning_popover_${uid++}`

    // Controlled state
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

    // Interactions props
    const referenceRef = ref<HTMLElement>()
    const floatingRef = ref<HTMLElement>()

    const interactionsContext = useInteractionsContext(referenceRef, floatingRef)

    watch(interactionsContext.open, (open) => {
      console.log(open)
      mergedOpenRef.value = open
    })

    const interactionsRef = computed(() => props.interactions || [])

    const hasInteraction = (interaction: Interaction) => interactionsRef.value.includes(interaction)

    const hoverPropsRef = useHover(
      interactionsContext,
      computed(() => ({
        disabled: !hasInteraction('hover'),
        delay: props.hoverDelay
      }))
    )

    const focusPropsRef = useFocus(
      interactionsContext,
      computed(() => ({
        disabled: !hasInteraction('focus'),
        delay: props.focusDelay
      }))
    )

    const clickPropsRef = useClick(
      interactionsContext,
      computed(() => ({
        disabled: !hasInteraction('click'),
        delay: props.clickDelay
      }))
    )

    const elementPropsRef = computed<ElementProps>(() => {
      const elementProps = [hoverPropsRef, focusPropsRef, clickPropsRef].map(unref)
      return {
        reference: mergeProps(...elementProps.map((props) => props.reference)),
        floating: mergeProps(...elementProps.map((props) => props.floating))
      }
    })

    // Render
    const middlewaresRef = ref<Middleware[]>([])

    const enabledFloatingRef = computed(
      () => !props.disabled && (mergedOpenRef.value || props.autoUpdateOnClosed)
    )

    const currentInstance = getCurrentInstance()
    const updateReference = () => {
      referenceRef.value = currentInstance?.proxy?.$el as HTMLElement
    }

    onMounted(updateReference)
    onUpdated(updateReference)

    const renderFloating = (slotProps: FloatingSlotProps) => {
      const { floatingWrapper } = props
      const { value: mergedOpen } = mergedOpenRef

      let floating: VNode | null = null
      if (mergedOpen || !props.destoryedOnClosed) {
        const data = transformLegacyVNodeData({
          props: {
            ...mergeProps(props.floatingProps, elementPropsRef.value.floating),
            key: id,
            ref: floatingRef,
            directives: [
              {
                name: 'show',
                value: mergedOpen
              }
            ]
          }
        })
        floating = h('div', data.props, slots.default?.(slotProps))
      }

      return floatingWrapper ? floatingWrapper(floating) : floating
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
        if (!reference.data) {
          reference.data = reference.data || {}
        }
        const {
          class: kls,
          style,
          ...mergedProps
        } = mergeProps(
          {
            ...reference.data.attrs,
            class: reference.data.class,
            style: reference.data.style
          },
          elementPropsRef.value.reference
        )

        reference.data.class = kls
        reference.data.style = style

        const on: Record<string, any> = {}
        const attrs: Record<string, any> = {}
        for (const key in mergedProps) {
          if (isOn(key)) {
            on[key] = mergedProps[key]
          } else {
            attrs[key] = mergedProps[key]
          }
        }

        reference.data.props = attrs
        reference.data.on = mergeListeners(reference.data.on, transformListeners(on))
      }

      return reference
    }

    return () => {
      const data = transformLegacyVNodeData({
        props: {
          enabled: enabledFloatingRef.value,
          floatingNode: floatingRef.value,
          placement: props.placement,
          strategy: props.strategy,
          middlewares: middlewaresRef.value,
          autoUpdate: props.autoUpdate
        },
        scopedSlots: {
          reference: (slotProps: FloatingSlotProps) => renderReference(slotProps),
          default: (slotProps: FloatingSlotProps) => renderFloating(slotProps)
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
  ? (child: { type: any }) => child.type !== (Vue as any).Comment
  : (child: VNode) => child.tag || (child.isComment && (child as any).asyncFactory)

function getPopoverRealChild(children: VNode[]): VNode | undefined {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isNotTextNode(child as any)) {
      return child
    }
  }
}
