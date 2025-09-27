import { ScrollTabsContext2 } from "@/metadata/ScrollTabs"
import { chakra, defineRecipe, HStack, type StackProps } from "@chakra-ui/react"
import { useContext } from "react"

const TabPagesContainer = chakra(
	HStack,
	defineRecipe({
		base: {
			gap: 4,
			bgColor: "bg.1",
			border: "1px solid",
			borderBottom: "none",
			borderRight: "none",
			borderColor: "bg.3",
			padding: 2,
			width: "100%",
			minWidth: 0,
			position: "relative",
			height: "100%",
			minHeight: 0,

			// if you want to re-enable snapping/scrolling, you could uncomment here:
			// display: "block",
			// scrollSnapType: "x mandatory",
			// overflowX: "scroll",
		},
	}),
)

export default TabPagesContainer
