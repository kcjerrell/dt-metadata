import { IconButton, Spacer } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FaMinus, FaMoon, FaPlus } from "react-icons/fa6"
import { proxy, useSnapshot } from "valtio"
import Tooltip from "@/components/Tooltip"
import { useColorMode } from "@/components/ui/color-mode"
import { themeHelpers } from "@/theme/helpers"
import { capitalize } from "@/utils/helpers"
import { InfoPaneContainer } from "../Containers"
import { MetadataStore } from "../state/store"
import Config from "./Config"
import Details from "./Details"
import TabContent from "./TabContent"
import Tabs from "./tabs"

interface InfoPanelProps extends ChakraProps {}

function InfoPanel(props: InfoPanelProps) {
	const { ...rest } = props
	const { toggleColorMode } = useColorMode()

	const store = MetadataStore
	const { currentImage } = useSnapshot(store) as ReadonlyState<typeof store>

	const expandedRef =
		useRef<Record<string, { tab: string; expanded: Record<string, boolean> }>>(null)
	if (expandedRef.current === null) {
		expandedRef.current = proxy({})
	}
	if (currentImage?.id && !expandedRef.current[currentImage?.id]) {
		expandedRef.current[currentImage.id] = {
			tab: currentImage.dtData ? "config" : "details",
			expanded: {},
		}
	}
	const expandedSnap = useSnapshot(expandedRef.current)
	const currentExpanded = currentImage?.id ? expandedSnap[currentImage.id] : null
	const scrollPosRef = useRef({} as Record<string, Record<string, number>>)
	const [scrollPos, setScrollPos] = useState(0)

	const selectedTab = currentExpanded?.tab

	const selectTab = useCallback(
		(tab: string) => {
			if (currentImage?.id && expandedRef.current?.[currentImage.id]) {
				expandedRef.current[currentImage.id].tab = tab
			}
		},
		[currentImage?.id],
	)

	useEffect(() => {
		if (currentImage?.id && expandedRef.current?.[currentImage.id].tab && selectedTab) {
			setScrollPos(scrollPosRef.current[currentImage.id]?.[selectedTab] ?? 0)
		}
	}, [currentImage, selectedTab])

	const updateScroll = useCallback(
		(tab: string, pos: number) => {
			if (!store.currentImage) return
			if (!scrollPosRef.current[tab]) scrollPosRef.current[store.currentImage.id] = {}
			scrollPosRef.current[store.currentImage.id][tab] = pos
		},
		[store],
	)

	return (
		<InfoPaneContainer {...rest}>
			<Tabs.Root
				lazyMount
				unmountOnExit
				height={"100%"}
				value={currentExpanded?.tab}
				onValueChange={(e) => selectTab(e.value)}
			>
				<Tabs.List>
					{["details", "config"].map((tab) => (
						<Tabs.Trigger key={tab} value={tab}>
							{capitalize(tab)}
						</Tabs.Trigger>
					))}
					<Spacer />
					<Tooltip tip={"Decrease font size"}>
						<IconButton
							color={"fg.3"}
							_hover={{ color: "fg.1", bgColor: "unset", scale: 1.1 }}
							size="2xs"
							variant="ghost"
							onClick={themeHelpers.decreaseSize}
						>
							<FaMinus />
						</IconButton>
					</Tooltip>
					<Tooltip tip={"Increase font size"}>
						<IconButton
							color={"fg.3"}
							_hover={{ color: "fg.1", bgColor: "unset", scale: 1.1 }}
							size="2xs"
							variant="ghost"
							onClick={themeHelpers.increaseSize}
						>
							<FaPlus />
						</IconButton>
					</Tooltip>
					<Tooltip tip={"Toggle color mode"}>
						<IconButton
							color={"fg.3"}
							_hover={{ color: "fg.1", bgColor: "unset", scale: 1.1 }}
							size="2xs"
							variant="ghost"
							onClick={toggleColorMode}
						>
							<FaMoon />
						</IconButton>
					</Tooltip>
					<Tabs.Indicator />
				</Tabs.List>
				<TabContent
					key={`${currentImage?.id}_details`}
					value="details"
					updateScroll={updateScroll}
					scrollPos={scrollPos}
				>
					{currentImage && (
						<Details
							imageSnap={currentImage}
							expandItems={Object.keys(expandedSnap[currentImage.id]?.expanded ?? []).map((k) =>
								k.replace("details_", ""),
							)}
							onItemCollapseChanged={(subkey, collapse) => {
								if (!expandedRef.current?.[currentImage.id]) return
								const key = `details_${subkey}`
								if (collapse === "collapsed")
									delete expandedRef.current[currentImage.id].expanded[key]
								else expandedRef.current[currentImage.id].expanded[key] = true
							}}
						/>
					)}
				</TabContent>
				<TabContent
					key={`${currentImage?.id}_config`}
					value="config"
					updateScroll={updateScroll}
					scrollPos={scrollPos}
				>
					{currentImage && (
						<Config
							imageSnap={currentImage}
							expandItems={Object.keys(expandedSnap[currentImage.id]?.expanded ?? []).map((k) =>
								k.replace("config_", ""),
							)}
							onItemCollapseChanged={(subkey, collapse) => {
								if (!expandedRef.current?.[currentImage.id]) return
								const key = `config_${subkey}`
								if (collapse === "collapsed")
									delete expandedRef.current[currentImage.id].expanded[key]
								else expandedRef.current[currentImage.id].expanded[key] = true
							}}
						/>
					)}
				</TabContent>
				{/* <TabContent value="gen" updateScroll={updateScroll} scrollPos={scrollPos}>
					{Array.from({ length: 100 }, (_, i) => `${i} gen`).join("\n")}
				</TabContent> */}
			</Tabs.Root>
		</InfoPaneContainer>
	)
}

export default InfoPanel
