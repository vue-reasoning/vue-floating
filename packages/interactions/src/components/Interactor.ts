import {
  isVue3,
  computed,
  defineComponent,
  ref,
  VNode,
  watch,
  h as createElement,
  watchEffect
} from 'vue-demi'
import {
  cloneVNode,
  findFirstQualifiedChild,
  isComment,
  isFragment,
  isHandlerKey,
  isString,
  isText,
  toListenerKey,
  useListeners
} from '@visoning/vue-utility'

import { InteractorProps } from './Interactor.types'
import type { InteractionExposed } from './Interactor.types'
import { useInteractorContext } from './InteractorForwardContext'
import { useInteractionElementProps } from './useInteractions'

import { useInteractionsContext } from '../useInteractionsContext'
import type { BaseInteractionInfo } from '../types'

export const InteractorInteractionType = 'InteractorProps'

export const classNames = {
  textWrapper: 'visoning-text-wrapper'
}

export const Interactor = defineComponent({
  name: 'Interactor',

  inheritAttrs: false,

  props: InteractorProps,

  setup(props, { slots, attrs, expose }) {
    const listeners = useListeners()

    const setActive = (value: boolean, info?: BaseInteractionInfo) => {
      if (value !== props.active) {
        listeners.emit('onUpdate:active', value, info)
        listeners.emit(value ? 'active' : 'inactive', info)
      }
    }

    //
    // Slots ====================================
    //

    const firstLegitChildRef = ref<VNode | null>(null)
    const interactorRef = computed(() =>
      findInteractorRealElement(firstLegitChildRef.value)
    )

    // forwards
    const interactorContext = useInteractorContext()
    watch(interactorRef, (interactor) =>
      interactorContext?.setInteractor(interactor)
    )

    //
    // Interactions ====================================
    //

    const interactionsContext = useInteractionsContext(
      interactorRef,
      computed(() => ({
        targets: props.targets
      }))
    )

    watch(interactionsContext.active, (active) =>
      setActive(active, interactionsContext.activeInfo.value.final)
    )

    watch(
      () => props.active,
      (active) => {
        if (!!active !== interactionsContext.active.value) {
          interactionsContext.setActive(!!active, {
            type: InteractorInteractionType
          })
        }
      },
      {
        immediate: true
      }
    )

    const elementPropsRef = useInteractionElementProps(
      interactionsContext,
      computed(() => props)
    )

    watchEffect(() => {
      const { value: interactor } = interactorRef
      if (!interactor) {
        return
      }

      const { value: elementProps } = elementPropsRef
      const interactorProps = elementProps.interactor

      const effects: Function[] = []

      for (const key in interactorProps) {
        const value = interactorProps[key]
        if (isHandlerKey(key)) {
          effects.push(
            useListenersEffect(interactor, toListenerKey(key), value)
          )
        } else {
          effects.push(useAttrsEffect(interactor, key, value))
        }
      }

      return () => effects.forEach((clear) => clear())
    })

    //
    // Exposed ====================================
    //

    const exposed: InteractionExposed = {
      getElementProps: () => elementPropsRef.value
    }

    expose(exposed)

    //
    // Render ====================================
    //

    return () => {
      const children = slots.default?.()

      let child = findInteractorFirstLegitChild(children)
      if (!child) {
        firstLegitChildRef.value = null
        return
      }

      child = cloneVNode(child, { ...(isVue3 ? attrs : { attrs }) })

      // support text node
      if (isText(child!) || isString(child)) {
        child = createElement(
          'span',
          {
            class: classNames.textWrapper
          },
          [child]
        )
      }

      firstLegitChildRef.value = child

      return child
    }
  }
})

export function getVNodeElement<T extends Element>(
  vnode: any
): T | null | undefined {
  return isVue3 ? vnode.el : vnode.elm
}

function findInteractorRealElement(
  root?: VNode | null
): HTMLElement | null | undefined {
  const vnode =
    root &&
    findFirstQualifiedChild(
      [root],
      (vnode) => getVNodeElement(vnode)?.nodeType === 1
    )
  return vnode && getVNodeElement(vnode)
}

function findInteractorFirstLegitChild(children?: VNode[]) {
  return findFirstQualifiedChild(
    children,
    (child) => !isComment(child) && !isFragment(child)
  )
}

function useListenersEffect(
  target: Element,
  event: string,
  listener: (...args: any[]) => void
) {
  target.addEventListener(event, listener)
  return () => target.removeEventListener(event, listener)
}

function useAttrsEffect(target: Element, attr: string, value: any) {
  target.setAttribute(attr, value)
  return () => target.removeAttribute(attr)
}
