import { isVue3, h as createElement } from 'vue-demi'
import {
  isHandlerKey,
  normalizeListenerKeys,
  partition
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

  const [on, attrsOrProps] = partition(unkownProps, (_, key) =>
    isHandlerKey(key as string)
  )

  const { propKeys } = data
  const [attrs, props] = partition(
    attrsOrProps,
    (_, key) => !propKeys?.includes(key)
  )

  return createElement(
    tag,
    {
      key,
      ref,
      class: klass,
      style,
      props,
      attrs,
      scopedSlots: {
        ...scopedSlots,
        ...data.scopedSlots
      },
      on: normalizeListenerKeys(on)
    },
    children
  )
}
