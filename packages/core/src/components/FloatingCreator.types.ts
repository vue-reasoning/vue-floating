import type { ExtractPropTypes, PropType, UnwrapRef } from 'vue-demi'

import type {
  ReferenceType,
  FloatingType,
  Middleware,
  Placement,
  Strategy,
  UseAutoUpdateOptions,
  UseFloatingData
} from '..'

export type FloatingData = UseFloatingData

export type AutoUpdateOptions = UseAutoUpdateOptions

export type FloatingCreatorSlotProps = FloatingData

export interface FloatingCreatorExposed {
  getFloatingData: () => FloatingData
  updatePosition: () => void
}

export const FloatingCreatorProps = {
  /**
   * Whether to disable the floating.
   */
  disabled: Boolean,

  /**
   * Reference element.
   *
   * You can position a floating element relative to a virtual element instead of a real one.
   * This enables things like positioning context menus or following the cursor.
   * @see https://floating-ui.com/docs/virtual-elements
   */
  reference: {} as { type: PropType<ReferenceType | null> },

  /**
   * Floating element.
   */
  floating: {} as { type: PropType<FloatingType | null> },

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

  /**
   * Callback on floating data status changes.
   */
  onUpdate: Function as PropType<(data: UnwrapRef<FloatingData>) => void>
} as const

export type FloatingCreatorProps = ExtractPropTypes<typeof FloatingCreatorProps>
