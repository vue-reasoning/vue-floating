import { isRef, unref, watch } from 'vue-demi'
import type { UnwrapRef, WatchOptions } from 'vue-demi'

import type { MaybeRef } from '../types'
import { noop } from './noop'
import { useManualEffect } from './useManualEffect'

export type ConditionHandler<T extends any[]> = (qualifys?: NonNullables<UnwrapRefs<T>>) => void

export type Predicate<T = any> = (item: T) => boolean

const defaultPredicate: Predicate = (item) => item !== undefined && item !== null

export interface UseQualifiedRefsReturn {
  detect: () => void
  mesure: () => void
  pause: () => void
}

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  options?: WatchOptions
): UseQualifiedRefsReturn

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  predicate?: Predicate<T[number]>,
  options?: WatchOptions
): UseQualifiedRefsReturn

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  predicate?: Predicate<T[number]> | WatchOptions,
  options?: WatchOptions
): UseQualifiedRefsReturn {
  if (typeof predicate !== 'function') {
    options = options || predicate
    predicate = defaultPredicate
  }

  const detect = () => {
    const items = unref(refs).map(unref) as NonNullables<UnwrapRefs<T>>
    if (items.some((item) => !(predicate as Predicate)(item))) {
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
      pause: noop
    }
  }

  const { clear, mesure } = useManualEffect(
    () => watch(() => unref(refs).map(unref), detect, options),
    true
  )

  return {
    detect,
    pause: clear,
    mesure
  }
}

type UnwrapRefs<T> = {
  [Key in keyof T]: UnwrapRef<T[Key]>
}

type NonNullables<T> = {
  [Key in keyof T]: NonNullable<T[Key]>
}
