import type { ReferenceType } from '@visoning/vue-floating-core'
import type { DeepReadonly, Ref } from 'vue-demi'

export type MaybeRef<T> = T | Ref<T>

export interface ElementRefs<RT extends ReferenceType = ReferenceType> {
  reference: Readonly<Ref<RT | null | undefined>>
  floating: Ref<HTMLElement | null | undefined>
}

export type DelayType = 'open' | 'close'
export type Delay = number | Partial<Record<DelayType, number>> | undefined

export interface InteractionInfo {
  type: string | null
  event: Event | null
}

export const makeInteractionInfoFactory =
  <T extends InteractionInfo = InteractionInfo>(type: InteractionInfo['type']) =>
  (event: T['event']): T =>
    ({
      type,
      event
    } as T)

export interface InteractionsContext<
  RT extends ReferenceType = ReferenceType,
  Info extends InteractionInfo = InteractionInfo
> {
  open: Readonly<Ref<boolean>>
  setOpen: (open: boolean, info?: Info) => void
  info: DeepReadonly<Ref<Info>>
  refs: ElementRefs<RT>
}

export interface ElementProps {
  reference?: Record<string, any>
  floating?: Record<string, any>
}
