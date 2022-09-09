import { createApp, h, ref, Vue2 } from 'vue-demi'

import { Popup } from '../src/popup'
import { Popover } from '../src/popover'

import './index.css'
import { createCompatElement, createSimpleCompatVueInstance } from '../src/utils/compat'

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
