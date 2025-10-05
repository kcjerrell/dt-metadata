import { Box, type BoxProps, Flex, HStack, Image, VStack } from "@chakra-ui/react"
import {
	motion,
	MotionProps,
	useAnimate,
	useMotionValue,
	type ValueAnimationTransition,
} from "motion/react"
import { type PropsWithChildren, useEffect, useRef } from "react"
import { useSnapshot } from "valtio"
import { isInsideImage } from "@/utils/helpers"
import History from "./History"
import { MetadataStore } from "./state/store"
import Toolbar from "./Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"
import { CheckRoot, ContentPane, CurrentImage, LayoutRoot } from "./Containers"
import { showPreview } from "@/components/preview/Preview"
import InfoPanel from "./infoPanel/InfoPanel"
import { loadFromPasteboard } from "./state/imageLoaders"

type MetadataComponentProps = Parameters<typeof CheckRoot>[0]

function Metadata(props: MetadataComponentProps) {
	const { ...restProps } = props

	const dropRef = useRef<HTMLDivElement>(null)
	const imgRef = useRef<HTMLImageElement>(null)

	const snap = useSnapshot(MetadataStore)
	const { currentImage, zoomPreview } = snap

	const { isDragging, handlers } = useMetadataDrop()

	useEffect(() => {
		const handler = () => loadFromPasteboard("general")
		window.addEventListener("paste", handler)
		return () => window.removeEventListener("paste", handler)
	}, [])

	return (
		<CheckRoot
			id={"metadata"}
			// initial={{
			// 	opacity: 1,
			// 	maskImage: "radial-gradient(circle at 50px 50px, #ffffff00 0%, #ffffff00 0%, #ffffff00 100%)",
			// }}
			// animate={{
			// 	opacity: 1,
			// 	maskImage: "radial-gradient(circle at 50px 50px, #ffffffff 0%, #ffffffff 100%, #fffffff 150%)",
			// }}
			// transition={
			// 	{
			// 		duration: 0.2,
			// 		ease: "easeInOut",
			// 	} as MotionProps["transition"]
			// }

			{...handlers}
			{...restProps}
		>
			<LayoutRoot>
				<ContentPane>
					<Toolbar zIndex={3} />
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
								onClick={(e) => showPreview(e.currentTarget)}
							/>
						) : (
							<Flex color={"fg/50"} fontSize={"xl"} justifyContent={"center"} alignItems={"center"}>
								Drop image here
							</Flex>
						)}
						{snap.showHistory && (
							<HStack position={"absolute"} inset={4} bgColor={"bg.2/50"}></HStack>
						)}
					</Box>
					<History />
				</ContentPane>
				<InfoPanel />
			</LayoutRoot>

			{/* <Preview
					src={currentImage?.url}
					onClick={() => {
						MetadataStore.zoomPreview = false
					}}
					show={zoomPreview}
					imgRef={imgRef}
				/> */}
		</CheckRoot>
	)
}

export default Metadata
