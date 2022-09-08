export function isEmpty(value: unknown) {
  if (Array.isArray(value)) {
    return !value.length
  }
  return value === undefined || value === null
}
