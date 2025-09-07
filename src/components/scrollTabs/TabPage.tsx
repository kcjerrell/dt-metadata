import { ScrollTabsContext2 } from '@/metadata/ScrollTabs'
import { Box, BoxProps } from '@chakra-ui/react'
import { PropsWithChildren, useContext, useEffect } from 'react'
import { useSnapshot } from 'valtio'

export interface TabPageProps extends PropsWithChildren<BoxProps> {
  label: string
}
function TabPage(props: TabPageProps) {
  const { label, children, ...restProps } = props

  const cv = useContext(ScrollTabsContext2)
  const snap = useSnapshot(cv)

  const isSelected = snap.selectedTab === label

  useEffect(() => {
    cv.addTab(label)
  }, [cv, label])

  return (
    <Box
      display={isSelected ? 'block' : 'none'}
      className={'hide-scrollbar'}
      height={'100%'}
      minHeight={0}
      width={'100%'}
      overflowY={'scroll'}
      overflowX={'hidden'}
      overscrollBehavior={'auto contain'}
      {...restProps}>
      {isSelected && children}
    </Box>
  )
}
export default TabPage
