import { Box, useTabsContext } from "@chakra-ui/react"
import { useEffect, useRef } from "react"
import Tabs from "@/components/tabs"
import { motion } from "motion/react"

const TabContent = (props) => {
	const { updateScroll, scrollPos, children, value, ...rest } = props
	const cv = useTabsContext()

	const scrollRef = useRef<HTMLDivElement>(null)
	const scrollContentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!scrollRef.current) return

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries.find((e) => e.target === scrollContentRef.current)
			if (!entry) return
			scrollRef.current.scrollTop = scrollPos
		})
		resizeObserver.observe(scrollContentRef.current)

		return () => resizeObserver.disconnect()
	}, [scrollPos])

	if (value !== cv.value) return null

	return (
		<Tabs.Content
			className="hide-scrollbar"
			ref={scrollRef}
			value={value}
			minH={0}
			fontSize="sm"
			overflowY="auto"
			overscrollBehavior={"contain"}
			onScroll={(e) => updateScroll?.(value, e.currentTarget.scrollTop)}
			{...rest}
		>
			<Box ref={scrollContentRef}>{children}</Box>
		</Tabs.Content>
	)
}

export default TabContent
