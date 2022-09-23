import { getDocument } from './getDocument'

export function getWindow(element?: Element | null) {
  return getDocument(element)?.defaultView || window
}
