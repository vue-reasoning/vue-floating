import type { ExtractPropTypes, PropType, PropOptions, UnwrapRef } from 'vue-demi'

import type {
  FloatingType,
  Middleware,
  Placement,
  Strategy,
  UseAutoUpdateOptions,
  UseFloatingReturn
} from '..'

export type { FloatingType, Middleware, Placement, Strategy }

export type AutoUpdateOptions = UseAutoUpdateOptions

export const FloatingComponentProps = {
  /**
   * Floating don't care where floating node from, so it doesn't capture internally.
   */
  floatingNode: {} as PropOptions<FloatingType | null>,

  /**
   * Whether to disable the floating.
   */
  disabled: Boolean,

  /**
   * Where to place the floating element relative to its reference element.
   * @see https://floating-ui.com/docs/computePosition#placement
   */
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom' as Placement
  },

  /**
   * This is the type of CSS position property to use.
   * @see https://floating-ui.com/docs/computePosition#strategy
   */
  strategy: {
    type: String as PropType<Strategy>,
    default: 'absolute'
  },

  /**
   * They alter the positioning coordinates from the basic placement to customize the position,
   * provide data, or act as "visibility optimization" techniques.
   * @see https://floating-ui.com/docs/computePosition#middleware
   */
  middleware: Array as PropType<Middleware[]>,

  /**
   * This function adds listeners that automatically call an update function when necessary
   * so that the floating element remains “anchored” to the reference element in a variety of scenarios without detaching.
   */
  autoUpdate: {
    type: [Boolean, Object] as PropType<boolean | AutoUpdateOptions>,
    default: true
  },

  onUpdate: Function as PropType<(data: UnwrapRef<UseFloatingReturn['data']>) => void>
} as const

export type FloatingComponentProps = ExtractPropTypes<typeof FloatingComponentProps>

export type FloatingComponentSlotProps = UnwrapRef<UseFloatingReturn['data']>

export interface FloatingComponentExpose {
  floating: {
    data: UseFloatingReturn['data']
    update: () => void
  }
}
