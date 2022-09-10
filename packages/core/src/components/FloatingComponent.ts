import { defineComponent, toRef, computed, onBeforeUnmount, watch, isVue3 } from 'vue-demi'

import { useFloating, useAutoUpdate } from '..'
import type { UseFloatingOptions, UseAutoUpdateOptions } from '..'
import { FloatingComponentProps } from './FloatingComponent.types'

export const FloatingComponent = defineComponent({
  name: 'FloatingComponent',

  props: FloatingComponentProps,

  // TODO: We promoted floating to be the same DOM level as reference in Vue3,
  // so here it needs to be set to true
  inheritAttrs: !isVue3,

  setup(props, { emit, slots, expose }) {
    //
    // Elements ====================================
    //

    const referenceRef = toRef(props, 'referenceNode')
    const floatingRef = toRef(props, 'floatingNode')

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

    watch(floatingReturn.data, (data) => emit('update', data), {
      immediate: true
    })

    //
    // AutoUpdate ====================================
    //

    const autoUpdateOptionsRef = computed<UseAutoUpdateOptions>(() => {
      const options = props.autoUpdate

      const disabled = !options || props.disabled
      if (disabled) {
        return {
          disabled: true
        }
      }

      return typeof options === 'object' ? options : {}
    })

    const stopAutoUpdate = useAutoUpdate(
      computed(() => props.referenceNode || referenceRef.value),
      floatingRef,
      floatingReturn.update,
      autoUpdateOptionsRef
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

      const reference = slots.reference?.(floatingData.value)[0]
      if (!reference) {
        return
      }

      const floating = slots.default?.(floatingData.value)
      if (floating) {
        if (isVue3) {
          return [reference, floating]
          // Or, this ensures that Vue2 behaves like Vue3
          // but I'm not sure if there is any unpredictable error
          // const TEXT_CHILDREN = 1 << 3
          // const ARRAY_CHILDREN = 1 << 4
          // if (reference.shapeFlag & TEXT_CHILDREN) {
          //   reference.shapeFlag /= TEXT_CHILDREN
          //   reference.shapeFlag |= ARRAY_CHILDREN
          // }
        }

        reference.children = [reference.children].concat(floating).flat() as any
      }

      return reference
    }
  }
})
