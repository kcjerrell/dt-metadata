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
import Details, { DataItem } from "./Details"

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
				{...restProps}
			>
				{/* <MeasureGrid columns={2} fontSize={"sm"} maxItemLines={5}>
						{Object.entries(
							(exif ?? {}) as Record<string, unknown>,
						).map(([k, v]) => {
							const data = v
							return <DataItem key={k} label={k} data={data} />
						})}
					</MeasureGrid> */}
				<Details image={image} />
				<TabPage key={`${image?.id}_config`} label={"config"}>
					<MeasureGrid columns={2} fontSize={"sm"} maxItemLines={5}>
						<DataItem
							label={"Size"}
							data={`${dtData?.config.width} x ${dtData?.config.height}`}
							ignore={dtData?.config.width === undefined || dtData?.config.height === undefined}
						/>
						<DataItem label={"Seed"} data={dtData?.config.seed} decimalPlaces={0} />
						{null}
						<DataItem label={"Model"} data={dtData?.config.model} cols={2} />
						<HStack gridColumn={"span 2"} justifyContent={"space-evenly"}>
							<DataItem label={"Steps"} data={dtData?.config.steps} decimalPlaces={0} />
							<DataItem
								label={"ImageGuidance"}
								data={dtData?.config.imageGuidanceScale}
								decimalPlaces={1}
							/>
							<DataItem label={"Shift"} data={dtData?.config.shift} decimalPlaces={2} />
						</HStack>
						<DataItem label={"Prompt"} data={dtData?.prompt} cols={2} />
						<DataItem
							label={"Negative Prompt"}
							data={
								dtData?.negativePrompt
								// Array(6).fill("ABC").join("\n")
							}
							cols={2}
						/>
						<DataItem label={"Config"} data={dtData?.config} cols={2} expandByDefault />
					</MeasureGrid>
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
