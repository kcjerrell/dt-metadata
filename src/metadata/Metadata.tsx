import { Box, Flex, HStack, Image, type StackProps, VStack } from "@chakra-ui/react"
import { motion, useAnimate, useMotionValue, type ValueAnimationTransition } from "motion/react"
import { useEffect, useRef } from "react"
import { useSnapshot } from "valtio"
import { since } from "@/devStore"
import History from "./History"
import InfoPane from "./InfoPane"
import { MetadataStore } from "./state/store"
import Toolbar from "./Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"

interface MetadataComponentProps extends StackProps {}

function Metadata(props: MetadataComponentProps) {
	const { ...restProps } = props

	const dropRef = useRef<HTMLDivElement>(null)
	const imgRef = useRef<HTMLImageElement>(null)

	const snap = useSnapshot(MetadataStore)
	const { currentImage, zoomPreview } = snap

	const { isDragging, handlers } = useMetadataDrop()

	since("render")
	return (
		<Box
			className={"check-bg"}
			backgroundSize={"50px 50px"}
			width="100vw"
			height="100vh"
			position={"relative"}
			overscrollBehavior={"none none"}
			{...handlers}
		>
			<HStack
				position={"absolute"}
				width="100%"
				height="100%"
				justifyContent="stretch"
				alignItems="stretch"
				gap={0}
				overflow={"hidden"}
				overscrollBehavior={"none none"}
				flex="1 1 auto"
				bgColor="fg.1/10"
				minWidth={0}
				minHeight={0}
				{...restProps}
			>
				<VStack
					flex="1 1 auto"
					padding={0}
					alignItems={"stretch"}
					justifyContent={"start"}
					gap={0}
					minWidth={0}
				>
					<Toolbar />
					<Box
						ref={dropRef}
						flex={"1 1 auto"}
						display="flex"
						justifyContent="center"
						alignItems="center"
						minWidth={0}
						minHeight={0}
						padding={currentImage ? 1 : 8}
						width={"100%"}
					>
						{currentImage?.url ? (
							<Image
								ref={imgRef}
								visibility={zoomPreview ? "hidden" : "visible"}
								objectFit={"contain"}
								src={currentImage?.url}
								width={"100%"}
								height={"100%"}
								borderRadius={"sm"}
								onClick={() => {
									MetadataStore.zoomPreview = true
								}}
							/>
						) : (
							<Flex
								bgColor={isDragging ? "blue/20" : "unset"}
								color={"fg/50"}
								fontSize={"xl"}
								justifyContent={"center"}
								alignItems={"center"}
								border={"3px dashed"}
								borderColor={"fg/40"}
								width={"100%"}
								height={"100%"}
								borderRadius={"md"}
							>
								Drop image here
							</Flex>
						)}
					</Box>
					<History />
				</VStack>
				<InfoPane width={"20rem"} />
			</HStack>

			<Preview
				src={currentImage?.url}
				onClick={() => {
					MetadataStore.zoomPreview = false
				}}
				show={zoomPreview}
				imgRef={imgRef}
			/>
		</Box>
	)
}

type PreviewProps = {
	src?: string
	onClick?: () => void
	show?: boolean
	imgRef?: React.RefObject<HTMLImageElement>
}

const posTransition: ValueAnimationTransition<number> = {
	duration: 0.3,
	ease: "easeInOut",
}

function Preview(props: PreviewProps) {
	const { src, onClick, show, imgRef } = props

	const leftMv = useMotionValue(0)
	const topMv = useMotionValue(0)
	const widthMv = useMotionValue(0)
	const heightMv = useMotionValue(0)
	const posRef = useRef({ left: 0, top: 0, width: 0, height: 0 })
	const [scope, animate] = useAnimate()

	useEffect(() => {
		if (show) {
			if (imgRef.current) {
				const { left, top, width, height } = imgRef.current.getBoundingClientRect()

				posRef.current = { left, top, width, height }

				leftMv.set(left)
				widthMv.set(width)
				topMv.set(top)
				heightMv.set(height)
				animate(leftMv, 0, posTransition)
				animate(topMv, 0, posTransition)
				animate(widthMv, window.innerWidth, posTransition)
				animate(heightMv, window.innerHeight, posTransition)
			}
		} else {
			const { left, top, width, height } = posRef.current
			animate(leftMv, left)
			animate(widthMv, width)
			animate(topMv, top)
			animate(heightMv, height)
		}
	}, [show, animate, heightMv, leftMv, widthMv, topMv, imgRef])

	return (
		<Box
			ref={scope}
			width={"100vw"}
			height={"100vh"}
			overflow={"clip"}
			position={"absolute"}
			zIndex={20}
			bgColor={"black/90"}
			onClick={() => onClick?.()}
			pointerEvents={show ? "all" : "none"}
			asChild
		>
			<motion.div
				initial={{
					opacity: 0,
					backgroundColor: "#00000000",
				}}
				animate={{
					backgroundColor: show ? "#000000ff" : "#00000000",
					opacity: show ? 1 : 0,
				}}
				transition={{
					duration: 0.3,
					ease: "easeInOut",
					opacity: {
						duration: 0,
						delay: show ? 0 : 0.3,
					},
				}}
				style={{
					position: "relative",
				}}
			>
				<motion.img
					style={{
						position: "absolute",
						objectFit: "contain",
						left: leftMv,
						top: topMv,
						width: widthMv,
						height: heightMv,
					}}
					src={src}
				/>
			</motion.div>
		</Box>
	)
}

export default Metadata
