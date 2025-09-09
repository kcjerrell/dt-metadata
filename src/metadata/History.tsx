import { Box, HStack, StackProps, Image, BoxProps } from '@chakra-ui/react'
import { motion } from 'motion/react'

import { Store, selectImage } from './store'
import { useSnapshot } from 'valtio'
import { ReadonlyState } from '..'
import { ImageItem } from '@/types'

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
    <Box className={'hide-scrollbar'} overflowX={'auto'} overflowY={'hidden'} bottom={0}>
      <HStack gap={0} transform={'translateY(30%)'} overflowY={'visible'} {...restProps}>
        {pinned.map((image, i) => (
          <HistoryItem
            key={image.id}
            image={image}
            isSelected={currentImage === image}
            onSelect={() => selectImage(image)}
            isPinned
          />
        ))}
        {unpinned.map((image, i) => (
          <HistoryItem
            key={image.id}
            // boxShadow={'4px -2px 4px 0px #0000FFff'}
            image={image}
            size={'3rem'}
            isSelected={currentImage === image}
            onSelect={() => selectImage(image)}
          />
        ))}
      </HStack>
    </Box>
  )
}

interface HistoryItemProps extends BoxProps {
  image: ReadonlyState<ImageItem>
  isSelected: boolean
  onSelect?: () => void
  size?: string
  isPinned?: boolean
}
function HistoryItem(props: HistoryItemProps) {
  const { image, isSelected, onSelect, isPinned, size = '3rem', ...restProps } = props
  return (
    <motion.div
      style={{
        height: size,
        width: size,
        aspectRatio: '1/1',
        padding: '0px',
        overflow: 'hidden',
        backgroundColor: 'black',
        borderTop: isSelected
          ? '3px solid var(--chakra-colors-highlight)'
          : isPinned
          ? '3px solid gray'
            : 'none',
        marginTop: isSelected || isPinned ? '-3px' : '0px',
        transformOrigin: 'top'
      }}
      initial={{
        y: 5,
        scale: 1,
        zIndex: 0,
        borderRadius: '0% 0% 0 0',
      }}
      animate={{
        zIndex: isSelected ? 1 : 0,
        y: isSelected ? 2 : 5,
        scale: isSelected ? 1.1 : 1,
        borderRadius: isSelected ? '10% 10% 0 0' : '0% 0% 0% 0%',
      }}
      whileHover={{
        y: -2, zIndex: 2,
        borderRadius: '10% 10% 0 0', scale: 1.2
      }}
      transition={{ duration: 0.2, ease: 'circOut' }}
      onClick={onSelect}
    >
      <motion.img
        style={{
          objectFit: 'cover',
        }}
        src={image.url}
        width={'100%'}
        height={'100%'}
        animate={{
          opacity: isSelected ? 1 : 0.7,
          borderRadius: isSelected ? '10% 10% 0 0' : '0% 0% 0% 0%',
        }}
        whileHover={{ borderRadius: '10% 10% 0 0', scale: 1.5, opacity: 0.9 }}
        transition={{ duration: 0.2, ease: 'circOut', scale: { duration: 5, ease: 'easeIn' } }}
      />
    </motion.div>
  )
}

export default History
