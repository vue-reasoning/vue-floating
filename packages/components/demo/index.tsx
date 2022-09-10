import { h, ref } from 'vue-demi'

import { Popover } from '../src/popover'
import { createCompatElement, createSimpleCompatVueInstance } from '../src/utils/compat'

import './index.css'

const appendToBodyRef = ref<string | boolean>('body')

const proxy = createSimpleCompatVueInstance({
  render() {
    return h('div', [
      h('div', [
        createCompatElement(
          'button',
          {
            data: {
              onClick: () => (appendToBodyRef.value = !appendToBodyRef.value ? 'body' : false)
            }
          },
          [`appendToBody: ${appendToBodyRef.value}`]
        )
      ]),
      createCompatElement(Popover, {
        data: {
          title: 'Popover content:',
          content: 'Can be any react node!',
          interactions: ['click'],
          appendTo: appendToBodyRef.value,
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
