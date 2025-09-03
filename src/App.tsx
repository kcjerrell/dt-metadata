import { Box, HStack, VStack } from '@chakra-ui/react'
import { Suspense } from 'react'
import { useAppState } from './hooks/useAppState'
import TitleBar from './components/TitleBar'
import { Tools } from './Tools'

function App(): React.JSX.Element {
  const [appState] = useAppState()

  // const ArrangerContainer =
  // const AceTool2 = lazy(() => import('./acetool/acetool2'))
  // const ScriptingContainer = lazy(() => import('./scripting/ScriptingContainer'))

  const ToolComponent = Tools[appState.activeTool]?.component ?? NoneSelected

  return (
    <HStack
      width={'100vw'}
      height={'100vh'}
      bgColor={'green/10'}
      alignItems={'stretch'}
      justifyContent={'stretch'}
      overflow={'hidden'}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ToolComponent />
      </Suspense>
    </HStack>
  )
}

function NoneSelected() {
  return (
    <HStack width={'100%'} height={'100%'} justifyContent={'stretch'} alignItems={'stretch'}>
      <VStack flex={'1 1 auto'} justifyContent={'stretch'} alignItems={'stretch'}>
        <TitleBar flex={'0 0 auto'} />
        <Box flex={'1 1 auto'} bgColor={'blue.800'}>
          Pick something
        </Box>
      </VStack>
    </HStack>
  )
}

function drawA(ctx: CanvasRenderingContext2D, elapsed: number, width: number, height: number) {
  const colors = ['red', 'orange', 'yellow', 'blue', 'green']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = colors[i]
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(i * width * 0.1, i * height * 0.1, (width * (5 - i)) / 5, (height * (5 - i)) / 5)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  }
}

export default App
