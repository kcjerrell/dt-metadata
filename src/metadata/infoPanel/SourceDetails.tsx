import Tooltip from "@/components/Tooltip"
import { ImageSource } from "@/types"
import { HStack, IconButton, SimpleGrid, VStack } from "@chakra-ui/react"
import { FiFolder, FiSave } from "react-icons/fi"
import { TbBrowser } from "react-icons/tb"
import DataItem from "./DataItem"

function SourceDetails(props: { imageSource: ImageSource }) {
	const imageSource = props.imageSource
	const source = getSourceDescription(props.imageSource)
	return (
		<SimpleGrid
			columns={2}
			fontSize={"xs"}
			bgColor={"bg.1"}
			gap={0.5}
			width={"100%"}
			padding={1}
			alignItems={"flex-start"}
		>
			<DataItem gridColumn={1} gridRow={1} label={"Source"} data={source} />
			<DataItem
				gridColumn={2}
				gridRow={1}
				label={"Data type"}
				data={imageSource.pasteboardType}
				wordBreak={"break-word"}
			/>
			{/* <HStack gap={0}>
				<Tooltip tip={"Save a copy"}>
					<IconButton size={"sm"} color={"fg.3"} variant={"ghost"}>
						<FiSave />
					</IconButton>
				</Tooltip>
				{imageSource.file && (
					<Tooltip tip={"Show in finder"}>
						<IconButton size={"sm"} color={"fg.3"} variant={"ghost"}>
							<FiFolder />
						</IconButton>
					</Tooltip>
				)}
				{imageSource.url && (
					<Tooltip tip={"Open in browser"}>
						<IconButton size={"sm"} color={"fg.3"} variant={"ghost"}>
							<TbBrowser />
						</IconButton>
					</Tooltip>
				)}
			</HStack> */}
			{(imageSource.file || imageSource.url) && (
				<DataItem
					gridColumn={'1 / span 2'}
					gridRow={2}
					label={"Location"}
					data={imageSource.file || imageSource.url}
					wordBreak={"break-all"}
					overflow={"clip"}
				/>
			)}
		</SimpleGrid>
	)
}

export default SourceDetails

function getSourceDescription(imageSource: ImageSource) {
	let type = "Unknown"

	if (imageSource.file) type = "File"
	if (imageSource.url) type = "URL"
	if (imageSource.image) type = "Image"

	switch (imageSource.source) {
		case "clipboard":
			return `${type} from clipboard`
		case "drop":
			return `${type} drop`
		case "open":
			return "Opened from file"
	}
}
