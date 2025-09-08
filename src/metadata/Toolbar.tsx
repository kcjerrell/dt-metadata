import { ButtonGroup, HStack, IconButton, Spacer, StackProps } from '@chakra-ui/react'
import { invoke } from '@tauri-apps/api/core'
import { FiClipboard, FiFolder, FiXCircle } from 'react-icons/fi'
import { BsPinAngle } from 'react-icons/bs'
import { addImage, pinImage, clearImages, Store } from './store'
import { DevStore, useSeries } from '@/devStore'
import { useSnapshot } from 'valtio'
import { IconType } from 'react-icons/lib'
import { RiPushpin2Line } from 'react-icons/ri'
import { GrPin } from 'react-icons/gr'
import { motion } from 'motion/react'
import { PropsWithChildren, useRef } from 'react'

interface ToolbarProps extends StackProps {}

function Toolbar(props: ToolbarProps) {
  const { ...restProps } = props

  const { currentImage } = useSnapshot(Store)

  return (
    <HStack padding={1}>
      <Spacer data-tauri-drag-region />
      <ButtonGroup
        bgColor={'bg.1'}
        flex={'0 0 auto'}
        // size={'md'}
        height={'2.4rem'}
        variant={'ghost'}
        // colorPalette={'blue'}
        borderRadius={'xl'}
        boxShadow={'lg'}
        gap={0}
        {...restProps}
        asChild
      >
        <HStack gap={0}>
          <ToolbarButton
            icon={FiClipboard}
            onClick={async () => {
              const bytes = await invoke<Uint8Array>('read_clipboard_png')
              // Convert bytes to Blob
              console.log('got bytes', bytes.length)
              addImage(bytes)
            }}
          />
          <ToolbarButton onClick={() => pinImage(true, currentImage?.pin !== null ? null : true)}>
            <Pinned pin={currentImage?.pin} />
          </ToolbarButton>
          <ToolbarButton icon={FiXCircle} onClick={clearImages} />
        </HStack>
      </ButtonGroup>
      <Spacer data-tauri-drag-region />
    </HStack>
  )
}

const ToolbarButton = (props: PropsWithChildren<{ onClick?: () => void; icon?: IconType }>) => {
  const { icon: Icon, children, onClick, ...restProps } = props

  const content = Icon ? <Icon /> : children

  return (
    <IconButton
      color={'fg.3'}
      _hover={{
        bg: 'unset',
        scale: 1.05,
        color: 'fg.1',
      }}
      onClick={onClick}
      {...restProps}
    >
      {content}
    </IconButton>
  )
}

const Pinned = ({ pin }: { pin: number | null }) => {
  const isPinned = pin != null

  const UnPinned = motion(GrPin)

  if (isPinned)
    return (
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <g transform="translate(20.354 33.361)">
            <path
              d="M127.923 6.10352e-05L111.281 6.10352e-05L31.427 0L14.7855 0L14.7855 17L31.427 17L31.427 79.3885C26.7625 82.8089 22.1701 87.2347 17.65 92.6658C5.88328 106.804 -4.1008e-05 122.747 0 140.493L0 148.993L142.708 148.993L142.708 140.493C142.708 122.728 136.813 106.772 125.024 92.6255C120.505 87.2027 115.924 82.7894 111.281 79.3857L111.281 17.0001L127.923 17.0001L127.923 6.10352e-05L127.923 6.10352e-05ZM48.427 88.7375L48.427 17.0001L94.2809 17.0001L94.2809 88.7375L98.4077 91.2136C102.822 93.8623 107.341 97.9607 111.965 103.509C119.186 112.175 123.562 121.67 125.092 131.993L17.6164 131.993C19.1439 121.683 23.5107 112.199 30.7166 103.541C35.3318 97.9953 39.8597 93.8863 44.3002 91.2135L44.3082 91.2087L48.427 88.7375L48.427 88.7375Z"
              fill="currentColor"
              transform="translate(8 0)"
            />
          </g>
        </g>
      </motion.svg>
    )

  return <UnPinned />
}

export default Toolbar
