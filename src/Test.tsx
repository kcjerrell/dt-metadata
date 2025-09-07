import { Box } from '@chakra-ui/react'
import ScrollTabs from './metadata/ScrollTabs'
import TabPage from './components/scrollTabs/TabPage'
import { useState } from 'react'

export function Test(props) {
  const [lastTab, setLastTab] = useState('Test2')

  return (
    <Box {...props} bgColor={'green.500'} width="100vw" height="100vh" padding={4}>
      <ScrollTabs >
        <TabPage label={'Test'}>Test</TabPage>
        <TabPage label={'Test2'}>Test2</TabPage>
        <TabPage label={'Test3'}>Test3</TabPage>
      </ScrollTabs>
    </Box>
  )
}
