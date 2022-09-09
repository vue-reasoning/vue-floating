import {
  defineComponent,
  toRef,
  ref,
  computed,
  getCurrentInstance,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  watch,
  isVue3
} from 'vue-demi'
import { cloneVNode } from 'vue'

import { useFloating, useAutoUpdate } from '..'
import type { UseFloatingOptions, UseAutoUpdateOptions, ReferenceType } from '..'
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

    const referenceRef = ref<ReferenceType>()
    const floatingRef = toRef(props, 'floatingNode')

    if (!isVue3) {
      // in Vue2, we can safely put floating nodes in reference children,
      // so we can use $el to update
      const currentInstance = getCurrentInstance()
      const updateReference = () => {
        referenceRef.value = currentInstance?.proxy?.$el as HTMLElement
      }

      onMounted(updateReference)
      onUpdated(updateReference)
    }

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

    const floatingReturn = useFloating(
      computed(() => props.referenceNode || referenceRef.value),
      floatingRef,
      useFloatingOptionsRef
    )

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
          return [
            cloneVNode(reference, {
              ref: referenceRef
            }),
            ...floating
          ]
          // Or, this ensures that Vue2 behaves like Vue3
          // but I'm not sure if there is any unpredictable error
          // const TEXT_CHILDREN = 1 << 3
          // const ARRAY_CHILDREN = 1 << 4
          // if (reference.shapeFlag & TEXT_CHILDREN) {
          //   reference.shapeFlag /= TEXT_CHILDREN
          //   reference.shapeFlag |= ARRAY_CHILDREN
          // }
        }

        reference.children = [reference.children].concat(floating) as any
      }

      return reference
    }
  }
})
