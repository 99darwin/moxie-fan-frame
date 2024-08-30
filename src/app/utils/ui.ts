import { createSystem } from 'frog/ui'
 
export const {
  Box,
  Columns,
  Column,
  Heading,
  HStack,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  vars,
} = createSystem({
  colors: {
    bg: 'linear-gradient(180deg, #111111 0%, #000000 100%)',
    linear: 'linear-gradient(90deg, #111111 0%, #000000 100%)',
    linearBlur: 'linear-gradient(90deg, #111111 0%, #000000 100%)',
    purple400: '#633BBC',
    white: '#FFFFFF',
    black: '#000000',
  },
})