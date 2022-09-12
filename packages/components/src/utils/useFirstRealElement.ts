import { getCurrentInstance, isVue3, onMounted, onUpdated, ref } from 'vue-demi'

const isRealElement = (element: unknown): element is HTMLElement =>
  Boolean(element && (element as any).nodeType === 1)

export function useFirseRealElement(instance: ReturnType<typeof getCurrentInstance>) {
  const realElementRef = ref<HTMLElement | null>(null)

  let updateRealElementRef: () => void

  if (isVue3) {
    updateRealElementRef = () => {
      const vnode = instance?.vnode
      realElementRef.value = (vnode && getFirstRealElementFormVNode([vnode])) || null
    }
  } else {
    // because Vue2 supports element hoisting for HOC, so we can do this
    updateRealElementRef = () => {
      const $el = instance?.proxy?.$el
      realElementRef.value = isRealElement($el) ? $el : null
    }
  }

  onMounted(updateRealElementRef)
  onUpdated(updateRealElementRef)

  return realElementRef
}

// Copied from Vue
const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

function getFirstRealElementFormVNode(vnodes: any[]): HTMLElement | undefined {
  for (let i = 0; i < vnodes.length; i++) {
    const vnode = vnodes[i]
    if (vnode.type === Comment || vnode.type === Text) continue
    if (isRealElement(vnode.el)) {
      return vnode.el
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT && vnode.component?.subTree) {
      return getFirstRealElementFormVNode([vnode.component?.subTree])
    } else if (Array.isArray(vnode.children)) {
      return getFirstRealElementFormVNode(vnode.children)
    }
  }
}
