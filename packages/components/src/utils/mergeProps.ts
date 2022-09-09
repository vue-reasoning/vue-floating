import { isVue2 } from 'vue-demi'
import { mergeProps as _mergeProps } from 'vue'

import { isOn } from './compat'

// Copied from Vue

type MergeProps = (...props: (Record<string, any> | undefined)[]) => Record<string, any>

export const mergeProps: MergeProps = isVue2
  ? (...args) => {
      const ret: Record<string, any> = {}
      for (let i = 0; i < args.length; i++) {
        const toMerge = args[i]
        for (const key in toMerge) {
          if (key === 'class') {
            if (ret.class !== toMerge.class) {
              ret.class = normalizeClass([ret.class, toMerge.class])
            }
          } else if (key === 'style') {
            ret.style = normalizeStyle([ret.style, toMerge.style])
          } else if (isOn(key)) {
            Object.assign(ret, mergeListeners(ret, toMerge))
          } else if (key !== '') {
            ret[key] = toMerge[key]
          }
        }
      }
      return ret
    }
  : (_mergeProps as MergeProps)

export function mergeListeners(...args: (Record<string, any> | undefined)[]) {
  const ret: Record<string, Function[]> = {}
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i]
    for (let key in toMerge) {
      const existing = ret[key]
      const incoming = toMerge[key]
      if (
        incoming &&
        existing !== incoming &&
        !(isArray(existing) && existing.includes(incoming))
      ) {
        ret[key] = existing ? [].concat(existing as any, incoming as any).flat() : incoming
      }
    }
  }
  return ret
}

const isArray = Array.isArray
const isString = (val: unknown): val is string => typeof val === 'string'
const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

type NormalizedStyle = Record<string, string | number>

function normalizeStyle(value: unknown): NormalizedStyle | string | undefined {
  if (isArray(value)) {
    const res: NormalizedStyle = {}
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const normalized = isString(item)
        ? parseStringStyle(item)
        : (normalizeStyle(item) as NormalizedStyle)
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key]
        }
      }
    }
    return res
  } else if (isString(value)) {
    return value
  } else if (isObject(value)) {
    return value
  }
}

const listDelimiterRE = /;(?![^(]*\))/g
const propertyDelimiterRE = /:(.+)/

function parseStringStyle(cssText: string): NormalizedStyle {
  const ret: NormalizedStyle = {}
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE)
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return ret
}

function normalizeClass(value: unknown): string {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    res += value.map(normalizeClass).join(' ')
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + ' '
      }
    }
  }
  return res.trim()
}
