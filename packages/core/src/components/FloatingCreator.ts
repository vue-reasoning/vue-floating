import {
  defineComponent,
  computed,
  watch,
  toRef,
  onBeforeUnmount,
  getCurrentInstance
} from 'vue-demi'
import { isObject, useListeners } from '@visoning/vue-utility'

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

    const floatingControl = useFloating(
      referenceRef,
      floatingRef,
      useFloatingOptionsRef
    )

    const listeners = useListeners(getCurrentInstance())

    watch(floatingControl.data, (data) => {
      listeners.emit('onFloatingDataUpdate', data)
    })

    onBeforeUnmount(floatingControl.stop)

    //
    // AutoUpdate ====================================
    //

    const useAutoUpdateOptionsRef = computed<UseAutoUpdateOptions>(() => {
      const disabled = props.disabled || props.autoUpdate === false
      if (disabled) {
        return {
          disabled
        }
      }
      const { autoUpdate } = props
      return isObject(autoUpdate) ? autoUpdate : {}
    })

    const stopAutoUpdate = useAutoUpdate(
      referenceRef,
      floatingRef,
      floatingControl.update,
      useAutoUpdateOptionsRef
    )

    onBeforeUnmount(stopAutoUpdate)

    //
    // Expose ====================================
    //

    const exposed: FloatingCreatorExposed = {
      updatePosition: floatingControl.update,
      getFloatingData: () => floatingControl.data.value
    }

    expose(exposed)

    //
    // Render ====================================
    //

    return () => slots.default?.(floatingControl.data.value)
  }
})
