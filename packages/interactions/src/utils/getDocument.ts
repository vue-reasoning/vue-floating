export function getDocument(element?: HTMLElement | null) {
  return element?.ownerDocument || document
}
