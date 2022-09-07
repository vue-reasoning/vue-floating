const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)
