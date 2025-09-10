import { Box, Flex, HStack, Image, StackProps, VStack } from '@chakra-ui/react'
import { LayoutGroup, motion } from 'motion/react'
import { useRef } from 'react'
import 'react-json-view-lite/dist/index.css'
import History from './History'
import InfoPane from './InfoPane'
import Toolbar from './Toolbar'
import { useMetadataDrop } from './useMetadataDrop'

import { useSnapshot } from 'valtio'
import { MetadataStore } from './store'
import { ImageItem } from '@/types'
import { since } from '@/devStore'

interface MetadataComponentProps extends StackProps { }

function Metadata(props: MetadataComponentProps) {
  const { ...restProps } = props

  const dropRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const snap = useSnapshot(MetadataStore)
  const { currentImage, zoomPreview } = snap

  // const { state, currentImage, setZoomPreview, loadData, selectImage, setImageTab } = useMetadata()
  // const { zoomPreview } = state
  const { isDragging, handlers } = useMetadataDrop()

  // useEffect(() => {
  //   loadData(
  //     '/Users/kcjer/ai/jk/rich_3d_rendering_____very_detailed_3d_image__rich_painterly_texture__beautiful_lighting__slightly_exaggerated_features__subtle_2_5d_cartoon_style__skin_has_a_realistic_texture_with_subt_698226638.png'
  //   )
  // }, [loadData])
since('render')
  return (
    <Box width="100vw" height="100vh" position={'relative'} overscrollBehavior={'none none'}>
      <LayoutGroup>
        <HStack
          position={'absolute'}
          width="100%"
          height="100%"
          justifyContent="stretch"
          alignItems="stretch"
          gap={0}
          overflow={'hidden'}
          overscrollBehavior={'none none'}
          flex="1 1 auto"
          // bgColor="bg.0"
          minWidth={0}
          minHeight={0}
          {...restProps}
        >
          <VStack
            flex="1 1 auto"
            padding={0}
            alignItems={'stretch'}
            justifyContent={'start'}
            gap={0}
            minWidth={0}
          >
            <Toolbar />
            <Box
              ref={dropRef}
              flex={'1 1 auto'}
              display="flex"
              justifyContent="center"
              alignItems="center"
              minWidth={0}
              minHeight={0}
              padding={currentImage ? 1 : 8}
              width={'100%'}
              // {...handlers}
            >
              {currentImage?.url ? (
                <Image
                  ref={imgRef}
                  visibility={zoomPreview ? 'hidden' : 'visible'}
                  objectFit={'contain'}
                  src={currentImage?.url}
                  width={'100%'}
                  height={'100%'}
                  borderRadius={'sm'}
                  onClick={() => (MetadataStore.zoomPreview = true)}
                />
              ) : (
                <Flex
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
                >
                  Drop image here
                </Flex>
              )}
            </Box>
            <History />
          </VStack>
          <InfoPane width={'20rem'} />
        </HStack>

        <Preview
          image={currentImage as ImageItem}
          imgRef={imgRef.current}
          onClick={() => {
            MetadataStore.zoomPreview = false
          }}
          show={zoomPreview}
        />
      </LayoutGroup>
    </Box>
  )
}

type PreviewProps = {
  imgRef?: HTMLImageElement | null
  image?: ImageItem
  onClick?: () => void
  show?: boolean
}
function Preview(props: PreviewProps) {
  const { imgRef, image, onClick, show } = props

  return (
    <Box
      width={'100%'}
      height={'100%'}
      position={'absolute'}
      zIndex={20}
      bgColor={'black/80'}
      onClick={() => onClick?.()}
      pointerEvents={show ? 'all' : 'none'}
      asChild
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }}>
        <Image
          position={'absolute'}
          objectFit={'contain'}
          src={image?.url}
          top={'0px'}
          left={'0px'}
          // right={'50px'}
          // bottom={'50px'}
          width={'100%'}
          height={'100%'}
        />
      </motion.div>
    </Box>
  )
}

export default Metadata
