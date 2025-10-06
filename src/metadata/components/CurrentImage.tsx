import { Box, chakra, Flex } from "@chakra-ui/react"
import { MetadataStore } from "../state/store"
import { useSnapshot } from "valtio"
import { motion, useMotionValue, useSpring } from 'motion/react'
import { showPreview } from '@/components/preview/Preview'
import { useEffect, useRef } from 'react'

interface CurrentImageProps extends ChakraProps {}

function CurrentImage(props: CurrentImageProps) {
	const { ...restProps } = props

	const snap = useSnapshot(MetadataStore)
	const { currentImage } = snap

  const imgRef = useRef<HTMLImageElement>(null) 

	return (
		<Box
			position={"relative"}
			flex={"1 1 auto"}
			display="flex"
			justifyContent="center"
			alignItems="center"
			minWidth={0}
			minHeight={0}
			padding={currentImage ? 1 : 8}
			width={"100%"}
			{...restProps}
		>
			{currentImage?.url ? (
				<Img
					key={currentImage?.id}
					ref={imgRef}
					src={currentImage?.url}
          onClick={(e) => showPreview(e.currentTarget)}
				/>
			) : (
				<Flex color={"fg/50"} fontSize={"xl"} justifyContent={"center"} alignItems={"center"}>
					Drop image here
				</Flex>
			)}
		</Box>
	)
}

export default CurrentImage

export const Img = motion.create(chakra(
  "img",{
    base: {
      maxWidth: "100%",
      maxHeight: "100%",
      minWidth: 0,
      minHeight: 0,
      borderRadius: "sm",
      boxShadow: "pane1"
    },
  }),
)