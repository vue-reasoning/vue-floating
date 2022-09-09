# @visoning/vue-floating-core

This is the library to use Floating UI with Vue.

## Install

```shell
pnpm install @visoning/vue-floating-core
```

or

```shell
npm install @visoning/vue-floating-core
```

## Usage

```tsx
import { useFloating, useAutoUpdate } from '@visoning/vue-floating-core'

export default {
  setup() {
    const referenceRef = ref<Element>()
    const floatingRef = ref<HTMLElement>()

    const floating = useFloating(referenceRef, floatingRef, {
      placement: 'right',
      strategy: 'fixed'
    })

    // If you want to automatically update the position of the floating element when necessary.
    // `floating.update()` allows you to update the floating position at any time,
    const stopAutoUpdate = useAutoUpdate(referenceRef, floatingRef, floating.update)

    // Remember to clear the effects before component unmount
    onBeforeUnmount(() => {
      stopAutoUpdate()
      floating.stop()
    })

    // render
    return () => {
      return (
        <button>
          <div style={{
            position: floating.data.value.strategy,
            top: `${floating.data.value.y}`px,
            left: `${floating.data.value.x}`px
          }}>
            Top
          </div>
        </button>
      )
    }
  }
}
```

It should be noted that in order to ensure the fine-grained code, `useFloating` does not provide any functions related to dom interaction, such as `floating` when the mouse enter the `reference`, which is also the original intention of [floating-ui](https://github.com/floating-ui/floating-ui).

This also makes `useFloating` more general! We can develop a [series of Vue components](https://github.com/vue-reasoning/vue-floating/tree/main/packages/components) based on `useFloating` for this!

## Type Declarations

```ts
type MaybeRef<T> = T | Ref<T>

export interface UseFloatingReturn {
  /**
   * @see https://floating-ui.com/docs/computePosition#return-value
   */
  data: Readonly<Ref<UseFloatingData>>
  update: () => void
  stop: () => void
}

/**
 * Uue hooks based on `computePosition`.
 * @see https://floating-ui.com/docs/computePosition
 *
 * @params {MaybeRef<ComputePositionConfig & {disabled?: boolean}>} options
 */
export declare function useFloating(
  referenceRef: MaybeReferenceRef,
  floatingRef: MaybeFloatingRef,
  options?: MaybeRef<UseFloatingOptions>
): UseFloatingReturn

/**
 * Automatically updates the position of the floating element when necessary.
 * @see https://floating-ui.com/docs/autoUpdate
 *
 * @params {MaybeRef<AutoUpdateOptions & {disabled?: boolean}>} options
 */
export declare function useAutoUpdate(
  reference: MaybeReferenceRef,
  floating: MaybeFloatingRef,
  update: () => void,
  options?: MaybeRef<UseAutoUpdateOptions>
): () => void
```

## Built-in Component

To facilitate developing Vue components based on useFloating, we also provide a minimal [FloatingComponent](https://github.com/vue-reasoning/vue-floating/tree/main/packages/core/src/components).
[All our floating components](https://github.com/vue-reasoning/vue-floating/tree/main/packages/components) are based on it!

## License

MIT
