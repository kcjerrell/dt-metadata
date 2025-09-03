import { ChakraProvider } from '@chakra-ui/react'

import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ColorModeProvider } from './components/ui/color-mode'

// import { ToolTipProvider } from './components/tooltip/ToolTip'
import AppStateProvider from './hooks/AppStateProvider'
import { system } from './theme/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <AppStateProvider>
            <App />
        </AppStateProvider>
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>
)
