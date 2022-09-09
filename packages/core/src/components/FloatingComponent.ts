import {
  defineComponent,
  toRef,
  ref,
  computed,
  getCurrentInstance,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  watch
} from 'vue-demi'
import type { VNode } from 'vue-demi'

import { useFloating, useAutoUpdate } from '..'
import type { UseFloatingOptions } from '..'
import { FloatingComponentProps } from './FloatingComponent.types'

export const FloatingComponent = defineComponent({
  name: 'FloatingComponent',

  props: FloatingComponentProps,

  setup(props, { emit, slots, expose }) {
    //
    // Elements ====================================
    //

    const referenceRef = ref<HTMLElement>()
    const floatingRef = toRef(props, 'floatingNode')

    const currentInstance = getCurrentInstance()
    const updateReference = () => (referenceRef.value = currentInstance?.proxy?.$el as HTMLElement)

    onMounted(updateReference)
    onUpdated(updateReference)

    //
    // Floating ====================================
    //

    const useFloatingOptionsRef = computed<UseFloatingOptions>(() => {
      return {
        disabled: props.disabled,
        placement: props.placement,
        strategy: props.strategy,
        middleware: props.middleware
      }
    })

    const floatingReturn = useFloating(referenceRef, floatingRef, useFloatingOptionsRef)

    watch(
      floatingReturn.data,
      (data) => {
        emit('update', data)
      },
      {
        immediate: true
      }
    )

    //
    // AutoUpdate ====================================
    //

    const useAutoUpdateOptionsRef = computed(() => {
      const options = props.autoUpdate
      const disabled = !options || props.disabled
      return disabled ? { disabled: true } : typeof options === 'object' ? options : {}
    })

    const stopAutoUpdate = useAutoUpdate(
      referenceRef,
      floatingRef,
      floatingReturn.update,
      useAutoUpdateOptionsRef
    )

    // clear effects
    onBeforeUnmount(() => {
      stopAutoUpdate()
      floatingReturn.stop()
    })

    //
    // Expose ====================================
    //

    expose({
      floatingData: floatingReturn.data,
      update: floatingReturn.update
    })

    //
    // Rende ====================================
    //

    return () => {
      const floatingData = floatingReturn.data
      const reference = slots.reference && slots.reference(floatingData.value)[0]
      if (!reference) {
        return
      }

      const floating = slots.default && slots.default(floatingData.value)
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
