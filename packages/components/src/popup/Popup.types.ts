import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import type {
  AutoPlacementOptions,
  FlipOptions,
  OffsetOptions,
  ShiftOptions
} from '@floating-ui/core'
import {
  FloatingCreator,
  FloatingCreatorProps,
  FloatingData
} from '@visoning/vue-floating-core/components'
import type { Delay, InteractionInfo } from '@visoning/vue-floating-interactions'

import { pick } from '../utils/pick'
import type { VirtualElement } from '@visoning/vue-floating-core'

export interface PopupExposed {
  getFloatingData: () => FloatingData | undefined
  updatePosition: () => void
}

export type PopupSlotProps = FloatingData

export type Interaction = 'click' | 'hover' | 'focus'

export const PopupProps = {
  ...pick(FloatingCreatorProps, [
    // TODO: are virtual element implemented internally??
    'placement',
    'strategy',
    'middleware',
    'autoUpdate'
  ]),

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
   * You can position a floating element relative to a virtual element instead of a real one.
   * This enables things like positioning context menus or following the cursor.
   * @see https://floating-ui.com/docs/virtual-elements
   */
  virtualElement: Object as PropType<VirtualElement>,

  /**
   * When this value is `true`, popup will be teleport to the target.
   * The teleport to target must be already in the DOM when the <Teleport> component is mounted.
   * @see https://vuejs.org/guide/built-ins/teleport.html
   *
   * Or you can customize the teleport logic, set `appendTo` to false, and use `floatingWrapper`,
   * for simple example
   * ```tsx
   * {
   *   appendTo: false,
   *   floatingWrapper: (popup) => h(
   *    Teleport,
   *    {
   *      to: anyTarget
   *    },
   *    [popup]
   *   )
   * }
   * ```
   * @default "body"
   */
  appendTo: {
    default: 'body'
  } as unknown as { type: PropType<string | false | HTMLElement>; default: string },

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
   * When this value is `true`, popup will use the 3D transforms.
   * When this value is `false`, popup will use top/left properties.
   */
  gpuAcceleration: Boolean,

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
   * Custom floating node wrapper.
   */
  floatingWrapper: Function as PropType<(popup: VNode | null) => VNode>,

  /**
   * Popup z-index.
   */
  zIndex: Number,

  /**
   * Callback on open status changes.
   */
  'onUpdate:open': Function as PropType<(open: boolean, info: InteractionInfo) => void>,

  /**
   * Callback on popup open.
   */
  onOpen: Function as PropType<(info: InteractionInfo) => void>,

  /**
   * Callback on popup close.
   */
  onClose: Function as PropType<(info: InteractionInfo) => void>,

  onFloatingDataUpdate: Function as PropType<(data: FloatingData) => void>
} as const

export type PopupProps = ExtractPropTypes<typeof PopupProps>
