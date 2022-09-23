import type { ExtractPropTypes, PropType, VNode } from 'vue-demi'
import type {
  AutoPlacementOptions,
  FlipOptions,
  OffsetOptions,
  ShiftOptions
} from '@floating-ui/core'
import { FloatingCreatorProps } from '@visoning/vue-floating-core'
import type {
  FloatingType,
  FloatingData,
  ReferenceType,
  VirtualElement
} from '@visoning/vue-floating-core'
import {
  createListenerPropsForwarder,
  pick,
  withDefaultProps
} from '@visoning/vue-utility'
import {
  BaseInteractionInfo,
  InteractorProps
} from '@visoning/vue-floating-interactions'

export interface PopupExposed {
  updatePosition: () => void
  getFloatingData: () => FloatingData | undefined
  getElements: () => {
    floating?: FloatingType | undefined | null
    reference?: ReferenceType | undefined | null
  }
}

export type PopupSlotProps = FloatingData

export const FloatingCreatorListenersForwarder = createListenerPropsForwarder(
  FloatingCreatorProps,
  ['onFloatingDataUpdate']
)

export const ExtendsFloatingCreatorProps = pick(FloatingCreatorProps, [
  'placement',
  'strategy',
  'middleware',
  'autoUpdate'
])

export const ExtendsInteractiorProps = pick(InteractorProps, [
  'interactions',
  'delay',
  'hoverDelay',
  'clickDelay',
  'focusDelay',
  'allowPointerEnterTarget',
  'inactiveWhenClickOutside'
])

export const PopupPropsType = {
  ...ExtendsFloatingCreatorProps,
  ...FloatingCreatorListenersForwarder.props,
  ...ExtendsInteractiorProps,

  /**
   * Whether to open popup.
   */
  open: Boolean,

  /**
   * Default state of open, typically used in uncontrolled mode.
   *
   * @default false
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
   * @example
   * ```ts
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
   *
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
   * @see https://floating-ui.com/docs/shift
   *
   * @default true
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
  floatingProps: Object as PropType<Record<string, any>>,

  /**
   * Custom floating node wrapper.
   * The basic DOM structure is `<Floating/> -> <Popup/> -> <PopupContent/>`.
   */
  floatingWrapper: Function as PropType<(popup: VNode | null) => VNode>,

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
   * Popup z-index.
   */
  zIndex: Number,

  /**
   * Callback on open status changes.
   */
  'onUpdate:open': Function as PropType<
    (open: boolean, info: BaseInteractionInfo) => void
  >,

  /**
   * Callback on popup open.
   */
  onOpen: Function as PropType<(info: BaseInteractionInfo) => void>,

  /**
   * Callback on popup close.
   */
  onClose: Function as PropType<(info: BaseInteractionInfo) => void>
} as const

export const PopupDefaultProps = {
  open: undefined,
  defaultOpen: false,
  shift: true,
  appendTo: 'body'
} as const

export const PopupProps = withDefaultProps(PopupPropsType, PopupDefaultProps)

export type PopupProps = ExtractPropTypes<typeof PopupProps>
