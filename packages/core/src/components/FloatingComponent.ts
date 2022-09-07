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

  setup(props, { slots, expose }) {
    const referenceRef = ref<HTMLElement>()
    const floatingRef = toRef(props, 'floatingNode')

    const currentInstance = getCurrentInstance()
    const updateReference = () => (referenceRef.value = currentInstance?.proxy?.$el as HTMLElement)

    onMounted(updateReference)
    onUpdated(updateReference)

    // Floating
    const UseFloatingOptionsRef = computed<UseFloatingOptions>(() => {
      return {
        placement: props.placement,
        strategy: props.strategy,
        middleware: props.middleware
      }
    })

    const { data, update, stop } = useFloating(referenceRef, floatingRef, UseFloatingOptionsRef)

    // Auto update
    let stopAutoUpdate: Function | null = null

    const clearAutoUpdate = () => {
      if (stopAutoUpdate) {
        stopAutoUpdate()
        stopAutoUpdate = null
      }
    }

    const createAutoUpdate = () => {
      if (!stopAutoUpdate) {
        const options = typeof props.autoUpdate === 'boolean' ? undefined : props.autoUpdate

        stopAutoUpdate = useAutoUpdate(referenceRef, floatingRef, update, options)
      }
    }

    watch(
      () => !!props.autoUpdate && (props.enabled || props.autoUpdateOnDisabled),
      (enabled) => (enabled ? createAutoUpdate() : clearAutoUpdate()),
      { immediate: true }
    )

    onBeforeUnmount(() => {
      stop()
      clearAutoUpdate()
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
