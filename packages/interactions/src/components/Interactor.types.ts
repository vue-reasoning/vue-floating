import type { ExtractPropTypes, PropType } from 'vue-demi'
import { MaybeRef, withDefaultProps } from '@visoning/vue-utility'

import type {
  BaseInteractionInfo,
  ElementProps,
  InteractionDelay
} from '../types'
import type { InteractionsContext } from '../useInteractionsContext'

export type Interaction = 'hover' | 'click' | 'focus'

export type { InteractionDelay }

export interface InteractionExposed {
  getElementProps: () => ElementProps
}

export const InteractorPropTypes = {
  /**
   * State of interaction.
   *
   * @default false
   */
  active: Boolean,

  /**
   * Which interaction cause state actived, enum of 'hover','click','focus'.
   *
   * @default 'hover'
   */
  interactions: [Boolean, String, Array] as PropType<
    Interaction | Interaction[] | false
  >,

  customInteractions: Array as PropType<
    Array<(context: InteractionsContext) => MaybeRef<ElementProps>>
  >,

  /**
   * NOTE: Please ensure that the node can receive interaction events.
   */
  targets: Array as PropType<HTMLElement[]>,

  /**
   * Default delay in ms, before active is changed.
   */
  delay: [Number, Object] as PropType<InteractionDelay>,

  /**
   * Delay in ms, before active is changed by `pointerEnter`/`pointerLeave`.
   */
  hoverDelay: [Number, Object] as PropType<InteractionDelay>,

  /**
   * Delay in ms, before active is changed by `pointerClick`/`clickOutside`.
   */
  clickDelay: [Number, Object] as PropType<InteractionDelay>,

  /**
   * Delay in ms, before active is changed by `focus`/`blur`.
   */
  focusDelay: [Number, Object] as PropType<InteractionDelay>,

  /**
   * If set to true, it will keep active after the pointer leave interactor and enter target.
   *
   * @default true
   */
  allowPointerEnterTarget: Boolean,

  /**
   * If set to true, it can be inactive by clicking outside.
   *
   * @default true
   */
  inactiveWhenClickOutside: Boolean,

  /**
   * Callback on active status changes.
   */
  'onUpdate:active': Function as PropType<
    (active: boolean, info?: BaseInteractionInfo) => void
  >,

  /**
   * Callback on active.
   */
  onActive: Function as PropType<(info?: BaseInteractionInfo) => void>,

  /**
   * Callback on inactive.
   */
  onInactive: Function as PropType<(info?: BaseInteractionInfo) => void>
} as const

export const InteractorDefaultProps = {
  active: false,
  interactions: 'hover',
  inactiveWhenClickOutside: true,
  allowPointerEnterTarget: true
} as const

export const InteractorProps = withDefaultProps(
  InteractorPropTypes,
  InteractorDefaultProps
)

export type InteractorProps = ExtractPropTypes<typeof InteractorProps>
