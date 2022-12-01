import styled from "@emotion/styled"

export const Typography = styled("span")<{ color?: string; fontSize?: string; align?: string | boolean }>`
  ${({ color }) => color && `color: ${color}`};
  ${({ fontSize }) => fontSize && `font-size: ${fontSize}`};
  ${({ align }) => align && `text-align: ${align === true ? 'center' : align}`};
`
