import TitleBar from '@/components/TitleBar'
import { useColorMode } from '@/components/ui/color-mode'
import {
  Box,
  ButtonGroup,
  Code,
  Flex,
  GridItem,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  StackProps,
  VStack,
} from '@chakra-ui/react'
import { invoke } from '@tauri-apps/api/core'
import { convertFileSrc } from '@tauri-apps/api/core'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import ExifReader from 'exifreader'
import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiClipboard, FiCopy, FiFolder, FiXCircle } from 'react-icons/fi'
import 'react-json-view-lite/dist/index.css'
import { useMetadata } from './useMetadata'

interface MetadataComponentProps extends StackProps {}

function Metadata(props: MetadataComponentProps) {
  const { ...restProps } = props

  const { state, loadData, clearData, setState } = useMetadata()
  const { drawThingsData: metadata } = state

  const [isDragging, setIsDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragExit = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    loadData(event.dataTransfer)
  }

  useEffect(() => {
    const webView = getCurrentWebview()
    const unlisten = webView.onDragDropEvent(event => {
      const { x, y } = event.payload.position
      const overElem = document.elementFromPoint(x, y)

      if (event.payload.type === 'over') {
        if (overElem === dropRef.current) {
          if (!isDragging) setIsDragging(true)
        } else {
          if (isDragging) setIsDragging(false)
        }
      }

      if (event.payload.type === 'drop') {
        console.log(event)
        const path = event.payload.paths[0]
        const url = convertFileSrc(path)
        ExifReader.load(url).then(tags => console.log(tags))
        setState(d => {
          d.url = url
        })
      }
    })

    return () => {
      Promise.resolve(unlisten).then(r => r())
    }
  }, [isDragging, setIsDragging])

  return (
    <HStack
      width="100%"
      height="100%"
      justifyContent="stretch"
      alignItems="stretch"
      gap={0}
      overflow={'hidden'}
      {...restProps}>
      <VStack
        flex="1 1 auto"
        justifyContent="stretch"
        alignItems="stretch"
        overflow={'hidden'}
        gap={0}>
        <TitleBar flex="0 0 auto" />
        <HStack
          flex="1 1 auto"
          bgColor="bg.0"
          minWidth={0}
          minHeight={0}
          height={'100%'}
          width={'100%'}
          alignItems={'stretch'}
          overflow={'hidden'}>
          <VStack
            flex="1 1 auto"
            padding={0}
            alignItems={'center'}
            justifyContent={'start'}
            gap={0}>
            <ButtonGroup
              flex={'0 0 auto'}
              size={'lg'}
              variant={'ghost'}
              colorPalette={'blue'}
              asChild>
              <HStack gap={0}>
                <IconButton>
                  <FiClipboard
                    onClick={async () => {
                      const [item] = await navigator.clipboard.read()
                      console.log(item.types)
                      if (item.types.includes('image/png')) {
                        const data = await item.getType('image/png')
                        loadData(data)
                        return
                      } else if (item.types.includes('text/plain')) {
                        const files = await window.api.getFilePathsFromClipboard()
                        if (files && files.length > 0) {
                          loadData(files[0])
                        }
                      }
                    }}
                  />
                </IconButton>
                <IconButton>
                  <FiFolder />
                </IconButton>
                <IconButton onClick={clearData}>
                  <FiXCircle />
                </IconButton>
              </HStack>
            </ButtonGroup>
            <Box
              flex={'1 1 auto'}
              display="flex"
              justifyContent="center"
              alignItems="center"
              minWidth={0}
              minHeight={0}
              padding={state.url ? 1 : 8}
              width={'100%'}>
              {state.url ? (
                <Image objectFit={'contain'} src={state.url} width={'100%'} height={'100%'} />
              ) : (
                <Flex
                  ref={dropRef}
                  bgColor={isDragging ? 'blue/20' : 'unset'}
                  color={'fg/50'}
                  fontSize={'xl'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  border={'3px dashed'}
                  borderColor={'fg/40'}
                  width={'100%'}
                  height={'100%'}
                  borderRadius={'md'}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragExit={handleDragExit}>
                  Drop image here
                </Flex>
              )}
            </Box>
          </VStack>
          <VStack
            flex="0 0 auto"
            bgColor="bg.1"
            height={'100%'}
            width={'25rem'}
            gap={0}
            align={'stretch'}
            overflowY={'auto'}>
            {/* {state.display?.map(({ label, data }, i) => (
              <Fragment key={i}>
                <Box fontSize={'sm'}>{label}</Box>
                <Box whiteSpace={'pre-wrap'}>{data}</Box>
              </Fragment>
            ))} */}
            <SimpleGrid columns={3} gap={0}>
              <DataItem
                label={'Size'}
                data={[metadata?.config.width, 'x', metadata?.config.height]}
              />
              <DataItem label={'Seed'} data={metadata?.config.seed} copy />
              {null}
              <DataItem label={'Model'} data={metadata?.config.model} cols={[1, 4]} copy />
              <DataItem label={'Steps'} data={metadata?.config.steps} />
              <DataItem
                label={'ImageGuidance'}
                data={metadata?.config.imageGuidanceScale}
                places={1}
              />
              <DataItem label={'Shift'} data={metadata?.config.shift} places={2} />
              <DataItem label={'Prompt'} data={metadata?.prompt} copy cols={[1, 4]} collapse />
              <DataItem
                label={'Negative Prompt'}
                data={metadata?.negativePrompt}
                copy
                cols={[1, 4]}
                collapse
              />
              <DataItem label={'Config'} data={metadata?.config} json copy cols={[1, 4]} />
            </SimpleGrid>
          </VStack>
        </HStack>
      </VStack>
    </HStack>
  )
}

type DataItemProps = {
  label: string
  data?: string | number | (string | number | undefined)[] | Record<string, unknown>
  json?: boolean
  cols?: [number, number]
  copy?: boolean
  places?: number
  collapse?: boolean
}

function DataItem(props: DataItemProps) {
  const { data: dataProp, copy, label, cols, places, collapse, json } = props
  const { colorMode } = useColorMode()
  const [isClicking, setIsClicking] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  let data = dataProp
  if (!data) return null

  if (Array.isArray(data)) {
    if (data.some(d => d === undefined || d === null)) return null
    data = data.join('')
  }

  if (typeof data === 'number') {
    data = data.toFixed(places)
  }

  const dataProps = collapse
    ? {
        height: '5rem',
        overflowY: 'auto',
        textOverflow: 'ellipsis',
        bgColor: 'bg.2/50',
      }
    : {}

  return (
    <GridItem colStart={cols?.[0]} colEnd={cols?.[1]} padding={1}>
      <HStack gap={0}>
        <Box fontSize={'xs'}>{label}</Box>
        <IconButton
          size={'2xs'}
          visibility={copy ? 'visible' : 'hidden'}
          onClick={() => {
            navigator.clipboard.writeText(data.toString())
            setShowCopied(true)
            setTimeout(() => setShowCopied(false), 1000)
          }}
          variant={'plain'}
          padding={0}
          onPointerDown={() => setIsClicking(true)}
          onPointerUp={() => setIsClicking(false)}
          transition={'all 0.01s ease-in-out'}
          onPointerLeave={() => {
            if (isClicking) {
              setIsClicking(false)
            }
          }}
          color={!showCopied ? undefined : colorMode === 'light' ? 'green.700' : 'green.300'}
          _hover={{
            // background: 'radial-gradient(circle at center, #00000055 0%, #00000000 100%)',
            '& svg': {
              strokeWidth: 3,
              // filter: 'drop-shadow(0px 0px 1px #14173677)'
            },
            color: showCopied ? undefined : colorMode === 'light' ? 'blue.700' : 'blue.300', //'#3b5bffff',
            transform: isClicking ? 'scale(0.9)' : 'scale(1.2)',
          }}>
          {showCopied ? (
            <FiCheck
              style={{
                padding: '0px',
                strokeWidth: 3,
              }}
            />
          ) : (
            <FiCopy style={{ padding: '0px' }} />
          )}
        </IconButton>
      </HStack>
      {json ? (
        <Box asChild fontSize={'sm'}>
          <Code fontSize={'sm'} whiteSpace={'pre'} bgColor={'unset'}>
            {JSON.stringify(data, null, 2)}
          </Code>
        </Box>
      ) : (
        <Box fontSize={'sm'} whiteSpace={'pre-wrap'} {...dataProps}>
          {data.toString()}
        </Box>
      )}
    </GridItem>
  )
}

export default Metadata


async function readClipboardPng() {
  try {
    const bytes = await invoke<Uint8Array>('read_clipboard_png')
    // Convert bytes to Blob
    const blob = new Blob([bytes], { type: 'image/png' })
    console.log('Got PNG blob of size', blob.size)

    // Example: object URL for preview
    const url = URL.createObjectURL(blob)
    document.querySelector('img')!.src = url
  } catch (e) {
    console.error(e)
  }
}