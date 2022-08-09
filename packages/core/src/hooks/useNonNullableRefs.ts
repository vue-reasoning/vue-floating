import { isRef, watch } from 'vue'
import type { UnwrapRef, WatchOptions, WatchStopHandle } from 'vue'

export interface UseNonNullableRefsOptions<T extends any[]> extends WatchOptions {
  handler: (...args: T) => void
  dissatisfyHandler?: () => void
}

export function useNonNullableRefs<T extends any[]>(
  refs: T,
  options: UseNonNullableRefsOptions<NonNullables<UnwrapRefs<T>>>
): WatchStopHandle {
  type Elements = NonNullables<UnwrapRefs<T>>

  const handler = (...elements: Elements) => {
    if (elements.every(element => element !== undefined && element !== null)) {
      options.handler(...elements)
    } else {
      options.dissatisfyHandler?.()
    }
  }

  if (refs.every(ref => !isRef(ref))) {
    handler(...(refs as Elements))
    return () => {}
  }

  return watch(refs, ([...elements]) => handler(...(elements as Elements)), options)
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
