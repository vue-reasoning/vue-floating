const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)

export function normalizeOn(event: string) {
  if (isOn(event)) {
    event = event.replace(/^on-?/, '')
    event = event.charAt(0).toLowerCase() + event.slice(1)
  }
  return event
}

export function transformLegacyListeners(listeners: Record<string, any>) {
  return Object.entries(listeners).reduce((listeners, [event, value]) => {
    listeners[normalizeOn(event)] = value
    return listeners
  }, {} as Record<string, any>)
}
