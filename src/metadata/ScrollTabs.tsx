import TabPagesContainer from '@/components/scrollTabs/TabPagesContainer'
import { ScrollTabsContext, useCreateScrollTabs } from '@/components/scrollTabs/useScrollTabs'
import { Box, BoxProps, Button, HStack, SegmentGroup, Spacer, StackProps, VStack } from '@chakra-ui/react'
import { createContext, PropsWithChildren, UIEvent, useEffect, useRef } from 'react'
import { proxy, useSnapshot } from 'valtio'

interface ScrollTabsProps extends PropsWithChildren<StackProps> {
  defaultTab?: string
  onChanged?: (tab: string) => void
  tabTransform?: StackProps['textTransform']
  rightButtons?: { content: React.ReactNode; onClick: () => void }[]
}

export const ScrollTabsContext2 = createContext(undefined)

function ScrollTabs(props: ScrollTabsProps) {
  const { children, defaultTab, onChanged, tabTransform, rightButtons, ...restProps } = props

  const store = useRef(null)
  if (!store.current) {
    store.current = proxy({
      tabs: [] as string[],
      selectedTab: defaultTab as string | null,
      lastTab: null as string | null,
      direction: 0,
      selectTab: (tab: string) => {
        if (tab === store.current.selectedTab) return
        store.current.lastTab = store.current.selectedTab
        store.current.selectedTab = tab
        const indexA = store.current.tabs.indexOf(store.current.selectedTab)
        const indexB = store.current.tabs.indexOf(store.current.lastTab)
        store.current.direction = indexA - indexB
        if (onChanged) onChanged(tab)
      },
      addTab: (tab: string) => {
        if (store.current.tabs.includes(tab)) return
        store.current.tabs.push(tab)
        if (!store.current.selectedTab) store.current.selectedTab = tab
      },
    })
  }
  const snap = useSnapshot(store.current)

  return (
    <ScrollTabsContext2.Provider value={store.current} {...restProps}>
      <VStack
        padding={0}
        flex="0 0 auto"
        height={'100%'}
        width={'25rem'}
        gap={0}
        align={'stretch'}
        overflow={'hidden'}
      >
        {/* move to separate component */}
        <HStack width={'100%'} position={'relative'} gap={0}>
          {snap.tabs.map(v => {
            const isSelected = v === snap.selectedTab
            return (
              <Button
                key={v}
                variant={'ghost'}
                size={'sm'}
                padding={1}
                paddingX={2}
                height={'unset'}
                borderRadius={0}
                border={'1px solid transparent'}
                borderTop={'none'}
                // borderInline={'unset'}
                borderColor={isSelected ? 'bg.3' : 'transparent'}
                zIndex={2}
                marginBottom={'-1px'}
                borderBottomColor={isSelected ? 'bg.1' : 'bg.3'}
                bgColor={isSelected ? 'bg.1' : 'unset'}
                // fontWeight={isSelected ? 'bold' : 'normal'}
                textTransform={tabTransform}
                // bgColor={isSelected ? 'accent' : 'transparent'}
                onClick={() => snap.selectTab(v)}
                // _hover={{ bgColor: isSelected ? '{colors.accent}' : 'accent/30' }}
              >
                {v}
              </Button>
            )
          })}
          <Spacer />
          {rightButtons?.map((v, i) => (
            <Button key={i} onClick={v.onClick}
              variant={'ghost'}
              size={'sm'}
              // padding={1}
              // paddingX={2}
              height={'unset'}
            >
              {v.content}
            </Button>
          ))}
          <Box
            position={'absolute'}
            // left={0}
            // width={'20px'}
            // top={0}
            // bottom={0}
            animation={'test linear forwards'}
            animationTimeline={'scroll()'}
            bgColor={'red.200'}
          />
        </HStack>
        <TabPagesContainer
          // borderRadius={
          //   snap.tabs.indexOf(snap.selectedTab) === 0 ? '0px 5px 5px 5px' : '5px 5px 5px 5px'
          // }
        >
          {children}
        </TabPagesContainer>
      </VStack>
    </ScrollTabsContext2.Provider>
  )
}

export default ScrollTabs
