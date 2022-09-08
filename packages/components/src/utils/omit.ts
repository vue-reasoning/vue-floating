export function omit<T extends object, U extends string>(object: T, props: U[]): Omit<T, U> {
  const ret = {} as Omit<T, U>

  const keys = Object.keys(object)
  props = props.slice()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as keyof Omit<T, U>
    const idx = props.indexOf(key as any)
    if (idx === -1) {
      ret[key] = object[key]
    } else {
      props.splice(idx, 1)
    }
  }

  return ret
}
