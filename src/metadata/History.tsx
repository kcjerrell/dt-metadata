import { Box, type BoxProps, HStack, type StackProps } from "@chakra-ui/react"
import { motion } from "motion/react"
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
	const imageItems = [...pinned, ...unpinned]

	return (
		<Box
			className={"hide-scrollbar"}
			overflowX={"scroll"}
			overflowY={"clip"}
			flex={"0 0 auto"}
			bottom={"0px"}
			marginBottom={"-1rem"}
			_hover={{ transform: "translateY(-10%)" }}
			transition={"transform 0.1s ease-in-out"}
			height={"4rem"}
		>
			<HStack gap={0} transform={"translateY(10%)"} overflowY={"visible"} {...restProps}>
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
	const {
		image,
		isSelected,
		onSelect,
		isPinned,
		size = "4rem",
		...restProps
	} = props
	return (
		<Box asChild {...restProps}>
			<motion.div
				className={"round-last"}
				style={{
					height: size,
					width: size,
					aspectRatio: "1/1",
					paddingInline: "0px",
					paddingBlock: "0px",
					overflow: "hidden",
					border: "1px solid var(--chakra-colors-gray-700)",
					backgroundColor: "var(--chakra-colors-gray-700)",
					borderTop: isSelected
						? "3px solid var(--chakra-colors-highlight)"
						: isPinned
							? "3px solid gray"
							: "none",
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
				<motion.img
					style={{
						objectFit: "cover",
						width: "100%",
						height: "100%",
						transformOrigin: "middle middle",
					}}
					src={image?.thumbUrl}
					animate={{
						opacity: isSelected ? 1 : 0.7,
						borderRadius: isSelected || isPinned ? "10% 10% 0 0" : "0% 0% 0% 0%",
					}}
					initial={{
						scale: 1.0,
						y: 0,
					}}
					whileHover={{
						borderRadius: "10% 10% 0 0",
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
