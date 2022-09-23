import { provide, ref } from 'vue-demi'
import type { InjectionKey, Ref } from 'vue-demi'
import { safeInject } from '@visoning/vue-utility'

export type InteractorType = HTMLElement | undefined | null

export interface InteractorForwardContextValue {
  setInteractor: (element?: InteractorType) => void
}

const injectionKey = Symbol(
  'InteractorContextKey'
) as InjectionKey<InteractorForwardContextValue>

export function useInteractorContext() {
  return safeInject(injectionKey)
}

export function contributeInteractor(element: InteractorType) {
  useInteractorContext()?.setInteractor(element)
}

export function createInteractorForwardContext(
  interactor?: Ref<InteractorType>
) {
  const interactorRef: Ref<InteractorType> = interactor || ref()

  provide(injectionKey, {
    setInteractor: (element) => (interactorRef!.value = element)
  })

  return interactorRef
}
