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

interface MetadataComponentProps extends ChakraProps {}

function Metadata(props: MetadataComponentProps) {
	const { ...restProps } = props

	const dropRef = useRef<HTMLDivElement>(null)
	const imgRef = useRef<HTMLImageElement>(null)

	const snap = useSnapshot(MetadataStore)
	const { currentImage, zoomPreview } = snap

	const { isDragging, handlers } = useMetadataDrop()

	return (
		<CheckRoot id={"metadata"}
			{...handlers}
		>
			<BgLayer isDragging={isDragging}>
				<LayoutRoot {...restProps}>
					<ContentPane>
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
							maxHeight={["40%", "unset"]}
						>
							{currentImage?.url ? (
								<CurrentImage
									key={currentImage?.id}
									ref={imgRef}
									zoomPreview={zoomPreview}
									src={currentImage?.url}
									onClick={(e) => {
										if (isInsideImage(e, e.currentTarget)) MetadataStore.zoomPreview = true
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
						</Box>
						<History />
					</ContentPane>
					<InfoPane width={"20rem"} />
				</LayoutRoot>

				<Preview
					src={currentImage?.url}
					onClick={() => {
						MetadataStore.zoomPreview = false
					}}
					show={zoomPreview}
					imgRef={imgRef}
				/>
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

interface PreviewProps extends BoxProps {
	src?: string
	onClick?: () => void
	show?: boolean
	imgRef?: React.RefObject<HTMLImageElement>
}

const posTransition: ValueAnimationTransition<number> = {
	duration: 0.3,
	ease: "linear",
}

function Preview(props: PreviewProps) {
	const { src, onClick, show, imgRef, ...restProps } = props

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
			{...restProps}
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
					ease: "circOut",
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
