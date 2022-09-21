import {
  defineComponent,
  computed,
  watch,
  toRef,
  onBeforeUnmount,
  getCurrentInstance
} from 'vue-demi'
import { useListeners } from '@visoning/vue-utility'

import { useFloating, useAutoUpdate } from '..'
import type { UseFloatingOptions, UseAutoUpdateOptions } from '..'
import {
  FloatingCreatorExposed,
  FloatingCreatorProps
} from './FloatingCreator.types'

export const FloatingCreator = defineComponent({
  name: 'FloatingCreator',

  inheritAttrs: false,

  props: FloatingCreatorProps,

  setup(props, { slots, expose }) {
    //
    // Elements ====================================
    //

    const referenceRef = toRef(props, 'reference')
    const floatingRef = toRef(props, 'floating')

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

    const {
      data: floatingDataRef,
      update: updatePosition,
      stop: stopFloating
    } = useFloating(referenceRef, floatingRef, useFloatingOptionsRef)

    const listeners = useListeners(getCurrentInstance())

    watch(floatingDataRef, (data) => {
      listeners.emit('onFloatingDataUpdate', data)
    })

    onBeforeUnmount(stopFloating)

    //
    // AutoUpdate ====================================
    //

    const useAutoUpdateOptionsRef = computed<UseAutoUpdateOptions>(() => {
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
      referenceRef,
      floatingRef,
      updatePosition,
      useAutoUpdateOptionsRef
    )

    onBeforeUnmount(stopAutoUpdate)

    //
    // Expose ====================================
    //

    const exposed: FloatingCreatorExposed = {
      updatePosition,
      getFloatingData: () => floatingDataRef.value
    }

    expose(exposed)

    //
    // Render ====================================
    //

    return () => slots.default?.(floatingDataRef.value)
  }
})
