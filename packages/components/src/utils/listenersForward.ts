import { isOn, normalizeOn } from './on'

export function listenersForward(emit: (event: string, ...args: any[]) => any, events: string[]) {
  return events.reduce((forward, event) => {
    const rawType = normalizeOn(event)
    const propKey = isOn(event) ? event : `on${rawType.charAt(0).toUpperCase()}${rawType.slice(1)}`

    forward[propKey] = (...args: any[]) => emit(rawType, ...args)

    return forward
  }, {} as Record<string, (...args: any[]) => any>)
}
