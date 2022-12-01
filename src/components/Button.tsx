import styled from "@emotion/styled"
import { propDefault } from "@/utils/styled"
import colors from "@/colors"

export const Button = styled("button")<{
  padding?: string
  fontSize?: string
  background?: string
  color?: string
}>`
  padding: ${propDefault('padding', '18px 24px')};
  font-size: ${propDefault('fontSize', '18px')};
  background: ${propDefault('background', colors.accent)};
  color: ${propDefault('color', 'white')};
  outline: 0;
  border: 0;
  border-radius: 24px;
  cursor: pointer;
`
