export function isContainer(reference: unknown): reference is Element {
  return Boolean(
    reference && typeof reference === 'object' && 'contains' in reference
  )
}

export function contains(target: Element, containers: unknown[]) {
  return containers.some(
    (container) => isContainer(container) && container.contains(target)
  )
}
