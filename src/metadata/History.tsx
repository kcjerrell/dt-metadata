import { Box, type BoxProps, HStack, type StackProps } from "@chakra-ui/react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"
import { useCallback, useRef } from "react"
import { useSnapshot } from "valtio"
import type { ImageItem } from "./state/ImageItem"
import { MetadataStore, selectImage } from "./state/store"

interface HistoryProps extends Omit<StackProps, "onSelect"> {}

function History(props: HistoryProps) {
	const { ...restProps } = props

	const snap = useSnapshot(MetadataStore)
	const { images, currentImage } = snap

	const pinned = images.filter((i) => i.pin != null) as ImageItem[]
	const unpinned = images.filter((i) => i.pin == null) as ImageItem[]
	const imageItems = [...pinned, ...unpinned] as ReadonlyState<ImageItem[]>

	const scrollRef = useRef<HTMLDivElement>(null)

	const fadeAmv = useMotionValue(0)
	const fadeBmv = useMotionValue(0)
	const maskImage = useMotionTemplate`linear-gradient(90deg, #ffffff00 0%, #ffffffff ${fadeAmv}px)`

	const updateScroll = useCallback(() => {
		if (!scrollRef.current) return
		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
		if (clientWidth >= scrollWidth) {
			fadeAmv.set(0)
			fadeBmv.set(0)
			return
		}
		const leftP = scrollLeft / scrollWidth
		const rightP = (scrollLeft + clientWidth) / scrollWidth
		fadeAmv.set(leftP * clientWidth)
		fadeBmv.set((rightP - leftP) * clientWidth)
	}, [fadeAmv, fadeBmv])

	return (
		<Box
			className={"group"}
			display={"relative"}
			flex={"0 0 auto"}
			bottom={"0px"}
			marginBottom={"-1rem"}
			transition={"transform 0.1s ease-in-out"}
			height={"4rem"}
			_hover={{
				transform: "translateY(-0.5rem)",
				"&>div.scroller": {
					// bottom: "0.5rem",
					height: "5px",
				},
			}}
			transform={"translateY(0rem)"}
			overflowY={"clip"}
			{...{
				"&>div.scroller": {
					// bottom: "calc(0.5rem - 5px)",
					height: "0px",
					transition: "height 0.3s",
				},
			}}
		>
			<motion.div
				className={"scroller"}
				style={{
					backgroundColor: "red",
					zIndex: 2,
					position: "absolute",
					bottom: "calc(0.5rem)",
					// height: "5px",
					width: fadeBmv,
					left: fadeAmv,
				}}
			/>
			<Box
				ref={(elem: HTMLDivElement) => {
					if (!elem) return
					scrollRef.current = elem
					const ro = new ResizeObserver(updateScroll)
					ro.observe(elem)
					return () => ro.disconnect()
				}}
				className={"hide-scrollbar"}
				overflowX={"auto"}
				overflowY={"hidden"}
				onScroll={updateScroll}
			>
				<HStack
					gap={"-1px"}
					transform={"translateY(10%)"}
					overflow={"visible"}
					position={"relative"}
					{...restProps}
				>
					{imageItems.map((image) => (
						<HistoryItem
							key={image.id}
							image={image}
							isSelected={currentImage?.id === image.id}
							onSelect={() => {
								selectImage(image)
							}}
							isPinned={image.pin != null}
						/>
					))}
				</HStack>
			</Box>
		</Box>
	)
}

interface HistoryItemProps extends BoxProps {
	image: ReadonlyState<(typeof MetadataStore)["images"][number]>
	isSelected: boolean
	onSelect?: () => void
	size?: string
	isPinned?: boolean
}
function HistoryItem(props: HistoryItemProps) {
	const { image, isSelected, onSelect, isPinned, size = "4rem", ...restProps } = props
	return (
		<Box asChild {...restProps}>
			<motion.div
				className={"round-last"}
				style={{
					display: "flex",
					flexDirection: "column",
					height: size,
					width: size,
					flex: `0 0 ${size}`,
					aspectRatio: "1/1",
					paddingInline: "0px",
					paddingBlock: "0px",
					overflow: "hidden",
					border: "1px solid var(--chakra-colors-gray-700)",
					marginInline: "-0.5px",
					backgroundColor: "var(--chakra-colors-gray-700)",
					// borderTop: isSelected ? "0px solid transparent" : "unset",
					marginTop: isSelected || isPinned ? "-3px" : "0px",
					transformOrigin: "top",
				}}
				initial={{
					y: 5,
					scale: 1,
					zIndex: 0,
					borderRadius: "0% 0% 0 0",
				}}
				animate={{
					zIndex: isSelected ? 1 : 0,
					y: isSelected ? 2 : 5,
					scale: isSelected ? 1.1 : 1,
					borderRadius: isSelected ? "10% 10% 0 0" : "0% 0% 0% 0%",
				}}
				whileHover={{
					y: -2,
					zIndex: 2,
					borderRadius: "10% 10% 0 0",
					scale: 1.2,
				}}
				transition={{ duration: 0.2, ease: "circOut" }}
				onClick={(e) => {
					e.stopPropagation()
					e.preventDefault()
					onSelect?.()
				}}
			>
				<motion.div
					style={{
						width: "100%",
						borderRadius: "10% 10% 0 0",
						zIndex: 2,
					}}
					initial={{
						height: "0px",
						flex: "0 0 0px",
						backgroundColor: "blue",
					}}
					animate={{
						backgroundColor: isSelected ? "var(--chakra-colors-highlight)" : "gray",
						height: isSelected || isPinned ? "3px" : "0px",
						flex: isSelected || isPinned ? "0 0 3px" : "0 0 0px",
					}}
					transition={{ duration: 0.2, ease: "circOut" }}
				/>
				<motion.img
					style={{
						objectFit: "cover",
						width: "100%",
						flex: "1 1 auto",
						transformOrigin: "middle middle",
						zIndex: 0,
						borderRadius: "0% 0% 0% 0%",
					}}
					src={image?.thumbUrl}
					animate={{
						opacity: isSelected ? 1 : 0.7,
					}}
					initial={{
						scale: 1.0,
						y: 0,
					}}
					whileHover={{
						borderRadius: isSelected || isPinned ? "0% 0% 0% 0%" : "10% 10% 0 0",
						scale: 1.5,
						opacity: 0.9,
						transition: { scale: { duration: 5, ease: "easeIn" } },
					}}
					transition={{
						duration: 0.2,
						ease: "circOut",
						scale: { duration: 0.2, ease: "easeIn" },
					}}
				/>
			</motion.div>
		</Box>
	)
}

export default History
