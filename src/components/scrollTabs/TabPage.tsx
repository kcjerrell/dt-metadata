import { ScrollTabsContext2 } from "@/metadata/ScrollTabs"
import { Box, chakra, defineRecipe, type BoxProps } from "@chakra-ui/react"
import { type PropsWithChildren, RefObject, useContext, useEffect } from "react"
import { useSnapshot } from "valtio"

export interface TabPageProps extends PropsWithChildren<BoxProps> {
	label: string
	ref?: RefObject<HTMLDivElement>
}
function TabPage(props: TabPageProps) {
	const { label, children, ...restProps } = props

	const cv = useContext(ScrollTabsContext2)
	const snap = useSnapshot(cv)

	const isSelected = snap.selectedTab === label

	useEffect(() => {
		cv.addTab(label)
	}, [cv, label])

	// if (!isSelected) return null

	return (
		<TabPageContainer ref={props.ref} isSelected={isSelected} {...restProps}>
			{isSelected && children}
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
			overflowX: "hidden",
			overscrollBehavior: "auto contain",
			overflowY: "scroll",
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
	// { defaultProps: { className: "hide-scrollbar" } },
)

export default TabPage
