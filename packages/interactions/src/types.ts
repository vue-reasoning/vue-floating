import type { Ref } from 'vue-demi'
import type { ReferenceType } from '@visoning/vue-floating-core'

export type MaybeRef<T> = T | Ref<T>

export interface ElementRefs<RT extends ReferenceType = ReferenceType> {
  reference: Readonly<Ref<RT | null | undefined>>
  floating: Ref<HTMLElement | null | undefined>
}

export const InitialInteractionType = '__$$it__initial'
export const UnkownInteractionType = '__$$it__unkown'

/**
 * The info of action that finally sets open.
 */
export interface InteractionInfo {
  type: string
  event?: Event | null
}

/**
 * The info of action that the last attempt to sets open,
 * but it may not finally set the open state.
 */
export interface LastInteractionInfo {
  triggerType: string
  triggerEvent?: Event | null
}

export type Delay = number

export type InteractionDelayType = 'open' | 'close'
export type InteractionDelay =
  | Delay
  | Partial<Record<'open' | 'close', Delay>>
  | undefined

export interface InteractionDelayInfo<T extends string = string> {
  type?: T
  delay: number
  nextOpen: boolean
}

export interface DelayControl<Info extends InteractionInfo> {
  setOpen: (delay: number, open: boolean, info?: Info) => void
  info: Readonly<Ref<InteractionDelayInfo<Info['type']> | null>>
  stop: (type?: InteractionDelayType) => void
  createDelaySetOpen: (
    delay?: MaybeRef<InteractionDelay>,
    overrideInfo?: Partial<Info>
  ) => (open: boolean, info?: Partial<Info>) => void
}

export interface ElementProps {
  reference?: Record<string, any>
  floating?: Record<string, any>
}

export interface InteractionsContext<
  RT extends ReferenceType = ReferenceType,
  Info extends InteractionInfo = InteractionInfo
> {
  open: Readonly<Ref<boolean>>
  setOpen: (open: boolean, info?: Info) => void
  interactionInfo: Readonly<Ref<Info & LastInteractionInfo>>
  delay: DelayControl<Info>
  refs: ElementRefs<RT>
}
