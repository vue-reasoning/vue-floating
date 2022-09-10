import { isVue3, Vue2, h } from 'vue-demi'
import { createApp } from 'vue'

import { mergeListeners } from './mergeProps'
import { isOn, normalizeOn } from './on'

export interface CompatVNodeData {
  data: Record<string, any>
  scopedSlots?: Record<string, any>
  propsKey?: 'props' | 'attrs'
}

export function createCompatElement(
  tag: any,
  data: CompatVNodeData,
  children?: any
): ReturnType<typeof h> {
  children = Array.isArray(children) ? children : [children]

  let propsKey = data.propsKey

  if (!propsKey && !isVue3) {
    // TODO: Vue2's vnode data allocation is not smart,
    // we can only decide whether to keys other than
    // reserved keys to "props" or "attrs" through simple tag type judgment
    if (typeof tag === 'string') {
      const imitation = h(tag) as any
      if (typeof imitation.tag === 'string' && imitation.tag.indexOf('vue-component') !== 0) {
        propsKey = 'attrs'
      }
    }

    if (!propsKey) {
      propsKey = 'props'
    }
  }

  const { data: compatData, scopedSlots } = data

  if (isVue3) {
    return h(
      tag,
      compatData,
      scopedSlots
        ? ({
            ...scopedSlots,
            default: (...args: any[]) => children.concat(scopedSlots.default?.(...args))
          } as any)
        : children
    )
  }

  const legacyReserveKeys = [
    'key',
    'ref',
    'tag',
    'class',
    'style',
    'directives',
    'slots',
    'scopedSlots'
  ]
  const transformData: Record<string, any> = {}

  // make sure it is faster than "comsumed" handler
  if ('attrs' in compatData) {
    transformData.attrs = compatData.attrs
  }

  for (const key in compatData) {
    if (isOn(key)) {
      transformData.on = mergeListeners(transformData.on, {
        [normalizeOn(key)]: compatData[key]
      })
    } else if (legacyReserveKeys.includes(key)) {
      transformData[key] = compatData[key]
    } else {
      ;(transformData[propsKey!] || (transformData[propsKey!] = {}))[key] = compatData[key]
    }
  }

  if (scopedSlots) {
    for (const key in scopedSlots) {
      ;(transformData.scopedSlots || (transformData.scopedSlots = {}))[key] = scopedSlots[key]
    }
  }

  return h(tag, transformData, children)
}

export interface VueMountProxy {
  readonly $el: Element | null
  readonly isMounted: boolean
  mount: (container?: Element | string) => void
  unmount: () => void
}

export const createSimpleCompatVueInstance = (options?: any): VueMountProxy => {
  const proxy = {} as VueMountProxy

  if (isVue3) {
    const app = createApp(options)
    let v3Instance: any

    proxy.mount = (container) =>
      // Vue3 must have a mounted container
      (v3Instance = app.mount(container || document.createElement('div')))
    proxy.unmount = () => app.unmount()

    Object.defineProperties(proxy, {
      $el: {
        configurable: true,
        get() {
          return v3Instance?.$el
        }
      },
      isMounted: {
        configurable: true,
        get() {
          return !!v3Instance?.isMounted
        }
      }
    })

    return proxy
  }

  const v2Instance = new Vue2!(options)

  proxy.mount = (container) => v2Instance.$mount(container)
  proxy.unmount = () => {
    v2Instance.$destroy()
    v2Instance.$el.remove()
  }

  Object.defineProperties(proxy, {
    $el: {
      configurable: true,
      get() {
        return v2Instance.$el
      }
    },
    isMounted: {
      configurable: true,
      get() {
        return (v2Instance as any)._isMounted
      }
    }
  })

  return proxy
}
