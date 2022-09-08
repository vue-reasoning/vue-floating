import type { ExtractPropTypes, PropType, PropOptions, UnwrapRef } from 'vue-demi'

import type { Middleware, Placement, Strategy, UseAutoUpdateOptions, UseFloatingReturn } from '..'

export const FloatingComponentProps = {
  floatingNode: {} as PropOptions<HTMLElement | null>,
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
    type: [Boolean, Object] as PropType<boolean | UseAutoUpdateOptions>,
    default: true
  }
} as const

export type FloatingComponentProps = ExtractPropTypes<typeof FloatingComponentProps>

export interface FloatingInstanceExpose {
  floating: {
    data: UseFloatingReturn['data']
    update: () => void
  }
}

export type FloatingSlotProps = UnwrapRef<UseFloatingReturn['data']>
