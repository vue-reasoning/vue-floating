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
import { FloatingComponentExpose, FloatingComponentProps } from './FloatingComponent.types'

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

    const UseFloatingOptionsRef = computed<UseFloatingOptions>(() => {
      return {
        disabled: props.disabled,
        placement: props.placement,
        strategy: props.strategy,
        middleware: props.middleware
      }
    })

    const {
      data,
      update,
      stop: stopFloating
    } = useFloating(referenceRef, floatingRef, UseFloatingOptionsRef)

    watch(
      data,
      () => {
        emit('update', data.value)
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

    const stopAutoUpdate = useAutoUpdate(referenceRef, floatingRef, update, useAutoUpdateOptionsRef)

    // clear effects
    onBeforeUnmount(() => {
      stopAutoUpdate()
      stopFloating()
    })

    //
    // Expose ====================================
    //

    const exposes: FloatingComponentExpose = {
      floating: {
        update,
        data
      }
    }
    expose(exposes)

    //
    // Rende ====================================
    //

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
