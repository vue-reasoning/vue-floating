// TODO
// The purpose of this is not to introduce vue when building the dts, 
// but I don't know how this affects the tree shake

export let Transition: any
export let Teleport: any
export let vShow: any
export let withDirectives: any

try {
  const requiredVue = require('vue')
  Transition = requiredVue.Transition
  Teleport = requiredVue.Teleport
  vShow = requiredVue.vShow
  withDirectives = requiredVue.withDirectives
} catch (error) {
  // not available
}
