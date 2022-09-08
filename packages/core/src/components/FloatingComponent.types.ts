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
  floatingNode: {} as PropOptions<FloatingType | null>,
  disabled: Boolean,
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom' as Placement
  },
  strategy: {
    type: String as PropType<Strategy>,
    default: 'absolute'
  },
  middleware: Array as PropType<Middleware[]>,
  autoUpdate: {
    type: [Boolean, Object] as PropType<boolean | AutoUpdateOptions>,
    default: true
  }
} as const

export type FloatingComponentProps = ExtractPropTypes<typeof FloatingComponentProps>

export type FloatingComponentSlotProps = UnwrapRef<UseFloatingReturn['data']>

export interface FloatingComponentExpose {
  floating: {
    data: UseFloatingReturn['data']
    update: () => void
  }
}
