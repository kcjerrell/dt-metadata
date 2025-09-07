import { Box, HStack, StackProps, Image, BoxProps } from '@chakra-ui/react'
import { ImageItem } from './useMetadata'
import { motion } from 'motion/react'

import { Store, selectImage } from './store'
import { useSnapshot } from 'valtio'
import { ReadonlyState } from '..'

interface HistoryProps extends Omit<StackProps, 'onSelect'> {
  // images?: ImageItem[]
  // onSelect?: (image: ImageItem) => void
  // selected?: ImageItem
}

function History(props: HistoryProps) {
  const { ...restProps } = props

  const snap = useSnapshot(Store)
  const { images, currentImage } = snap

  const pinned = images.filter(i => i.pin != null)
  const unpinned = images.filter(i => i.pin == null)

  return (
    <HStack
      bgColor={'bg.1'}
      gap={1}
      // justifyContent={'start'}
      transform={'translateY(40%)'}
      // overflow={'hidden'}
      {...restProps}
    >
      <HStack gap={0}>
        {pinned.map((image, i) => (
          <HistoryItem
            key={image.id}
            image={image}
            isSelected={currentImage === image}
            onSelect={() => selectImage(image)}
          />
        ))}
      </HStack>
      {/* {pinned.length > 0 && unpinned.length > 0 && (
        <Box  width={'1px'} marginX={1} height={'100%'} />
      )} */}
      <HStack gap={0} transform={'translateY(0%)'}>
        {unpinned.map((image, i) => (
          <HistoryItem
            key={image.id}
            image={image}
            size={'2.5rem'}
            isSelected={currentImage === image}
            onSelect={() => selectImage(image)}
          />
        ))}
      </HStack>
    </HStack>
  )
}

interface HistoryItemProps extends BoxProps {
  image: ReadonlyState<ImageItem>
  isSelected: boolean
  onSelect?: () => void
  size?: string
}
function HistoryItem(props: HistoryItemProps) {
  const { image, isSelected, onSelect, size = '3rem', ...restProps } = props
  return (
    <Box
      key={image.id}
      height={size}
      width={size}
      aspectRatio={'1/1'}
      // paddingTop={0.5}
      // border={'1px solid gray'}
      bgColor={isSelected ? 'fg.0' : 'fg.2'}
      padding={'1px'}
      // paddingTop={0}
      // paddingBottom={0}
      // borderRadius={isSelected ? '10% 10% 0 0' : '0'}
      // _last={{ borderRightWidth: '2px' }}
      // _first={{ borderLeftWidth: '2px' }}
      // bgColor={isSelected ? 'orange' : 'fg.1'}
      // scale={isSelected ? 1.1 : 1}
      zIndex={isSelected ? 1 : 0}
      onClick={onSelect}
      objectFit={'cover'}
      {...restProps}
      asChild
    >
      <motion.img
        initial={{ opacity: 0.5, y: 0, scale: 1, borderRadius: '15% 15% 0% 0%' }}
        animate={{
          opacity: isSelected ? 1 : 0.8,
          y: isSelected ? 0 : 0,
          scale: isSelected ? 1.1 : 1,
          borderRadius: isSelected ? '20% 20% 0 0' : '10% 10% 0% 0%',
        }}
        whileHover={{ y: -5 }}
        src={image.url}
      />
    </Box>
  )
}

export default History
