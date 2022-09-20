import { isRef, unref, watch } from 'vue-demi'
import type { UnwrapRef, WatchOptions } from 'vue-demi'
import { noop } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

import { useManualEffect } from './useManualEffect'

export type ConditionHandler<T extends any[]> = (
  qualifys?: NonNullables<UnwrapRefs<T>>
) => void

export type Qualifier<T = any> = (item: T) => boolean

const defaultQualifier: Qualifier = (item) =>
  item !== undefined && item !== null

export interface UseQualifiedRefsReturn {
  detect: () => void
  mesure: () => void
  stop: () => void
}

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  options?: WatchOptions
): UseQualifiedRefsReturn

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  qualifier?: Qualifier<T[number]>,
  options?: WatchOptions
): UseQualifiedRefsReturn

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  qualifier?: Qualifier<T[number]> | WatchOptions,
  options?: WatchOptions
): UseQualifiedRefsReturn {
  if (typeof qualifier !== 'function') {
    options = options || qualifier
    qualifier = defaultQualifier
  }

  const detect = () => {
    const items = unref(refs).map(unref) as NonNullables<UnwrapRefs<T>>
    if (items.some((item) => !(qualifier as Qualifier)(item))) {
      handler()
    } else {
      handler(items)
    }
  }

  // The refs never changes
  if (!isRef(refs) && refs.every((ref) => !isRef(ref))) {
    if (options?.immediate) {
      detect()
    }

    return {
      detect,
      mesure: noop,
      stop: noop
    }
  }

  const { clear, mesure } = useManualEffect(
    () => watch(() => unref(refs).map(unref), detect, options),
    true
  )

  return {
    detect,
    stop: clear,
    mesure
  }
}

type UnwrapRefs<T> = {
  [Key in keyof T]: UnwrapRef<T[Key]>
}

type NonNullables<T> = {
  [Key in keyof T]: NonNullable<T[Key]>
}
