import { isVue3, Vue2, h } from 'vue-demi'
import { createApp } from 'vue'

import { identity } from './identity'
import { isOn } from './isOn'
import { mergeListeners } from './mergeProps'

export interface CompatVNodeData {
  data: Record<string, any>
  scopedSlots?: Record<string, any>
}

export function createElement(
  tag: any,
  data: CompatVNodeData,
  children?: any
): ReturnType<typeof h> {
  const { data: compatData, scopedSlots } = data
  const normalizedChildren = Array.isArray(children) ? children : [children]

  if (isVue3) {
    return h(
      tag,
      compatData,
      scopedSlots
        ? ({
            ...scopedSlots,
            default: () => normalizedChildren.concat(scopedSlots.default?.())
          } as any)
        : normalizedChildren
    )
  }

  const legacyReserveKeys = ['key', 'ref', 'tag', 'class', 'style', 'attrs', 'directives']
  const transformData: Record<string, any> = {}

  for (const key in compatData) {
    if (isOn(key)) {
      transformData.on = mergeListeners(
        transformData.on,
        transformListeners({
          [key]: compatData[key]
        })
      )
    } else if (legacyReserveKeys.includes(key)) {
      transformData[key] = compatData[key]
    } else {
      ;(transformData.props || (transformData.props = {}))[key] = compatData[key]
    }
  }

  if (scopedSlots) {
    for (const key in scopedSlots) {
      ;(transformData.scopedSlots || (transformData.scopedSlots = {}))[key] = scopedSlots[key]
    }
  }

  return h(tag, transformData, normalizedChildren)
}

export const transformListeners = isVue3
  ? identity
  : (listeners: Record<string, any>) => {
      return Object.entries(listeners).reduce((listeners, [key, value]) => {
        if (isOn(key)) {
          key = key.replace(/^on-?/, '')
          key = key.charAt(0).toLowerCase() + key.slice(1)
        }
        listeners[key] = value
        return listeners
      }, {} as Record<string, any>)
    }

export interface VueMountProxy {
  readonly $el: Element | null
  readonly isMounted: boolean
  mount: (container?: Element | string) => void
  unmount: () => void
}

export const createVueMountProxy = (options?: any): VueMountProxy => {
  const proxy = {} as VueMountProxy

  if (isVue3) {
    const app = createApp(options)
    const v3Instance = app._instance!

    proxy.mount = (container) => app.mount(container as any)
    proxy.unmount = () => app.unmount()

    Object.defineProperties(proxy, {
      $el: {
        configurable: true,
        get() {
          return v3Instance.proxy?.$el
        }
      },
      isMounted: {
        configurable: true,
        get() {
          return v3Instance.isMounted
        }
      }
    })
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
