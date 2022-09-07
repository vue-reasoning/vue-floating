import {
  defineComponent,
  toRef,
  ref,
  computed,
  watch,
  getCurrentInstance,
  onMounted,
  onUpdated,
  onBeforeUnmount
} from 'vue-demi'
import type { VNode } from 'vue-demi'

import { useFloating, useAutoUpdate } from '..'
import type { UseFloatingOptions } from '..'
import { FloatingComponentProps } from './FloatingComponent.types'

export const FloatingComponent = defineComponent({
  name: 'FloatingComponent',

  props: FloatingComponentProps,

  setup(props, { emit, slots, expose }) {
    const referenceRef = ref<HTMLElement>()
    const floatingRef = toRef(props, 'floatingNode')

    const currentInstance = getCurrentInstance()
    const updateReference = () => (referenceRef.value = currentInstance?.proxy?.$el as HTMLElement)

    onMounted(updateReference)
    onUpdated(updateReference)

    // Floating
    const UseFloatingOptionsRef = computed<UseFloatingOptions>(() => {
      return {
        disabled: !!props.disabled,
        placement: props.placement,
        strategy: props.strategy,
        middleware: props.middleware,
        onUpdate: () => emit('update')
      }
    })

    const { data, update, stop } = useFloating(referenceRef, floatingRef, UseFloatingOptionsRef)

    // Auto update
    const stopAutoUpdate = useAutoUpdate(
      referenceRef,
      floatingRef,
      update,
      computed(() => {
        const options = props.autoUpdate
        return !!options === false || props.disabled
          ? { disabled: true }
          : typeof options === 'object'
          ? options
          : {}
      })
    )

    onBeforeUnmount(() => {
      stop()
      stopAutoUpdate()
    })

    // Expose
    expose({
      floating: {
        update,
        data
      }
    })

    // Render
    return () => {
      const reference = slots.reference && slots.reference(data.value)[0]
      if (!reference) {
        return
      }

      const floating = slots.default && slots.default(data.value)
      if (floating && floating.length) {
        const children = (
          Array.isArray(reference.children) ? reference.children : [reference.children]
        ) as Array<VNode | VNode[]>

        children.push(floating[0])
      }

      return reference
    }
  }
})
