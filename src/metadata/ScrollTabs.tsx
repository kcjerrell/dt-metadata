import TabPagesContainer from '@/components/scrollTabs/TabPagesContainer'
import { ScrollTabsContext, useCreateScrollTabs } from '@/components/scrollTabs/useScrollTabs'
import { Box, BoxProps, Button, HStack, SegmentGroup, StackProps, VStack } from '@chakra-ui/react'
import { createContext, PropsWithChildren, UIEvent } from 'react'

interface ScrollTabsProps extends PropsWithChildren<StackProps> {
  defaultTab?: string
  onChanged?: (tab: string) => void
}

function ScrollTabs(props: ScrollTabsProps) {
  const { children, defaultTab, onChanged, ...restProps } = props
  const cv = useCreateScrollTabs(defaultTab, onChanged)

  console.log('scrolltabs')
  return (
    <ScrollTabsContext.Provider value={cv}>
      <VStack
        padding={2}
        flex="0 0 auto"
        height={'100%'}
        width={'25rem'}
        gap={0}
        align={'stretch'}
        overflow={'hidden'}>
        {/* move to separate component */}
        <HStack>
          {cv.state.tabs.map(v => (
            <Button
              key={v.label}
              variant={'ghost'}
              size={'sm'}
              bgColor={v.label === cv.selectedTab?.label ? 'blue.800' : 'transparent'}
              onClick={() => cv.selectTab(v.label)}>
              {v.label}
            </Button>
          ))}
        </HStack>
        <TabPagesContainer>{children}</TabPagesContainer>
      </VStack>
    </ScrollTabsContext.Provider>
  )
}

export default ScrollTabs
