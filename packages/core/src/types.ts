import type { Ref } from 'vue-demi'
import type {
  ComputePositionConfig,
  Middleware,
  MiddlewareData,
  Placement,
  Strategy
} from '@floating-ui/core'
import type { VirtualElement } from '@floating-ui/dom'
import type { MaybeRef } from '@visoning/vue-utility'

export type { Middleware, MiddlewareData, Placement, Strategy, VirtualElement }

export type ReferenceType = Element | VirtualElement

export type FloatingType = HTMLElement

export type MaybeRefType<T> = MaybeRef<T | undefined | null>

export type MaybeReferenceRef = MaybeRefType<ReferenceType>

export type MaybeFloatingRef = MaybeRefType<FloatingType>

export interface UseFloatingData {
  x: number | null
  y: number | null
  strategy: Strategy
  placement: Placement
  middlewareData: MiddlewareData
}

export type UseFloatingOptions = Omit<ComputePositionConfig, 'platform'> & {
  disabled?: boolean
}

export interface UseFloatingReturn {
  /**
   * @see https://floating-ui.com/docs/computePosition#return-value
   */
  data: Readonly<Ref<UseFloatingData>>
  update: () => void
  stop: () => void
}
