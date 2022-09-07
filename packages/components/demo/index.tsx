import { h } from 'vue-demi'
import Vue from 'vue'

import { Popover } from '../src/popover/Popover'

import './index.css'

new Vue({
  el: '#app',

  render() {
    return h('div', [
      h(Popover, {
        props: {
          interactions: ['hover'],
          hoverDelay: 200
        },
        scopedSlots: {
          default: () => h('div', 'My Tooltip'),
          reference: () => h('button', 'Hover me')
        }
      }),
      h(Popover, {
        props: {
          interactions: ['hover'],
          hoverDelay: 200,
          floatingWrapper: (floating: any) =>
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
