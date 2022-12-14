import { computed } from 'vue-demi'
import { isObject } from '@visoning/vue-utility'
import type { Middleware } from '@visoning/vue-floating-core'
import { offset, shift, flip, autoPlacement } from '@floating-ui/dom'

import type { PopupProps } from './Popup.types'

export type UseMiddlewaresProps = Pick<
  PopupProps,
  'offset' | 'shift' | 'flip' | 'autoPlacement' | 'middleware'
>

export function useMiddlewares(props: UseMiddlewaresProps) {
  return computed(() => {
    const middleware: Middleware[] = []

    if (props.offset) {
      middleware.push(offset(props.offset))
    }
    if (props.shift) {
      middleware.push(shift(normalizeMiddlewareOptions(props.shift)))
    }
    if (props.flip) {
      middleware.push(flip(normalizeMiddlewareOptions(props.flip)))
    }
    if (props.autoPlacement) {
      middleware.push(
        autoPlacement(normalizeMiddlewareOptions(props.autoPlacement))
      )
    }

    return middleware.concat(props.middleware || [])
  })
}

function normalizeMiddlewareOptions(
  options: boolean | Record<string, any>,
  candidate: Record<string, any> = {}
) {
  // determine whether it disabled the middleware in hooks
  return isObject(options) ? options : candidate
}
