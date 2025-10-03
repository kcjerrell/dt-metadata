import { type BoxProps, Button, HStack, VStack } from "@chakra-ui/react"
import { getAllWebviews } from "@tauri-apps/api/webview"
import { getAllWebviewWindows } from "@tauri-apps/api/webviewWindow"
import { getAllWindows } from "@tauri-apps/api/window"
import { useState } from "react"
import { FiMoon } from "react-icons/fi"
import { useSnapshot } from "valtio"
import MeasureGrid from "@/components/measureGrid/MeasureGrid"
import TabPage from "@/components/scrollTabs/TabPage"
import { useColorMode } from "@/components/ui/color-mode"
import { getClipboardTypes } from "@/utils/clipboard"
import ScrollTabs from "./ScrollTabs"
import { cleanUp, MetadataStore } from "./state/store"
import { InfoPaneContainer } from "./Containers"
import Details from "./infoPanel/Details"
import DataItem from './infoPanel/DataItem'
import type { ImageItem } from "./state/ImageItem"

interface InfoPanelProps extends BoxProps {}

function InfoPane(props: InfoPanelProps) {
	const { ...restProps } = props

	const snap = useSnapshot(MetadataStore)
	const { currentImage: image } = snap

	const { toggleColorMode } = useColorMode()

	const { exif, dtData } = image ?? {}

	const [clipTypes, setClipTypes] = useState([] as string[])

	return (
		<InfoPaneContainer>
			<ScrollTabs
				tabTransform={"capitalize"}
				rightButtons={[
					{
						content: <FiMoon />,
						onClick: () => toggleColorMode(),
					},
				]}
				scrollPositions={image?.ui?.scrollY}
				onScrollChanged={(tab, pos) => {
					image.ui.scrollY[tab] = pos
				}}
				{...restProps}
			>
				<Details imageSnap={image as ImageItem} />
				<TabPage key={`${image?.id}_config`} label={"config"}>
					<Config dtData={dtData} />
				</TabPage>
				<TabPage key={`${image?.id}_gen`} label={"gen"}>
					{dtData?.profile?.timings?.map((t) => (
						<DataItem key={t.name} label={t.name} data={t.durations as number[]} />
					))}
				</TabPage>
				<TabPage label={"clip"}>
					<VStack alignItems={"stretch"}>
						<Button
							onClick={async () => {
								console.log(await getAllWindows())
								console.log(await getAllWebviewWindows())
								console.log(await getAllWebviews())
							}}
						>
							Window
						</Button>
						<Button onClick={() => cleanUp()}>clean up</Button>
						<Button
							onClick={async () => {
								const types = await getClipboardTypes()
								setClipTypes(types)
							}}
						>
							General
						</Button>
						<Button
							onClick={async () => {
								const types = await getClipboardTypes("drag")
								setClipTypes(types)
							}}
						>
							General
						</Button>
						<ul style={{ overflowX: "scroll" }}>
							{clipTypes.map((t, i) => (
								<li style={{ whiteSpace: "nowrap" }} key={`${i}_${t}`}>
									{t}
								</li>
							))}
						</ul>
					</VStack>
				</TabPage>
			</ScrollTabs>
		</InfoPaneContainer>
	)
}

export default InfoPane
