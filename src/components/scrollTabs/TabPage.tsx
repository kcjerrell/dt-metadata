import { BoxProps, Box } from '@chakra-ui/react'
import { PropsWithChildren, useRef } from 'react'
import { useScrollTabs } from './useScrollTabs'

export interface TabPageProps extends PropsWithChildren<BoxProps> {
  label: string
}
function TabPage(props: TabPageProps) {
  const { label, children, ...restProps } = props

  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <Box
      ref={pageRef}
      className={'hide-scrollbar'}
      scrollSnapAlign={'center'}
      height={'100%'}
      width={'100%'}
      flex={'0 0 auto'}
      overflowY={'scroll'}
      overflowX={'hidden'}
      overscrollBehavior={'auto contain'}
      {...restProps}>
      {children}
    </Box>
  )
}
export default TabPage
