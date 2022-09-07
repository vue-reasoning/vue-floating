import { isVue3 } from 'vue-demi'
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
