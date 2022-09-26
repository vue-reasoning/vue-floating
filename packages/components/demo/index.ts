import { Vue2, h, ref, createApp } from 'vue-demi'

import { Popover } from '../src/popover'
import { Tooltip } from '../src/tooltip'
import { createCompatElement } from '../src/utils/compat'

import './index.css'
import '../src/popover/styles/index.scss'

const appendToBodyRef = ref<string | boolean>('body')
const iRef = ref(['click', 'focus'])
const disabledRef = ref(false)

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
        ),
        createCompatElement(
          'button',
          {
            data: {
              onClick: () => (iRef.value = ['click'])
            }
          },
          [iRef.value]
        ),
        createCompatElement(
          'button',
          {
            data: {
              onClick: () => (disabledRef.value = !disabledRef.value)
            }
          },
          ['disabled:' + disabledRef.value]
        )
      ]),
      createCompatElement(Popover, {
        data: {
          title: 'Popover content:',
          content: 'Can be any react node!',
          interactions: iRef.value,
          defaultOpen: true,
          disabled: disabledRef.value,
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
                disabled: disabledRef.value,
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
          disabled: disabledRef.value,
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
