import { h, ref } from 'vue-demi'

import { Popover } from '../src/popover'
import { Tooltip } from '../src/tooltip'
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
          'onUpdate:open': (open) => console.log('popover on click', open)
        },
        scopedSlots: {
          default: () => h('div', 'My Popover'),
          reference: () =>
            createCompatElement(Popover, {
              data: {
                title: 'Popover content:',
                content: 'Can be any react node!',
                theme: 'dark',
                appendTo: appendToBodyRef.value,
                'onUpdate:open': (open) => console.log('popover', open)
              },
              scopedSlots: {
                default: () => h('div', 'My Popover'),
                reference: () => h('button', 'Hover and transition')
              }
            })
        }
      }),
      createCompatElement(Tooltip, {
        data: {
          content: 'Can be any react node!',
          theme: 'dark',
          appendTo: appendToBodyRef.value,
          'onUpdate:open': (open) => console.log('tooltip', open)
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
