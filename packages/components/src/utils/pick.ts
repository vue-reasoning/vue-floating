export function pick<T extends object, U extends keyof T>(object: T, props: U[]): Pick<T, U> {
  const ret = {} as Pick<T, U>

  for (let i = 0; i < props.length; i++) {
    const key = props[i]
    if (key in object) {
      ret[key] = object[key]
    }
  }

  return ret
}
