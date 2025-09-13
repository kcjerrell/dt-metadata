import { ScrollTabsContext2 } from '@/metadata/ScrollTabs'
import { HStack, type StackProps } from '@chakra-ui/react'
import { useContext } from 'react'

interface TabPagesContainerProps extends StackProps {}

function TabPagesContainer(props: TabPagesContainerProps) {
  const { children, ...restProps } = props

  return (
    <HStack
      // display={'block'}
      // scrollSnapType={'x mandatory'}
      // overflowX={'scroll'}
      gap={4}
      bgColor={'bg.1'}
      border={'1px solid'}
      borderBottom={'none'}
      borderRight={'none'}
      borderColor={'bg.3'}  
      padding={2}
      width={'100%'}
      minWidth={0}
      position={'relative'}
      height={'100%'}
      minHeight={0}
      {...restProps}
    >
      {children}
    </HStack>
  )
}

export default TabPagesContainer
