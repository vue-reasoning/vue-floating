import { Vue2, h, ref, createApp } from 'vue-demi'

import { Popover } from '../src/popover'
import { Tooltip } from '../src/tooltip'
import { createCompatElement } from '../src/utils/compat'

import './index.css'
import '../src/popover/styles/index.scss'

const appendToBodyRef = ref<string | boolean>('body')

const proxy = createApp({
  render() {
    return h('div', [
      h('div', [
        createCompatElement(
          'button',
          {
            data: {
              onClick: () =>
                (appendToBodyRef.value = !appendToBodyRef.value
                  ? 'body'
                  : false)
            }
          },
          [`appendToBody: ${appendToBodyRef.value}`]
        )
      ]),
      createCompatElement(Popover, {
        data: {
          title: 'Popover content:',
          content: 'Can be any react node!',
          interactions: ['click', 'focus'],
          clickDelay: {
            open: 0,
            close: 500
          },
          focusDelay: 1000,
          closeWhenClickOutside: true,
          appendTo: appendToBodyRef.value,
          'onUpdate:open': (open) => console.log('popover on click', open)
        },
        scopedSlots: {
          default: () => h('div', 'My Popover'),
          reference: () =>
            createCompatElement(Popover, {
              data: {
                title: 'Popover content:',
                content: 'Can be any node!',
                theme: 'dark',
                // appendTo: appendToBodyRef.value,
                appendTo: false,
                keepOpenWhenPopupHover: false,
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
          content: 'Can be any node!',
          theme: 'dark',
          size: 'small',
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
