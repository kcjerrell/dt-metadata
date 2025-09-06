import { HStack, StackProps } from '@chakra-ui/react'
import { useScrollTabs } from './useScrollTabs'
import { Children, cloneElement, createRef, isValidElement, useEffect } from 'react'
import { TabPageProps } from './TabPage'

interface TabPagesContainerProps extends StackProps {
}

function TabPagesContainer(props: TabPagesContainerProps) {
  const { children, ...restProps } = props
  const { registerPages, onScroll } = useScrollTabs()
  const refs = Children.map(children, child => createRef<HTMLDivElement>())

  useEffect(() => {
    const infos = Children.map(children, (child, i) =>
      isValidElement(child) ? { label: child.props.label, ref: refs[i] } : null
    ).filter(Boolean)
    registerPages(infos)
  }, [children])

  return (
    <HStack
      // display={'block'}
      scrollSnapType={'x mandatory'}
      overflowX={'scroll'}
      gap={4}
      bgColor={'bg.1'}
      padding={2}
      width={'100%'}
      minWidth={0}
      // justifyContent={'flex-start'}
      // alignItems={'stretch'}
      position={'relative'}
      height={'100%'}
      onScroll={onScroll}>
      {Children.map(children, (child, i) =>
        isValidElement(child) ? cloneElement<TabPageProps>(child, { ref: refs[i] }) : child
      )}
    </HStack>
  )
}

export default TabPagesContainer
