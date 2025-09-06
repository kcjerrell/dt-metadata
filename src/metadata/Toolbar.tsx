import { ButtonGroup, HStack, IconButton } from '@chakra-ui/react'
import { invoke } from '@tauri-apps/api/core'
import { FiClipboard, FiFolder, FiXCircle, } from 'react-icons/fi'
import { BsPinAngle } from 'react-icons/bs'
import { useMetadata } from './useMetadata'

type ToolbarProps = {}

function Toolbar(props: ToolbarProps) {
  console.log('toolbar render')
  const { loadData, clearData, pinTab, currentImage } = useMetadata()

  return (
    <ButtonGroup flex={'0 0 auto'} size={'lg'} variant={'ghost'} colorPalette={'blue'} asChild>
      <HStack gap={0}>
        <IconButton>
          <FiClipboard
            onClick={async () => {
              const bytes = await invoke<Uint8Array>('read_clipboard_png')
              // Convert bytes to Blob
              console.log('got bytes', bytes.length)
              loadData(bytes)
            }}
          />
        </IconButton>
        <IconButton onClick={() => pinTab(currentImage, currentImage.pin != null)}>
          <BsPinAngle />
        </IconButton>
        <IconButton onClick={clearData}>
          <FiXCircle />
        </IconButton>
      </HStack>
    </ButtonGroup>
  )
}

export default Toolbar
