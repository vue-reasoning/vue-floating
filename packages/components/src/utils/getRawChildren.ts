import { isVue3, VNode } from 'vue-demi'
import Vue3 from 'vue'
import { createCompatElement } from './compat'

export const getRawChildren = isVue3
  ? // TODO: Vue3 transition may filter text nodes in the future, which is not what we want,
    // but for now at least it won't
    (children: any[]) => Vue3.getTransitionRawChildren(children as any, false /** ignore comment */)
  : (children: any[]) => children.filter((child) => !child.isComment)

export const isTextNode = isVue3
  ? (node: any) => node.type === Vue3.Text || node.type === 'svg' || typeof node !== 'object'
  : (node: any) => !node.tag

export const wrapTextNodeIfNeed = (node: VNode) => {
  if (node && !isTextNode(node)) {
    return node
  }
  return createCompatElement(
    'span',
    {
      data: {
        class: 'visoning-text-wrapper'
      }
    },
    [node]
  )
}