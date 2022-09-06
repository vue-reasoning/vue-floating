import type { ExtractPropTypes, PropType } from 'vue-demi'
import type {
  Middleware,
  Placement,
  Strategy,
  UseAutoUpdateOptions
} from '@visoning/vue-floating-core'

export const FloatingComponentProps = {
  enabled: {
    type: Boolean,
    default: true
  },

  floatingNode: Object as PropType<HTMLElement | null>,

  /**
   * Where to place the floating element relative to its reference element.
   * @see https://floating-ui.com/docs/computePosition#placement
   */
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom' as Placement
  },

  /**
   * This is the type of CSS position property to use
   * @see https://floating-ui.com/docs/computeposition#strategy
   */
  strategy: {
    type: String as PropType<Strategy>,
    default: 'absolute'
  },

  /**
   * Middleware are plain objects that modify the positioning coordinates in some fashion,
   * or provide useful data for the consumer to use.
   * @see https://floating-ui.com/docs/middleware
   */
  middleware: Array as PropType<Middleware[]>,

  autoUpdate: [Boolean, Object] as PropType<boolean | UseAutoUpdateOptions>,

  autoUpdateOnDisabled: {
    type: Boolean,
    default: true
  }
} as const

export type FloatingComponentProps = ExtractPropTypes<typeof FloatingComponentProps>

export interface FloatingInstanceExpose {
  update: () => void
}
