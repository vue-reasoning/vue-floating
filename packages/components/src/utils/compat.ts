import { isVue3, h as createElement } from 'vue-demi'
import { isHandlerKey, toListenerKey } from '@visoning/vue-utility'

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

  const on: Record<string, any> = {}
  const attrs: Record<string, any> = {}
  const props: Record<string, any> = {}
  const { propKeys } = data

  for (const key in unkownProps) {
    if (isHandlerKey(key)) {
      on[toListenerKey(key)] = unkownProps[key]
    } else if (propKeys?.includes(key)) {
      props[key] = unkownProps[key]
    } else {
      attrs[key] = unkownProps[key]
    }
  }

  return createElement(
    tag,
    {
      key,
      ref,
      class: klass,
      style,
      props,
      attrs,
      on,
      scopedSlots: {
        ...scopedSlots,
        ...data.scopedSlots
      }
    },
    children
  )
}
