import {
  isVue3,
  computed,
  defineComponent,
  VNode,
  watch,
  h as createElement,
  watchEffect,
  getCurrentInstance
} from 'vue-demi'
import {
  cloneVNode,
  findFirstQualifiedChild,
  isArray,
  isComment,
  isFragment,
  isHandlerKey,
  isString,
  isText,
  MaybeArray,
  toListenerKey,
  useFirstQualifiedElement,
  useListeners
} from '@visoning/vue-utility'

import { InteractorProps } from './Interactor.types'
import type { InteractorExposed } from './Interactor.types'
import { useInteractorForwardContext } from './InteractorForwardContext'
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

    const interactorRef = useFirstQualifiedElement(
      getCurrentInstance(),
      (element) => element.nodeType === 1
    )

    // forwards
    const interactorForwardContext = useInteractorForwardContext()
    watch(interactorRef, (interactor) =>
      interactorForwardContext?.setInteractor(interactor)
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
        interactionsContext.setActive(active, {
          type: InteractorInteractionType
        })
      },
      {
        immediate: true
      }
    )

    const elementPropsRef = useInteractionElementProps(
      interactionsContext,
      props
    )

    watch(
      elementPropsRef,
      (props, prevProps) => {
        if (props !== prevProps) {
          interactorForwardContext?.setElementProps(props)
        }
      },
      {
        immediate: true
      }
    )

    watchEffect((cleanup) => {
      const { value: interactor } = interactorRef
      if (!interactor) {
        return
      }

      const { value: elementProps } = elementPropsRef
      const { interactor: interactorProps, target: TargetProps } = elementProps

      const depGraph = [
        {
          targets: [interactor],
          props: interactorProps
        },
        {
          targets: props.targets,
          props: TargetProps
        }
      ]

      const cleans: Function[] = []

      depGraph.forEach(({ targets, props }) => {
        targets?.forEach((target) => {
          if (!target) return
          for (const key in props) {
            const clean = usePropsEffect(target, key, props[key])
            clean && cleans.push(clean)
          }
        })
      })

      cleanup(() => cleans.forEach((clean) => clean()))
    })

    //
    // Exposed ====================================
    //

    const exposed: InteractorExposed = {
      getInteractor: () => interactorRef.value,
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

      return child
    }
  }
})

function findInteractorFirstLegitChild(children?: VNode[]) {
  return findFirstQualifiedChild(
    children,
    (child) => !isComment(child) && !isFragment(child)
  )
}

function usePropsEffect(target: Element, key: string, value: any) {
  if (isHandlerKey(key)) {
    return useListenersEffect(target, toListenerKey(key), value)
  } else {
    useAttrsEffect(target, key, value)
  }
}

function useListenersEffect(
  target: Element,
  event: string,
  listener: MaybeArray<(...args: any[]) => void>
) {
  const listeners = isArray(listener) ? listener : [listener]
  const cleans = listeners.map((listener) => {
    target.addEventListener(event, listener)
    return () => target.removeEventListener(event, listener)
  })
  return () => cleans.forEach((clean) => clean())
}

function useAttrsEffect(target: Element, attr: string, value: any) {
  target.setAttribute(attr, value)
  return () => target.removeAttribute(attr)
}
