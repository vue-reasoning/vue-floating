export function getDocument(element?: Element | null) {
  return element?.ownerDocument || document
}
