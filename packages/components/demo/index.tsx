import { h, ref } from 'vue-demi'

import { Popover } from '../src/popover'
import { createCompatElement, createSimpleCompatVueInstance } from '../src/utils/compat'

import './index.css'

const appendToBodyRef = ref(true)

const proxy = createSimpleCompatVueInstance({
  render() {
    return h('div', [
      h('div', [
        createCompatElement(
          'button',
          {
            data: {
              onClick: () => (appendToBodyRef.value = !appendToBodyRef.value)
            }
          },
          [`appendToBody: ${appendToBodyRef.value}`]
        )
      ]),
      createCompatElement(Popover, {
        data: {
          title: 'Popover content:',
          content: 'Can be any react node!',
          transitionProps: 'fade',
          interactions: ['click'],
          appendToBody: appendToBodyRef.value,
          'onUpdate:open': (open) => console.log(open)
        },
        scopedSlots: {
          default: () => h('div', 'My Tooltip'),
          reference: () => h('button', 'Hover and transition')
        }
      })
    ])
  }
})

proxy.mount('#app')
