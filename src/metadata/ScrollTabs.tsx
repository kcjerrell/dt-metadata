import TabPagesContainer from "@/components/scrollTabs/TabPagesContainer"
import { ScrollTabsContext, useCreateScrollTabs } from "@/components/scrollTabs/useScrollTabs"
import {
	Box,
	BoxProps,
	Button,
	type ButtonProps,
	HStack,
	SegmentGroup,
	Spacer,
	type StackProps,
	VStack,
} from "@chakra-ui/react"
import { createContext, type PropsWithChildren, UIEvent, useEffect, useRef } from "react"
import { proxy, ref, useSnapshot } from "valtio"

interface ScrollTabsProps extends PropsWithChildren<Omit<StackProps, "direction">> {
	defaultTab?: string
	onChanged?: (tab: string) => void
	tabTransform?: StackProps["textTransform"]
	rightButtons?: { content: React.ReactNode; onClick: () => void }[]
	onScrollChanged?: (tab: string, pos: number) => void
	scrollPositions?: Record<string, number>
}

type ScrollTabsContextType = {
	tabs: string[]
	selectedTab: string
	lastTab: string
	direction: number
	scrollPos: Record<string, number>
	initialScrollPos: number
	selectTab: (tab: string) => void
	addTab: (tab: string) => void
	updateScroll(tab: string, pos: number): void
}
export const ScrollTabsContext2 = createContext<ScrollTabsContextType | null>(null)

const selectedButtonStyle: ButtonProps = {
	borderBottom: "3px solid {colors.highlight}",
	bgColor: "bg.2",
	// transform: 'translateY(3px)',
	color: "highlight",
	// marginBottom: '-6px'
}

const unselectedButtonStyle: ButtonProps = {
	borderBottom: "3px solid transparent",
	bgColor: "unset",
	// transform: 'translateY(20px)',
	color: "fg.3",
}

function ScrollTabs(props: ScrollTabsProps) {
	const {
		children,
		defaultTab,
		onChanged,
		tabTransform,
		rightButtons,
		onScrollChanged,
		scrollPositions,
		...restProps
	} = props

	const store = useRef<ScrollTabsContextType>(null)
	if (!store.current) {
		store.current = proxy({
			tabs: [] as string[],
			selectedTab: defaultTab as string | null,
			lastTab: null as string | null,
			direction: 0,
			scrollPos: ref(scrollPositions ?? {}),
			initialScrollPos: 7,
			selectTab: (tab: string) => {
				if (tab === store.current.selectedTab) return
				store.current.lastTab = store.current.selectedTab
				store.current.selectedTab = tab
				const indexA = store.current.tabs.indexOf(store.current.selectedTab)
				const indexB = store.current.tabs.indexOf(store.current.lastTab)
				store.current.direction = indexA - indexB
				store.current.initialScrollPos = store.current.scrollPos[tab] ?? 0
				if (onChanged) onChanged(tab)
			},
			addTab: (tab: string) => {
				if (store.current.tabs.includes(tab)) return
				store.current.tabs.push(tab)
				store.current.scrollPos[tab] = 0
				if (!store.current.selectedTab) store.current.selectedTab = tab
			},
			updateScroll(tab: string, pos: number) {
				store.current.scrollPos[tab] = pos
				if (onScrollChanged) onScrollChanged(tab, pos)
			},
		})
	}
	const snap = useSnapshot(store.current)

	return (
		<ScrollTabsContext2.Provider value={store.current}>
			{/* move to separate component */}
			<HStack width={"100%"} position={"relative"} gap={0} bgColor={"bg.3"} paddingX={0}>
				{snap.tabs.map((v) => {
					const isSelected = v === snap.selectedTab
					return (
						<Button
							key={v}
							variant={"ghost"}
							size={"sm"}
							paddingTop={"6px"}
							paddingBottom={"2px"}
							paddingX={2}
							height={"unset"}
							borderRadius={0}
							border={"none"}
							// borderBottom={'3px solid transparent'}
							// color={'fg.3'}
							// borderInline={'unset'}
							// borderColor={isSelected ? 'bg.3' : 'transparent'}
							zIndex={2}
							// marginBottom={'-1px'}
							// borderBottomColor={isSelected ? 'highlight' : 'transparent'}
							// bgColor={'unset'}
							// fontWeight={isSelected ? 'bold' : 'normal'}
							textTransform={tabTransform}
							// bgColor={isSelected ? 'accent' : 'transparent'}
							onClick={() => snap.selectTab(v)}
							// transform={'translateY(2px)'}
							// _hover={{ bgColor: isSelected ? 'bg.2' : 'bg.2' }}
							{...(isSelected ? selectedButtonStyle : unselectedButtonStyle)}
						>
							{v}
						</Button>
					)
				})}
				<Spacer data-tauri-drag-region />
				{rightButtons?.map((v, i) => (
					<Button
						key={i}
						onClick={v.onClick}
						variant={"ghost"}
						size={"sm"}
						// padding={1}
						// paddingX={2}
						height={"unset"}
					>
						{v.content}
					</Button>
				))}
				<Box
					position={"absolute"}
					// left={0}
					// width={'20px'}
					// top={0}
					// bottom={0}
					animation={"test linear forwards"}
					animationTimeline={"scroll()"}
					bgColor={"red.200"}
				/>
			</HStack>
			<TabPagesContainer>{children}</TabPagesContainer>
		</ScrollTabsContext2.Provider>
	)
}

export default ScrollTabs
