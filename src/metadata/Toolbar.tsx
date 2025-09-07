import { ButtonGroup, HStack, IconButton, StackProps } from '@chakra-ui/react'
import { invoke } from '@tauri-apps/api/core'
import { FiClipboard, FiFolder, FiXCircle } from 'react-icons/fi'
import { BsPinAngle } from 'react-icons/bs'
import { addImage, pinImage, clearImages } from './store'

interface ToolbarProps extends StackProps {}

function Toolbar(props: ToolbarProps) {
  const {...restProps} = props
  return (
    <ButtonGroup
      bgColor={'bg.1'}
      flex={'0 0 auto'}
      size={'lg'}
      variant={'ghost'}
      colorPalette={'blue'}
      gap={0}
      {...restProps}
      asChild
    >
      <HStack>
        <IconButton>
          <FiClipboard
            onClick={async () => {
              const bytes = await invoke<Uint8Array>('read_clipboard_png')
              // Convert bytes to Blob
              console.log('got bytes', bytes.length)
              addImage(bytes)
            }}
          />
        </IconButton>
        <IconButton onClick={() => pinImage(true, true)}>
          <BsPinAngle />
        </IconButton>
        <IconButton onClick={clearImages}>
          <FiXCircle />
        </IconButton>
      </HStack>
    </ButtonGroup>
  )
}

export default Toolbar
