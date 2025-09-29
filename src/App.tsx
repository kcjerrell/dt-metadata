import { Box, Button, type ButtonProps, chakra, HStack, Spacer, VStack } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, Suspense, useRef, useState } from "react"
import { BiDetail } from "react-icons/bi"
import type { IconType } from "react-icons/lib"
import { useSnapshot } from "valtio"
import { Preview } from "./components/preview/preview"
import AppState from "./hooks/useAppState"
import { Loading } from "./main"
import { LayoutGroup, motion } from "motion/react"

function App() {
	const firstRender = useRef(true)
	if (firstRender.current) {
		firstRender.current = false
		getCurrentWindow().show()
		// getCurrentWindow().setShadow(false)
	}

	const snap = useSnapshot(AppState.store)
	const View = getView(snap.currentView)

	const [showSidebar, setShowSidebar] = useState(true)

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
			<Button
				variant={"ghost"}
				onClick={() => setShowSidebar(true)}
				position={"absolute"}
				top={"20px"}
				left={"5px"}
				zIndex={5}
			>
				{"->"}
			</Button>
			<LayoutGroup>
				<VStack
					// bgColor={"bg.1"}
					// background={"linear-gradient(90deg, var(--chakra-colors-bg-1) 50%, var(--chakra-colors-bg-3) 100%)"}
					flex={"0 0 68px"}
					overflow="clip"
					justifyContent={"flex-start"}
					paddingTop={"30px"}
					// border={"2px solid gray"}
					transformOrigin={"left center"}
					asChild
				>
					<motion.div
						layout={"position"}
						initial={{ width: "auto" }}
						animate={
							showSidebar
								? {
										// width: "auto",
										// scaleX: 1,
										flex: "0 0 68px",
										rotateY: 0,
										skewX: 0,
										skewY: 0,
										scaleX: 1,
										x: "0%",
										marginLeft: '0px'
									}
								: {
										// x: "-100%",
										marginLeft: '-68px'
										// width: "0px",
										// scaleX: 0,
										// flex: "0 0 0px",
										// rotateY: 90,
										// skewY: -40,
										// scaleX: 0,
									}
						}
						transition={{ duration: 0.2, ease: "easeOut" }}
					>
						{sidebarItems.map((item) => (
							<SidebarItem
								key={item.viewId}
								item={item}
								isActive={snap.currentView === item.viewId}
								onClick={() => AppState.setView(item.viewId)}
							/>
						))}
						<Spacer />
						<Button variant={"ghost"} onClick={() => setShowSidebar(false)}>
							{"<-"}
						</Button>
						{/* <SidebarItem
					icon={BiDetail}
					label={"Metadata"}
					isActive={snap.currentView === "metadata"}
					/>
					<SidebarItem icon={BiDetail} label={"Video"} isActive={snap.currentView === "vid"} /> */}
					</motion.div>
				</VStack>
				<Suspense fallback={<Loading />}>
					<View
						flex={"1 1 auto"}
						boxShadow={
							"0px 0px 16px -3px #00000033, 0px 0px 8px -2px #00000022, 0px 0px 4px -1px #00000011"
						}
						borderRadius={"xl"}
					/>
				</Suspense>
			</LayoutGroup>
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
			// paddingRight={"5px"}
			borderInline={"3px solid transparent"}
			borderRightColor={isActive ? "highlight" : "transparent"}
			borderRadius={"xs"}
			// _after={
			// 	isActive
			// 		? {
			// 				content: "''",
			// 				position: "absolute",
			// 				width: "3px",
			// 				height: "90%",
			// 				bgColor: "highlight",
			// 				right: "0px",
			// 				top: "5%",
			// 				zIndex: 5,
			// 			}
			// 		: undefined
			// }
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
