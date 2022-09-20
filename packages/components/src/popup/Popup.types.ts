import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import type {
  AutoPlacementOptions,
  FlipOptions,
  OffsetOptions,
  ShiftOptions
} from '@floating-ui/core'
import {
  FloatingCreatorDefaultProps,
  FloatingCreatorProps
} from '@visoning/vue-floating-core/components'
import type { FloatingData } from '@visoning/vue-floating-core/components'
import type {
  FloatingType,
  ReferenceType,
  VirtualElement
} from '@visoning/vue-floating-core'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'

export interface PopupExposed {
  updatePosition: () => void
  getFloatingData: () => FloatingData | undefined
  getElements: () => {
    floating: FloatingType | undefined
    reference: ReferenceType | undefined
  }
}

export type PopupSlotProps = FloatingData

export const FloatingCreatorListenerPropsForwarder =
  createListenerPropsForwarder(FloatingCreatorProps, ['onFloatingDataUpdate'])

export const PopupPropsType = {
  ...pick(FloatingCreatorProps, [
    'placement',
    'strategy',
    'middleware',
    'autoUpdate'
  ]),

  ...FloatingCreatorListenerPropsForwarder.props,

  /**
   * Whether to open popup.
   */
  open: Boolean,

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

  // virtualElementId: String,

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
   *   floatingWrapper: (floating) => h(
   *    Teleport,
   *    {
   *      to: anyTarget
   *    },
   *    {
   *      default: () => [floating]
   *    }
   *   )
   * }
   * ```
   * @default 'body'
   */
  appendTo: {} as PropType<string | false | HTMLElement>,

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
   * The basic DOM structure is `<Floating/> -> <Popup/> -> <PopupContent/>`.
   */
  popupWrapper: Function as PropType<(popup: VNode | null) => VNode>,

  /**
   * Custom floating node wrapper.
   * The basic DOM structure is `<Floating/> -> <Popup/> -> <PopupContent/>`.
   */
  floatingWrapper: Function as PropType<(popup: VNode | null) => VNode>,

  /**
   * Popup z-index.
   */
  zIndex: Number
} as const

export const PopupDefaultProps = {
  ...FloatingCreatorDefaultProps,
  appendTo: 'body',
  shift: true
} as const

export const PopupProps = withDefaultProps(PopupPropsType, PopupDefaultProps)

export type PopupProps = ExtractPropTypes<typeof PopupProps>
