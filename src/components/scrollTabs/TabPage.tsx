import { ScrollTabsContext2 } from "@/metadata/ScrollTabs"
import { Box, chakra, defineRecipe, type BoxProps } from "@chakra-ui/react"
import { type PropsWithChildren, RefObject, useContext, useEffect, useRef } from "react"
import { useSnapshot } from "valtio"

export interface TabPageProps extends PropsWithChildren<BoxProps> {
	label: string
}
function TabPage(props: TabPageProps) {
	const { label, children, ...restProps } = props

	const scrollContent = useRef<HTMLDivElement>(null)
	const scrollContainer = useRef<HTMLDivElement>(null)

	const cv = useContext(ScrollTabsContext2)
	const snap = useSnapshot(cv)

	const isSelected = snap.selectedTab === label

	useEffect(() => {
		cv.addTab(label)
		if (!scrollContent.current || !scrollContainer.current) return
		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries.find((e) => e.target === scrollContent.current)
			if (!entry) return
			scrollContainer.current.scrollTop = cv.initialScrollPos
		})
		resizeObserver.observe(scrollContent.current)
		// scrollContainer.current.scrollTop = cv.initialScrollPos

		return () => resizeObserver.disconnect()
	}, [cv, label])

	if (!isSelected) return null

	return (
		<TabPageContainer
			ref={scrollContainer}
			isSelected={isSelected}
			onScroll={(e) => cv.updateScroll(label, e.currentTarget.scrollTop)}
			{...restProps}
		>
			{isSelected && <Box ref={scrollContent}>{children}</Box>}
		</TabPageContainer>
	)
}

export const TabPageContainer = chakra(
	"div",
	defineRecipe({
		base: {
			display: "block",
			height: "100%",
			width: "100%",
			minWidth: 0,
			overflowX: "clip",
			overscrollBehavior: "auto contain",
			overflowY: "auto",
			// keep the custom className too
			// since chakra recipes don’t replace classes
			// className: "hide-scrollbar",
		},
		variants: {
			isSelected: {
				true: {
					// visibility: "visible",
					display: "block",
				},
				false: {
					display: "none",
				},
			},
		},
	}),
	{ defaultProps: { className: "hide-scrollbar" } },
)

export default TabPage
