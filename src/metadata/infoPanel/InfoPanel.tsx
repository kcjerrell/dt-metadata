import { IconButton, Spacer } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FaMinus, FaMoon, FaPlus } from "react-icons/fa6"
import { proxy, useSnapshot } from "valtio"
import Tooltip from "@/components/Tooltip"
import { useColorMode } from "@/components/ui/color-mode"
import { themeHelpers } from "@/theme/helpers"
import { capitalize } from "@/utils/helpers"
import { InfoPaneContainer } from "../Containers"
import { useCurrentImage } from "../state/hooks"
import Config from "./Config"
import Details from "./Details"
import TabContent from "./TabContent"
import Tabs from "./tabs"

type UIState = {
	tab: string
	expanded: Record<string, boolean>
	scrollPos: Record<string, number>
}

interface InfoPanelProps extends ChakraProps {}

function InfoPanel(props: InfoPanelProps) {
	const { ...rest } = props
	const { toggleColorMode } = useColorMode()

	const currentImage = useCurrentImage()

	// each image item has its own selected tab and expanded detail items
	// as well as scroll position per tab
	const uiState = useRef<Record<string, UIState>>(null)
	if (uiState.current === null) {
		uiState.current = proxy({})
	}
	if (currentImage?.id && !uiState.current[currentImage?.id]) {
		uiState.current[currentImage.id] = {
			tab: currentImage.dtData ? "config" : "details",
			expanded: {},
			scrollPos: {},
		}
	}
	const expandedSnap = useSnapshot(uiState.current)
	const currentExpanded = currentImage?.id ? expandedSnap[currentImage.id] : null

	const selectedTab = currentExpanded?.tab
	const [initialScrollPos, setInitialScrollPos] = useState(0)

	const selectTab = useCallback(
		(tab: string) => {
			if (currentImage?.id && uiState.current?.[currentImage.id]) {
				uiState.current[currentImage.id].tab = tab
			}
		},
		[currentImage?.id],
	)

	useEffect(() => {
		if (currentImage?.id && uiState.current?.[currentImage.id].tab && selectedTab) {
			setInitialScrollPos(uiState.current[currentImage.id].scrollPos[selectedTab] ?? 0)
		}
	}, [currentImage?.id, selectedTab])

	const updateScroll = useCallback(
		(tab: string, pos: number) => {
			if (!currentImage?.id || !uiState.current?.[currentImage.id]) return
			uiState.current[currentImage.id].scrollPos[tab] = pos
		},
		[currentImage?.id],
	)

	return (
		<InfoPaneContainer {...rest}>
			<Tabs.Root
				lazyMount
				unmountOnExit
				height={"100%"}
				value={selectedTab}
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
					scrollPos={initialScrollPos}
				>
					{currentImage && (
						<Details
							imageSnap={currentImage}
							expandItems={Object.keys(expandedSnap[currentImage.id]?.expanded ?? []).map((k) =>
								k.replace("details_", ""),
							)}
							onItemCollapseChanged={(subkey, collapse) => {
								if (!uiState.current?.[currentImage.id]) return
								const key = `details_${subkey}`
								if (collapse === "collapsed") delete uiState.current[currentImage.id].expanded[key]
								else uiState.current[currentImage.id].expanded[key] = true
							}}
						/>
					)}
				</TabContent>
				<TabContent
					key={`${currentImage?.id}_config`}
					value="config"
					updateScroll={updateScroll}
					scrollPos={initialScrollPos}
				>
					{currentImage && (
						<Config
							imageSnap={currentImage}
							expandItems={Object.keys(expandedSnap[currentImage.id]?.expanded ?? []).map((k) =>
								k.replace("config_", ""),
							)}
							onItemCollapseChanged={(subkey, collapse) => {
								if (!uiState.current?.[currentImage.id]) return
								const key = `config_${subkey}`
								if (collapse === "collapsed") delete uiState.current[currentImage.id].expanded[key]
								else uiState.current[currentImage.id].expanded[key] = true
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
