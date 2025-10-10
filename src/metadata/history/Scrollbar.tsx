import { chakra } from '@chakra-ui/react'

interface ScrollbarProps extends ChakraProps {}

function Scrollbar(props: ScrollbarProps) {
  const { children, ...rest } = props

  return (
    <ScrollbarSomething {...rest}>
      {children}
    </ScrollbarSomething>
  )
}

const ScrollbarSomething = chakra("div", {
  base: {}
})

export default Scrollbar