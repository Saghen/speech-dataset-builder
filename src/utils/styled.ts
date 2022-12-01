export const propDefault =
  <Prop extends string, PropType>(prop: Prop, defaultVal: PropType) =>
  (props: { [T in Prop]?: PropType }) =>
    props[prop] ?? defaultVal
