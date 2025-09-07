import { ChakraProvider } from '@chakra-ui/react'

import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ColorModeProvider } from './components/ui/color-mode'

import { system } from './theme/theme'
import MetadataContainer from './metadata/MetadataContainer'
import { Test } from './Test'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <MetadataContainer />
        {/* <Test/> */}
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>
)
