export type {
  Middleware,
  MiddlewareData,
  Placement,
  Strategy,
  VirtualElement
} from '@visoning/vue-floating-core'
export type {
  FloatingData,
  AutoUpdateOptions
} from '@visoning/vue-floating-core/components'

export {
  useReferenceForwardContext,
  useSafeReferenceForwardContent,
  providePopupContextValue,
  createReferenceForwardContext
} from './popup'
export type {
  ForwardReferenceType,
  ForwardReferenceContextValue
} from './popup'

//
// Popup
//

export { PopupPropsType, PopupDefaultProps, PopupProps } from './popup'
export type { PopupExposed, PopupSlotProps } from './popup'

//
// Popover
//

export * from './popover'

//
// Tooltip
//

export * from './tooltip'
