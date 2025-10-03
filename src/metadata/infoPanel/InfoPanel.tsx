import { IconButton, Spacer } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FiMoon } from "react-icons/fi"
import { proxy, useSnapshot } from "valtio"
import Tabs from "@/components/tabs"
import { useColorMode } from "@/components/ui/color-mode"
import { capitalize } from "@/utils/helpers"
import { InfoPaneContainer } from "../Containers"
import type { ImageItem } from "../state/ImageItem"
import { MetadataStore } from "../state/store"
import Config from "./Config"
import Details from "./Details"
import TabContent from "./TabContent"

interface InfoPanelProps extends ChakraProps {
	image: ImageItem
}

function InfoPanel(props: InfoPanelProps) {
	const { ...rest } = props
	const { toggleColorMode } = useColorMode()
	const [selectedTab, setSelectedTab] = useState("details")

	const expandedRef = useRef(null)
	if (expandedRef.current === null) {
		expandedRef.current = proxy({} as Record<string, Record<string, boolean>>)
	}
	const expandedSnap = useSnapshot(expandedRef.current)
	const scrollPosRef = useRef({} as Record<string, Record<string, number>>)
	const [scrollPos, setScrollPos] = useState(0)

	const store = MetadataStore
	const { currentImage } = useSnapshot(store)

	useEffect(() => {
		if (currentImage?.id && selectedTab) {
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
				value={selectedTab}
				onValueChange={(e) => setSelectedTab(e.value)}
			>
				<Tabs.List>
					{["details", "config", "gen"].map((tab) => (
						<Tabs.Trigger key={tab} value={tab}>
							{capitalize(tab)}
						</Tabs.Trigger>
					))}
					<Spacer />
					<IconButton size="2xs" variant="ghost" onClick={toggleColorMode}>
						<FiMoon />
					</IconButton>
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
								expandItems={Object.keys(expandedSnap[currentImage.id] ?? []).map((k) =>
									k.replace("details_", ""),
								)}
								onItemCollapseChanged={(subkey, collapse) => {
									const key = `details_${subkey}`
									if (!expandedRef.current[currentImage.id])
										expandedRef.current[currentImage.id] = {}
									if (collapse === "collapsed") delete expandedRef.current[currentImage.id][key]
									else expandedRef.current[currentImage.id][key] = true
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
								image={currentImage}
								expandItems={Object.keys(expandedSnap[currentImage.id] ?? []).map((k) =>
									k.replace("config_", ""),
								)}
								onItemCollapseChanged={(subkey, collapse) => {
									const key = `config_${subkey}`
									if (!expandedRef.current[currentImage.id])
										expandedRef.current[currentImage.id] = {}
									if (collapse === "collapsed") delete expandedRef.current[currentImage.id][key]
									else expandedRef.current[currentImage.id][key] = true
								}}
							/>
						)}
					</TabContent>
					<TabContent
						value="gen"
						updateScroll={updateScroll}
						scrollPos={scrollPos}
					>
						{Array.from({ length: 100 }, (_, i) => `${i} gen`).join("\n")}
					</TabContent>
			</Tabs.Root>
		</InfoPaneContainer>
	)
}

export default InfoPanel
