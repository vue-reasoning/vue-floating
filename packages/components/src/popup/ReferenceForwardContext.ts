import { inject, provide, ref } from 'vue-demi'
import type { InjectionKey, Ref } from 'vue-demi'
import type { ReferenceType } from '@visoning/vue-floating-core'

export type ForwardReferenceType = ReferenceType | undefined

export interface ForwardReferenceContextValue {
  forwardReference: (reference: ForwardReferenceType) => void
}

const injectionKey = Symbol(
  'ForwardReferenceInjectionKey'
) as InjectionKey<ForwardReferenceContextValue>

const EMPTY_VALUE = {}

export const useSafeReferenceForwardContent = () => {
  // prevent Vue from console errors in dev
  const contextValue = inject(injectionKey, EMPTY_VALUE)
  return contextValue === EMPTY_VALUE
    ? undefined
    : (contextValue as ForwardReferenceContextValue)
}

export const useReferenceForwardContext = () => {
  const contextValue = useSafeReferenceForwardContent()
  if (!contextValue) {
    throw new Error(
      `injection "${String(
        injectionKey
      )}" not found; please ensure the component is wrapped in a <Provider>`
    )
  }
  return contextValue
}

export const providePopupContextValue = (
  contextValue: ForwardReferenceContextValue
) => {
  provide(injectionKey, contextValue)
}

export const createReferenceForwardContext = (
  referenceRef?: Ref<ForwardReferenceType>
) => {
  const referenceForwardRef = referenceRef || ref<ReferenceType>()

  providePopupContextValue({
    forwardReference: (reference) => (referenceForwardRef.value = reference)
  })

  return referenceForwardRef
}
