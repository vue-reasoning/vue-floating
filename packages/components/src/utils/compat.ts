import { isVue3, Vue2 } from 'vue-demi'
import { createApp } from 'vue'
import { identity } from './identity'
import { isOn } from './isOn'
import { mergeListeners } from './mergeProps'

interface TransformData {
  props: Record<string, any>
  scopedSlots?: Record<string, any>
}

type TransformVNodeData = (data: TransformData) => Required<TransformData>

export const transformLegacyVNodeData = isVue3
  ? (identity as TransformVNodeData)
  : (data: TransformData) => {
      const ret: Required<TransformData> = {
        props: {},
        scopedSlots: {}
      }

      const { props, scopedSlots } = data

      for (let key in props) {
        if (isOn(key)) {
          // Floating only listen to the DOM
          ret.props.on = mergeListeners(
            ret.props.on,
            transformListeners({
              [key]: props[key]
            })
          )
        } else {
          ret.props[key] = props[key]
        }
      }

      if (scopedSlots) {
        for (const key in scopedSlots) {
          const slot = scopedSlots[key]
          ret.scopedSlots[key] = typeof slot === 'function' ? slot : () => slot
        }
      }

      return ret
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
  console.log(v2Instance)
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
