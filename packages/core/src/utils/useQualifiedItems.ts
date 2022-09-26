import { isRef, unref, watch } from 'vue-demi'
import type { UnwrapRef } from 'vue-demi'
import { noop, useManualEffect } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

export type QualifiedItemsHandler<T extends ReadonlyArray<any>> = (
  items?: NonNullables<UnwrapRefs<T>>
) => void

export type Qualifier<T = any> = (item: T) => boolean

const defaultQualifier: Qualifier = (item) =>
  item !== undefined && item !== null

export interface QualifiedItemsControl {
  detect: () => void
  mesure: () => void
  stop: () => void
}

export function useQualifiedItems<T extends ReadonlyArray<any>>(
  refs: MaybeRef<T>,
  handler: QualifiedItemsHandler<T>,
  immediate?: boolean
): QualifiedItemsControl

export function useQualifiedItems<T extends ReadonlyArray<any>>(
  refs: MaybeRef<T>,
  handler: QualifiedItemsHandler<T>,
  qualifier?: Qualifier<T[number]>,
  immediate?: boolean
): QualifiedItemsControl

export function useQualifiedItems<T extends ReadonlyArray<any>>(
  refs: MaybeRef<T>,
  handler: QualifiedItemsHandler<T>,
  qualifier?: Qualifier<T[number]> | boolean,
  immediate?: boolean
): QualifiedItemsControl {
  if (typeof qualifier !== 'function') {
    immediate = immediate ?? !!qualifier
    qualifier = defaultQualifier
  }

  const getItems = () => unref(refs).map(unref) as NonNullables<UnwrapRefs<T>>

  const detect = () => {
    const items = getItems()
    if (items.some((item) => !(qualifier as Qualifier)(item))) {
      handler()
    } else {
      handler(items)
    }
  }

  // The refs never changes
  if (!isRef(refs) && refs.every((ref) => !isRef(ref))) {
    if (immediate) {
      detect()
    }

    return {
      detect,
      mesure: noop,
      stop: noop
    }
  }

  const { clear, mesure } = useManualEffect(
    () =>
      watch(getItems, detect, {
        immediate: true
      }),
    immediate
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
