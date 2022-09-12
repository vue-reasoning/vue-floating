import type { ComputedRef, Ref } from 'vue-demi'
import { computed, unref, isRef } from 'vue-demi'
import type { ReferenceType } from '@visoning/vue-floating-core'

export type MaybeRef<T> = T | Ref<T>

export interface ElementRefs<RT extends ReferenceType = ReferenceType> {
  reference: Readonly<Ref<RT | null | undefined>>
  floating: Ref<HTMLElement | null | undefined>
}

export interface InteractionInfo {
  type: string | null
  event?: Event | null
}

export interface InteractionsContext<
  RT extends ReferenceType = ReferenceType,
  Info extends InteractionInfo = InteractionInfo
> {
  open: Readonly<Ref<boolean>>
  setOpen: (open: boolean, info?: Info) => void
  info: Readonly<Ref<Info>>
  refs: ElementRefs<RT>
}

export interface ElementProps {
  reference?: Record<string, any>
  floating?: Record<string, any>
}

export type DelayType = 'open' | 'close'
export type Delay = number | Partial<Record<DelayType, number>> | undefined

export function getDelay(type: DelayType, delay: Ref<Delay>): ComputedRef<number | undefined>
export function getDelay(type: DelayType, delay?: Delay): number | undefined
export function getDelay(
  type: DelayType,
  delay?: MaybeRef<Delay>
): ComputedRef<number | undefined> | number | undefined
export function getDelay(
  type: DelayType,
  delay?: MaybeRef<Delay>
): ComputedRef<number | undefined> | number | undefined {
  const get = (delay: Delay) => (typeof delay === 'number' ? delay : delay && delay[type])
  return isRef(delay) ? computed(() => get(unref(delay))) : get(delay)
}
