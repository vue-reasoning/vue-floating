import {
  isVue2,
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
import * as Vue from 'vue'
import { useFloating, useAutoUpdate } from '@visoning/vue-floating-core'
import type { UseFloatingOptions } from '@visoning/vue-floating-core'

import { FloatingComponentProps } from './FloatingComponent.types'

export const FloatingComponent = defineComponent({
  name: 'FloatingComponent',

  props: FloatingComponentProps,

  setup(props, { slots, expose }) {
    const referenceRef = ref<HTMLDivElement>()
    const floatingRef = toRef(props, 'floatingNode')

    const currentInstance = getCurrentInstance()
    const updateReference = () => (referenceRef.value = currentInstance?.proxy?.$el)

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

    const createAutoUpdate = () => {
      if (!stopAutoUpdate) {
        const options = typeof props.autoUpdate === 'boolean' ? undefined : props.autoUpdate

        stopAutoUpdate = useAutoUpdate(referenceRef, floatingRef, update, options)
      }
    }

    const clearAutoUpdate = () => {
      if (stopAutoUpdate) {
        stopAutoUpdate()
        stopAutoUpdate = null
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

    expose({
      update
    })

    // Render
    return () => {
      const reference = slots.reference && getFloatingRealChild(slots.reference(data.value))
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

interface Vue2Vnode {
  tag: any
  isComment?: boolean
  asyncFactory?: boolean
}

const isNotTextNode = isVue2
  ? (child: Vue2Vnode) => child.tag || (child.isComment && child.asyncFactory)
  : (child: VNode) => child.type !== Vue.Comment

function getFloatingRealChild(children: VNode[]): VNode | undefined {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isNotTextNode(child as any)) {
      return child
    }
  }
}
