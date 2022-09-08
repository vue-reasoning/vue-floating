import type { ExtractPropTypes, PropType, Ref, VNode } from 'vue-demi'
import type {
  AutoPlacementOptions,
  FlipOptions,
  OffsetOptions,
  ShiftOptions
} from '@floating-ui/core'
import {
  FloatingComponentProps,
  FloatingComponentSlotProps,
  FloatingData
} from '@visoning/vue-floating-core/components'
import type { Delay } from '@visoning/vue-floating-interactions'

import { pick } from '../utils/pick'

export type Interaction = 'click' | 'hover' | 'focus'

export const PopupProps = {
  ...pick(FloatingComponentProps, ['placement', 'strategy', 'middleware', 'autoUpdate']),

  /**
   * Whether to open popup.
   */
  open: {
    type: Boolean,
    default: undefined
  },

  /**
   * Default open when not manually set.
   */
  defaultOpen: Boolean,

  /**
   * Whether to disable the floating.
   */
  disabled: Boolean,

  /**
   * When this value is `true`, popup will be teleport to the body.
   * If you need a custom teleport target, you can set to `false` and use `popupWrapper`
   * ```tsx
   * {
   *   appendToBody: false,
   *   popupWrapper: (popup) => h(
   *    Teleport,
   *    {
   *      to: '#id'
   *    },
   *    [popup]
   *   )
   * }
   * ```
   * @default true
   */
  appendToBody: {
    type: Boolean,
    default: true
  },

  /**
   * Which actions cause popup shown. enum of 'hover','click','focus'.
   */
  interactions: {
    type: Array as PropType<Interaction[]>,
    default: () => ['hover']
  },

  /**
   * Common delay in ms, before popup is open/close.
   */
  delay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on pointer click.
   */
  clickDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on pointer enter/leave.
   */
  hoverDelay: [Number, Object] as PropType<Delay>,

  /**
   * Delay in ms, before popup is open/close on focus/blur.
   */
  focusDelay: [Number, Object] as PropType<Delay>,

  /**
   * When this value is `false`, even if the popup is closed, floating will update the position as needed,
   * unless popup is disabled.
   *
   * This is useful when the style of the position conflicts with the style of the popup entry.
   */
  autoUpdateOnClosed: Boolean,

  /**
   * Displaces the popup element from its core placement along the specified axes.
   * @see https://floating-ui.com/docs/offset
   */
  offset: [Number, Object, Function] as PropType<OffsetOptions>,

  /**
   * Moves the popup element along the specified axes in order to keep it in view.
   * @default true
   * @see https://floating-ui.com/docs/shift
   */
  shift: {
    type: [Boolean, Object] as PropType<boolean | ShiftOptions>,
    default: true
  },

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
   * @default true
   */
  gpuAcceleration: {
    type: Boolean,
    default: true
  },

  /**
   * Whether to show arrow if set.
   * @default true
   */
  showArrow: {
    type: Boolean,
    default: true
  },

  /**
   * VNode | slot
   */
  arrow: [Object, Function] as PropType<VNode | null | ((data: FloatingData) => VNode | null)>,

  /**
   * Whether destroy popup when closed.
   */
  destoryedOnClosed: Boolean,

  /**
   * HTML attributes of node.
   */
  referenceProps: Object as PropType<Record<string, any>>,

  /**
   * HTML attributes of node.
   */
  popupProps: Object as PropType<Record<string, any>>,

  /**
   * Custom popup node wrapper.
   */
  popupWrapper: Function as PropType<(popup: VNode | null) => VNode>,

  /**
   * Callback on open status changes.
   */
  'onUpdate:open': Function as PropType<(open: boolean) => void>
} as const

export type PopupProps = ExtractPropTypes<typeof PopupProps>

export interface PopupExposed {
  floatingData: Readonly<Ref<FloatingData | undefined>>
  update: () => void
}

export type PopupSlotProps = FloatingComponentSlotProps
