import { type BoxProps, Button, HStack, SimpleGrid, VStack } from "@chakra-ui/react"
import { useRef, useState } from "react"
import { FiMoon } from "react-icons/fi"
import { useSnapshot } from "valtio"
import TabPage from "@/components/scrollTabs/TabPage"
import { useColorMode } from "@/components/ui/color-mode"
import { getClipboardTypes } from "@/utils/clipboard"
import DataItem from "./DataItem"
import ScrollTabs from "./ScrollTabs"
import { MetadataStore } from "./state/store"
import { MeasureGroupProvider } from "@/context/MeasureGroup"

interface InfoPanelProps extends BoxProps {}

function InfoPane(props: InfoPanelProps) {
	const { ...restProps } = props

	const snap = useSnapshot(MetadataStore)
	const { currentImage: image } = snap

	const { toggleColorMode } = useColorMode()

	const { exif, dtData } = image ?? {}

	const [clipTypes, setClipTypes] = useState([] as string[])

	const exifRef = useRef<HTMLDivElement>(null)

	return (
		<ScrollTabs
			tabTransform={"capitalize"}
			rightButtons={[
				{
					content: <FiMoon />,
					onClick: () => toggleColorMode(),
				},
			]}
			padding={0}
			margin={2}
			marginLeft={0}
			borderRadius={"xl"}
			boxShadow={"lg"}
			border={"1px solid {gray/20}"}
			{...restProps}
		>
			<TabPage key={`${image?.id}_image`} label={"image"}>
				<MeasureGroupProvider columns={2}>
					<SimpleGrid columns={2} ref={exifRef} fontSize={"sm"}>
						{Object.entries(
							(exif ?? {}) as Record<string, { value: string; description?: string }>,
						).map(([k, v]) => {
							const data = v.description || v.value
							const cols = data.length > 50 ? 2 : undefined
							return <DataItem key={k} label={k} data={data} cols={undefined} />
						})}
					</SimpleGrid>
				</MeasureGroupProvider>
			</TabPage>
			<TabPage key={`${image?.id}_config`} label={"config"}>
				<MeasureGroupProvider columns={2}>
					<SimpleGrid columns={2} fontSize={"sm"}>
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
					</SimpleGrid>
				</MeasureGroupProvider>
			</TabPage>
			<TabPage key={`${image?.id}_gen`} label={"gen"}>
				{dtData?.profile?.timings?.map((t) => (
					<DataItem key={t.name} label={t.name} data={t.durations as number[]} />
				))}
			</TabPage>
			{/*<TabPage label={"test"}>
				<SimpleGrid
					templateColumns={"1fr 3rem"}
					minWidth={0}
					overflowX={"hidden"}
				>
					<Input
						ref={testInputApp}
						placeholder="app"
						gridColumnStart={1}
						gridColumnEnd={3}
					/>
					<Input
						ref={testInputAction}
						placeholder="type"
						gridColumnStart={1}
						gridColumnEnd={3}
					/>
					<Box
						width={"8rem"}
						height={"4rem"}
						border={"2px dashed gray"}
						onDragOver={(e) => e.preventDefault()}
						onDrop={(e) => {
							e.preventDefault();
							const app = testInputApp.current?.value;
							testInputApp.current.value = "";
							const action = testInputAction.current?.value;
							testInputAction.current.value = "";
							const types = [...e.dataTransfer.types].map((t) => {
								if (t === "Files")
									return `Files (${[...e.dataTransfer.files].map((f) => f.type).join(", ")})`;
								return t;
							});
							addTypes({ app, action, types, kind: "drop" });
						}}
						gridColumnStart={1}
						gridColumnEnd={3}
					>
						Drop here
					</Box>
					<Button
						gridColumnStart={1}
						gridColumnEnd={3}
						onClick={async () => {
							const app = testInputApp.current?.value;
							testInputApp.current.value = "";
							const action = testInputAction.current?.value;
							testInputAction.current.value = "";
							const types = (await getClipboardTypes()).map((t) => {
								if (t.length > 25) return `${t.slice(0, 25)}...`;
								return t;
							});
							addTypes({
								app,
								action,
								types,
								kind: "drop",
							});
						}}
					>
						Paste
					</Button>
					{typesSnap.transferTypes.map((t, i) => (
						<Fragment key={i}>
							{" "}
							<DataItem
								label={`${t.app} - ${t.action}`}
								data={t.types.join(", ")}
							/>
							<Button
								size={"2xs"}
								margin={"4px"}
								onClick={() => TypesStore.transferTypes.splice(i, 1)}
								flex={"0 0 auto"}
							>
								x
							</Button>
						</Fragment>
					))}
				</SimpleGrid>
			</TabPage> */}
			<TabPage label={"clip"}>
				<VStack alignItems={"stretch"}>
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
							<li style={{ whiteSpace: "nowrap" }} key={i}>
								{t}
							</li>
						))}
					</ul>
				</VStack>
			</TabPage>
		</ScrollTabs>
	)
}

export default InfoPane
