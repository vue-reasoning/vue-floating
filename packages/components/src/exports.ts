export type {
  Middleware,
  MiddlewareData,
  Placement,
  Strategy,
  VirtualElement
} from '@visoning/vue-floating-core'
export type { FloatingData, AutoUpdateOptions } from '@visoning/vue-floating-core/components'

export {
  useReferenceForwardContext,
  useSafeReferenceForwardContent,
  providePopupContextValue,
  createReferenceForwardContext
} from './popup'
export type { ForwardReferenceType, ForwardReferenceContextValue } from './popup'

//
// Popup
//

export { Popup, PopupProps } from './popup'
export type { Interaction, PopupExposed, PopupSlotProps } from './popup'

//
// Popover
//

export { Popover, PopoverProps, PopoverExtendsPopupProps } from './popover'
export type { PopoverExposed, PopoverArrowSlotProps, CreateArrow } from './popover'

//
// Tooltip
//

export { Tooltip, TooltipProps, TooltipExtendsPopoverProps } from './tooltip'
export type { TooltipExposed, TooltipArrowSlotProps } from './tooltip'
