import { isVue3, h as createElement } from 'vue-demi'
import {
  isHandlerKey,
  normalizeListenerKeys,
  partition,
  pick
} from '@visoning/vue-utility'

export interface CompatVNodeData {
  data: Record<string, any>
  scopedSlots?: Record<string, any>
  propKeys?: string[]
}

export function createCompatElement(
  tag: any,
  data: CompatVNodeData,
  children?: any
): ReturnType<typeof createElement> {
  children = Array.isArray(children) ? children : [children]

  if (isVue3) {
    return createElement(
      tag,
      data.data,
      data.scopedSlots
        ? ({
            ...data.scopedSlots,
            default: (...args: any[]) =>
              children.concat(data.scopedSlots?.default?.(...args))
          } as any)
        : children
    )
  }

  const {
    key,
    ref,
    class: klass,
    style,
    scopedSlots,
    ...unkownProps
  } = data.data

  const [onKeys, attrsOrPropsKeys] = partition(
    Object.keys(unkownProps),
    (key) => isHandlerKey(key)
  )

  const { propKeys } = data
  const [attrsKeys, propsKeys] = partition(
    attrsOrPropsKeys,
    (key) => !propKeys?.includes(key)
  )

  return createElement(
    tag,
    {
      key,
      ref,
      class: klass,
      style,
      props: pick(unkownProps, propsKeys),
      attrs: pick(unkownProps, attrsKeys),
      scopedSlots: {
        ...scopedSlots,
        ...data.scopedSlots
      },
      on: normalizeListenerKeys(pick(unkownProps, onKeys))
    },
    children
  )
}
