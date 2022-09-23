export type InteractorType = HTMLElement | null | undefined

export type Delay = number
export type InteractionDelayType = 'active' | 'inactive'
export type InteractionDelay =
  | Delay
  | Partial<Record<InteractionDelayType, Delay>>
  | undefined

export interface BaseInteractionInfo<T extends string = string, U = Event> {
  type: T
  event?: U | null
}

export interface ActiveInfo<T extends string = string, U = Event> {
  /**
   * This information is the interaction information that finally sets active.
   */
  final?: BaseInteractionInfo<T, U>

  /**
   * This information is the action information of the last attempt to set active,
   * but it may not successfully change the state of active.
   */
  lastTry?: BaseInteractionInfo<T, U>
}

export interface BaseDelayInfo<T extends string = string, U = Event>
  extends BaseInteractionInfo<T, U> {
  /**
   * The value to expect to set when the delay ends.
   */
  value: boolean

  /**
   * Delay time.
   */
  delay?: Delay
}

export interface DelayInfo<T extends string = string, U = Event> {
  /**
   * This information is the interaction information that finally sets active.
   */
  final?: BaseDelayInfo<T, U>

  /**
   * We prioritize using the least delay, so it may not successfully change the state of active.
   */
  lastTry?: BaseDelayInfo<T, U>
}

export interface ElementProps {
  interactor?: Record<string, any>
  target?: Record<string, any>
}
