import type { ExtractPropTypes, PropType } from 'vue-demi'

import type { Middleware, Placement, Strategy, UseAutoUpdateOptions, UseFloatingReturn } from '..'

export const FloatingComponentProps = {
  enabled: {
    type: Boolean,
    default: true
  },
  floatingNode: Object as PropType<HTMLElement | null>,
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom' as Placement
  },
  strategy: {
    type: String as PropType<Strategy>,
    default: 'absolute'
  },
  middleware: Array as PropType<Middleware[]>,
  autoUpdate: [Boolean, Object] as PropType<boolean | UseAutoUpdateOptions>,
  autoUpdateOnDisabled: {
    type: Boolean,
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

export type FloatingSlotProps = UseFloatingReturn['data']
