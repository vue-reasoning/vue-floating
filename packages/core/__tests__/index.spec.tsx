import { describe, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { offset } from '@floating-ui/dom'

import { useFloating } from '../src/hooks/useFloating'
import type { UseFloatingData, UseFloatingProps } from '../src/types'

const mountBasicComponent = () => {
  const referenceRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  const wrapper = mount({
    setup() {
      // For Vue2
      return {
        referenceRef,
        floatingRef
      }
    },
    render() {
      return (
        <div>
          <div ref="referenceRef">reference</div>
          <div ref="floatingRef">floating</div>
        </div>
      )
    }
  })

  return {
    wrapper,
    referenceRef,
    floatingRef
  }
}

describe('basic', () => {
  test('should update first.', async () => {
    const onUpdate = vi.fn()
    const { wrapper, referenceRef, floatingRef } = mountBasicComponent()

    useFloating(referenceRef, floatingRef, {
      onUpdate: () => {
        onUpdate()
        expect(onUpdate).toHaveBeenCalled()
        wrapper.unmount()
      }
    })
  })
})

describe('options update', async () => {
  const propsRef = ref<UseFloatingProps>({})
  const { referenceRef, floatingRef } = mountBasicComponent()
  const { data: dataRef } = useFloating(referenceRef, floatingRef, propsRef)

  const diviner = (props: UseFloatingProps, data: Partial<UseFloatingData>) => {
    const { promise, resolve } = (() => {
      let resolve: () => void
      const promise = new Promise<void>(_resolve => {
        resolve = _resolve
      })
      return {
        promise,
        // @ts-expect-error
        resolve
      }
    })()

    propsRef.value = {
      ...props,
      onUpdate: () => {
        expect(dataRef.value).toContain(data)
        resolve()
      }
    }

    return promise
  }

  const cases: Array<{
    message: string
    queue: Array<[UseFloatingProps, Partial<UseFloatingData>]>
  }> = [
    {
      message: 'should update position after options update',
      queue: [
        [
          {
            placement: 'bottom',
            middleware: [
              offset(10),
              offset(() => 5),
              offset(() => ({ crossAxis: 10 })),
              offset({ crossAxis: 10, mainAxis: 10 })
            ]
          },
          {
            x: 20,
            y: 25
          }
        ],
        [
          {
            placement: 'top',
            middleware: [
              offset(10),
              offset(() => 5),
              offset(() => ({ crossAxis: 10 })),
              offset({ crossAxis: 10, mainAxis: 10 })
            ]
          },
          {
            x: 20,
            y: -25
          }
        ]
      ]
    },
    {
      message: 'should update position after middleware update',
      queue: [
        [
          {
            placement: 'top',
            middleware: [
              offset(10),
              offset(() => 5),
              offset(() => ({ crossAxis: 10 })),
              offset({ crossAxis: 10, mainAxis: 10 })
            ]
          },
          {
            x: 20,
            y: -25
          }
        ],
        [
          {
            placement: 'top',
            middleware: [
              offset(10),
              offset(() => 5),
              offset(() => ({ crossAxis: 10 })),
              offset({ crossAxis: 10, mainAxis: 20 })
            ]
          },
          {
            x: 20,
            y: -35
          }
        ]
      ]
    }
  ]

  cases.map(({ message, queue }) => {
    test(message, async () => {
      for (let i = 0; i < queue.length; i++) {
        await diviner(queue[i][0], queue[i][1])
      }
    })
  })
})
