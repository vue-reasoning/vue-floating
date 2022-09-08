import { h, ref, Vue2 } from 'vue-demi'

import { Popup } from '../src/popup'

import './index.css'

const appendToBodyRef = ref(true)

new Vue2({
  el: '#app',

  render() {
    return h('div', [
      h('div', [
        h(
          'button',
          {
            on: {
              click: () => (appendToBodyRef.value = !appendToBodyRef.value)
            }
          },
          [`appendToBody: ${appendToBodyRef.value}`]
        )
      ]),

      // h(Popup, {
      //   props: {
      //     interactions: ['hover'],
      //     placement: 'bottom',
      //     appendToBody: appendToBodyRef.value
      //   },
      //   scopedSlots: {
      //     default: () => h('div', 'My Tooltip'),
      //     reference: () => h('button', 'Hover me')
      //   }
      // }),
      h(Popup, {
        props: {
          interactions: ['click'],
          appendToBody: appendToBodyRef.value,
          popupWrapper: (floating: any) =>
            h(
              'transition',
              {
                props: {
                  name: 'fade'
                }
              },
              [floating]
            )
        },
        scopedSlots: {
          default: () => h('div', 'My Tooltip'),
          reference: () => h('button', 'Hover and transition')
        }
      })
    ])
  }
})
