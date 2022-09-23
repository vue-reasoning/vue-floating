import { provide, ref } from 'vue-demi'
import type { InjectionKey } from 'vue-demi'
import { safeInject } from '@visoning/vue-utility'

import type { ElementProps } from '../types'

export type InteractorType = HTMLElement | undefined | null

export interface InteractorForwardContextValue {
  setInteractor: (element?: InteractorType) => void
  setElementProps: (props?: ElementProps) => void
}

const injectionKey = Symbol(
  'InteractorForwardContextKey'
) as InjectionKey<InteractorForwardContextValue>

export function useInteractorForwardContext() {
  return safeInject(injectionKey)
}

export function createInteractorForwardContext() {
  const interactorRef = ref<InteractorType>()
  const elementPropsRef = ref<ElementProps>()

  provide(injectionKey, {
    setInteractor: (element) => (interactorRef!.value = element),
    setElementProps: (props) => (elementPropsRef.value = props)
  })

  return {
    interactor: interactorRef,
    elementProps: elementPropsRef
  }
}
