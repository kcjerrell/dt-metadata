import { Box, type ButtonProps, chakra, HStack, VStack } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, useRef } from "react"
import { BiDetail } from "react-icons/bi"
import type { IconType } from "react-icons/lib"
import { useSnapshot } from "valtio"
import { Preview } from "./components/preview/preview"
import AppState from "./hooks/useAppState"

function App() {
	const firstRender = useRef(true)
	if (firstRender.current) {
		firstRender.current = false
		getCurrentWindow().show()
		getCurrentWindow().setShadow(false)
	}

	const snap = useSnapshot(AppState.store)
	const View = getView(snap.currentView)

	return (
		<HStack
			position={"relative"}
			width={"100vw"}
			height={"100vh"}
			overflow="hidden"
			alignItems={"stretch"}
			gap={0}
			bgColor={"bg.2"}
		>
			<VStack
				// bgColor={"bg.1"}
				// background={"linear-gradient(90deg, var(--chakra-colors-bg-1) 50%, var(--chakra-colors-bg-3) 100%)"}
				flex={"0 0 68px"}
				overflow="hidden"
				justifyContent={"flex-start"}
				paddingTop={"30px"}
			>
				{sidebarItems.map((item) => (
					<SidebarItem
						key={item.viewId}
						item={item}
						isActive={snap.currentView === item.viewId}
						onClick={() => {
							AppState.store.currentView = item.viewId
						}}
					/>
				))}
				{/* <SidebarItem
					icon={BiDetail}
					label={"Metadata"}
					isActive={snap.currentView === "metadata"}
				/>
				<SidebarItem icon={BiDetail} label={"Video"} isActive={snap.currentView === "vid"} /> */}
			</VStack>
			<View
				flex={"1 1 auto"}
				//  boxShadow={"0px 0px 20px -1px #00000022, 0px 0px 8px -1px #00000022"}
			/>
			<Preview />
		</HStack>
	)
}

const SidebarButton = chakra("button", {
	base: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		transition: "all 0.2s ease-in-out",
		fontSize: "xs",
		width: "100%",
		borderRight: "2px solid transparent",
		color: "fg.3",
	},
	variants: {
		isActive: {
			true: {
				// borderRight: "4px solid {colors.highlight}",
				color: "highlight",
			},
		},
	},
})

const sidebarItems = [
	{
		viewId: "metadata",
		label: "Metadata",
		icon: BiDetail,
	},
	{
		viewId: "vid",
		label: "Video",
		icon: BiDetail,
	},
	{
		viewId: "library",
		label: "Library",
		icon: BiDetail,
	},
	{ viewId: "scratch", label: "Scratch", icon: BiDetail },
]

interface SidebarButtonProps extends ButtonProps {
	item: (typeof sidebarItems)[number]
	isActive: boolean
	onClick: () => void
}

function SidebarItem(props: SidebarButtonProps) {
	const { item, isActive, onClick, ...rest } = props
	const { label, icon: Icon, viewId } = item
	return (
		<Box
			position={"relative"}
			width={"100%"}
			paddingRight={"5px"}
			_after={
				isActive
					? {
							content: "''",
							position: "absolute",
							width: "3px",
							height: "90%",
							bgColor: "highlight",
							right: "0px",
							top: "5%",
							zIndex: 5,
						}
					: undefined
			}
		>
			<SidebarButton isActive={isActive} onClick={onClick} {...rest}>
				<Box width={"35px"} height={"35px"} padding={2} aspectRatio={1} asChild>
					<Icon />
				</Box>
				<Box fontSize={"10px"} fontWeight={"500"}>
					{label}
				</Box>
			</SidebarButton>
		</Box>
	)
}

const views = {
	metadata: lazy(() => import("./metadata/MetadataContainer")),
	mini: lazy(() => import("./Mini")),
	vid: lazy(() => import("./vid/Vid")),
	library: lazy(() => import("./library/Library")),
	scratch: lazy(() => import("./scratch/Scratch")),
}

function getView(view: string) {
	if (view in views) return views[view]
	return views.metadata
}

export default App
