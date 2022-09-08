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
import { useFloating } from '@visoning/vue-floating-core'

export default {
  setup() {
    const referenceRef = ref<Element>()
    const floatingRef = ref<HTMLElement>()

    const floating = useFloating(referenceRef, floatingRef, {
      placement: 'right'
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
            position: 'fixed',
            top: `${floating.data.value.top}`px,
            left: `${floating.data.value.left}`px
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

## License

MIT
