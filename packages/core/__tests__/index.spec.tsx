import { describe, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, watch } from 'vue-demi'
import { offset } from '@floating-ui/core'
import type { ClientRectObject } from '@floating-ui/dom'

import { useFloating } from '../src'
import type { UseFloatingData, UseFloatingOptions, ReferenceType } from '../src'

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
  test('should update first.', () => {
    const onUpdate = vi.fn()
    const { wrapper, referenceRef, floatingRef } = mountBasicComponent()

    const { data } = useFloating(referenceRef, floatingRef)

    watch(
      data,
      () => {
        onUpdate()
        expect(onUpdate).toHaveBeenCalled()
        wrapper.unmount()
      },
      {
        immediate: true
      }
    )
  })
})

describe('virtual element', () => {
  interface BaseRect {
    x: number
    y: number
    width: number
    height: number
  }

  const createVirtualElement = ({
    x,
    y,
    width,
    height
  }: BaseRect): ClientRectObject => {
    return {
      x,
      y,
      top: y,
      bottom: y + height,
      left: x,
      right: x + width,
      width,
      height
    }
  }

  test('should update when reference is virtual element', () => {
    const refRect = createVirtualElement({
      x: 10,
      y: 10,
      width: 100,
      height: 100
    })

    const reference: ReferenceType = {
      getBoundingClientRect: () => refRect
    }
    const floating = document.createElement('div')

    const { data } = useFloating(reference, floating, {
      placement: 'bottom-start'
    })

    watch(data, ({ x, y }) => {
      expect({
        x,
        y
      }).toContain({
        x: refRect.top,
        y: refRect.bottom
      })
    })
  })
})

describe('options update', () => {
  const { referenceRef, floatingRef } = mountBasicComponent()
  const propsRef = ref<UseFloatingOptions>({})

  const { data } = useFloating(referenceRef, floatingRef, propsRef)

  let onUpdate: ((data: UseFloatingData) => void) | void

  watch(
    () => data.value as UseFloatingData,
    (data) => {
      onUpdate?.(data)
    }
  )

  const diviner = (
    props: UseFloatingOptions,
    data: Partial<UseFloatingData>
  ) => {
    const { promise, resolve } = (() => {
      let resolve: () => void
      const promise = new Promise<void>((_resolve) => {
        resolve = _resolve
      })
      return {
        promise,
        // @ts-expect-error
        resolve
      }
    })()

    let updated = false

    onUpdate = (updatedData) => {
      expect(updatedData).toContain(data)
      resolve()

      clearTimeout(disabledTimeout)
    }

    // check disabled
    const disabledTimeout = setTimeout(() => {
      if (!props.disabled === updated) {
        resolve()
      }
    }, 1000)

    propsRef.value = props

    return promise
  }

  const cases: Array<{
    message: string
    queue: Array<[UseFloatingOptions, Partial<UseFloatingData>]>
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
    },
    {
      message: 'should disabled update position after disabled',
      queue: [
        [
          {
            placement: 'top',
            disabled: true,
            middleware: [offset(10)]
          },
          {
            x: NaN,
            y: NaN
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
