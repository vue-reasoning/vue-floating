import { isRef, unref, watch } from 'vue'
import type { UnwrapRef, WatchOptions, WatchStopHandle } from 'vue'

import type { MaybeRef } from '../types'

export type ConditionHandler<T extends any[]> = (qualifys?: NonNullables<UnwrapRefs<T>>) => void

export type Predicate<T = any> = (item: T) => boolean

const defaultPredicate: Predicate = item => item !== undefined && item !== null

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  predicate?: Predicate<T[number]>,
  watchOptions?: WatchOptions
): WatchStopHandle

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  watchOptions?: WatchOptions
): WatchStopHandle

export function useQualifiedRefs<T extends any[]>(
  refs: MaybeRef<T>,
  handler: ConditionHandler<T>,
  predicate?: Predicate<T[number]> | WatchOptions,
  watchOptions?: WatchOptions
): WatchStopHandle {
  if (typeof predicate !== 'function') {
    watchOptions = predicate
    predicate = defaultPredicate
  }

  const condition = (items: UnwrapRefs<UnwrapRef<T>>) => {
    for (let i = 0; i < items.length; i++) {
      if (!(predicate as Predicate)(items[i])) {
        return handler()
      }
    }

    handler(items as NonNullables<UnwrapRefs<T>>)
  }

  if (!isRef(refs) && refs.every(ref => !isRef(ref))) {
    condition(refs as UnwrapRefs<UnwrapRef<T>>)
    return () => {}
  }

  return watch(() => unref(refs).map(unref) as UnwrapRefs<UnwrapRef<T>>, condition, watchOptions)
}

type UnwrapRefs<T> = T extends any[]
  ? {
      [Key in keyof T]: UnwrapRef<T[Key]>
    }
  : T

type NonNullables<T> = T extends any[]
  ? {
      [Key in keyof T]: NonNullable<T[Key]>
    }
  : T
