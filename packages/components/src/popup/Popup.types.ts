import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import pick from 'lodash.pick'
import { FloatingComponentProps } from '@visoning/vue-floating-core/components'
import type { Delay } from '@visoning/vue-floating-interactions'
import type {
  AutoPlacementOptions,
  FlipOptions,
  OffsetOptions,
  ShiftOptions
} from '@floating-ui/core'
import type { UseAutoUpdateOptions } from '@visoning/vue-floating-core'

export type Interaction = 'click' | 'hover' | 'focus'

export const PopupProps = {
  ...pick(FloatingComponentProps, ['placement', 'strategy', 'middleware', 'autoUpdate']),

  open: {
    type: Boolean,
    default: undefined
  },

  defaultOpen: Boolean,

  disabled: Boolean,

  appendToBody: {
    type: Boolean,
    default: true
  },

  /**
   * which actions cause popup shown. enum of 'hover','click','focus'.
   */
  interactions: {
    type: Array as PropType<Interaction[]>,
    default: () => ['hover']
  },

  /**
   * Delay in ms, before popup is open on pointer click.
   */
  clickDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open on pointer enter.
   */
  hoverDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open on focus.
   */
  focusDelay: [Number, Object] as PropType<Delay>,

  autoUpdate: {
    type: [Boolean, Object] as PropType<boolean | UseAutoUpdateOptions>,
    default: true
  },

  autoUpdateOnClosed: Boolean,

  /**
   * Displaces the popup element from its core placement along the specified axes.
   * @see https://floating-ui.com/docs/offset
   */
  offset: [Number, Object, Function] as PropType<OffsetOptions>,

  /**
   * Moves the popup element along the specified axes in order to keep it in view.
   * @see https://floating-ui.com/docs/shift
   */
  shift: [Boolean, Object] as PropType<boolean | ShiftOptions>,

  /**
   * Changes the placement of the popup element to the opposite one by default in order to keep it in view.
   * @see https://floating-ui.com/docs/flip
   */
  flip: [Boolean, Object] as PropType<boolean | FlipOptions>,

  /**
   * Chooses the placement that has the most space available automatically.
   *
   * You’ll want to use this instead of `flip` if you don't want to give the popup element a “preferred” placement
   * and let it choose a placement for you.
   * @see https://floating-ui.com/docs/autoPlacement
   */
  autoPlacement: [Boolean, Object] as PropType<boolean | AutoPlacementOptions>,

  /**
   * This determines whether GPU-accelerated styles are used to position the popup.
   * When this value is `true`, popup will use the 3D transforms on high PPI displays and 2D transforms on low PPI displays.
   * When this value is `false`, popup will use top/left properties.
   */
  gpuAcceleration: Boolean,

  /**
   * Whether destroy popup when closed.
   */
  destoryedOnClosed: Boolean,

  referenceProps: Object as PropType<Record<string, any>>,

  popupProps: Object as PropType<Record<string, any>>,

  popupWrapper: Function as PropType<(popup: VNode | null) => VNode>,

  'onUpdate:open': Function as PropType<(shown: boolean) => void>
} as const

export type PopupProps = ExtractPropTypes<typeof PopupProps>
