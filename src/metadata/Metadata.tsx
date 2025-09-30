import { Box, type BoxProps, Flex, HStack, Image, VStack } from "@chakra-ui/react"
import { motion, useAnimate, useMotionValue, type ValueAnimationTransition } from "motion/react"
import { type PropsWithChildren, useEffect, useRef } from "react"
import { useSnapshot } from "valtio"
import { isInsideImage } from "@/utils/helpers"
import "../menu"
import History from "./History"
import InfoPane from "./InfoPane"
import { MetadataStore } from "./state/store"
import Toolbar from "./Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"
import { CheckRoot, ContentPane, CurrentImage, LayoutRoot } from "./Containers"
import { showPreview } from "@/components/preview/preview"

interface MetadataComponentProps extends ChakraProps {}

function Metadata(props: MetadataComponentProps) {
	const { ...restProps } = props

	const dropRef = useRef<HTMLDivElement>(null)
	const imgRef = useRef<HTMLImageElement>(null)

	const snap = useSnapshot(MetadataStore)
	const { currentImage, zoomPreview } = snap

	const { isDragging, handlers } = useMetadataDrop()

	return (
		<CheckRoot id={"metadata"} {...handlers} {...restProps}>
			<BgLayer isDragging={isDragging}>
				<LayoutRoot>
					<ContentPane>
						<Toolbar />
						<Box
							position={"relative"}
							ref={dropRef}
							flex={"1 1 auto"}
							display="flex"
							justifyContent="center"
							alignItems="center"
							minWidth={0}
							minHeight={0}
							padding={currentImage ? 1 : 8}
							width={"100%"}
							maxHeight={["40%", "unset"]}
						>
							{currentImage?.url ? (
								<CurrentImage
									key={currentImage?.id}
									ref={imgRef}
									src={currentImage?.url}
									onClick={(e) => {
										if (isInsideImage(e, e.currentTarget)) showPreview(e.currentTarget)
									}}
								/>
							) : (
								<Flex
									color={"fg/50"}
									fontSize={"xl"}
									justifyContent={"center"}
									alignItems={"center"}
								>
									Drop image here
								</Flex>
							)}
							{
								snap.showHistory && (
									<HStack
									position={"absolute"}
									inset={4}
									bgColor={"bg.2/50"}
									>
										
									</HStack>
								)
							}
						</Box>
						<History />
					</ContentPane>
					<InfoPane width={"20rem"} />
				</LayoutRoot>

				{/* <Preview
					src={currentImage?.url}
					onClick={() => {
						MetadataStore.zoomPreview = false
					}}
					show={zoomPreview}
					imgRef={imgRef}
				/> */}
			</BgLayer>
		</CheckRoot>
	)
}

function BgLayer({ isDragging, children }: PropsWithChildren<{ isDragging: boolean }>) {
	// const mva = useMotionValue(0)
	// const mvb = useMotionValue(0)
	// const mvc = useMotionValue(100)

	// const grad = useMotionTemplate`radial-gradient(circle at center, #0629db ${mva}%, #33e170 ${mvb}%), #0629db ${mvc}%`

	// useEffect(() => {
	// 	animate(mva, [100, 0, 100], {
	// 		times: [0, 1, 1],
	// 		duration: 3,
	// 		repeat: Infinity,
	// 		repeatType: "loop",
	// 	})
	// animate(mvb, [100, 0, 100], {times: [0, 1, 1], duration: 3, repeat: Infinity, repeatType: "loop", delay: 1 })
	// animate(mvc, [100, 0, 100], {times: [0, 1, 1], duration: 3, repeat: Infinity, repeatType: "loop", delay: 2 })
	// }, [mva, mvb, mvc])

	return (
		<motion.div
			style={
				{
					// background: isDragging ? grad : "blue",
				}
			}
		>
			{children}
		</motion.div>
	)

	// return <Box bgColor={["red/20", null, "green/20", null]}>{children}</Box>
}

export default Metadata
