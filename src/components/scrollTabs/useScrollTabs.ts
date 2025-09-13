import { createContext, type RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { areEquivalent } from "@/utils/helpers"

export const ScrollTabsContext = createContext<ReturnType<typeof useCreateScrollTabs>>(undefined)

export function useCreateScrollTabs(initialTab?: string, onChanged?: (tab: string) => void) {
	console.log("useceateScrollTabs")
	// const [state, setState] = useMutative<ScrollTabContextState>({ tabs: [], selectedTabIndex: 0 })

	const [selectedTab, setSelectedTab] = useState(initialTab)
	const [tabs, setTabs] = useState<string[]>([])
	const refs = useRef<Record<string, RefObject<HTMLDivElement>>>({})

	const selectTab = useCallback(
		(tab: string) => {
			console.log("selected", tab)
			if (!tabs.includes(tab)) return

			setSelectedTab(tab)
			const elem = refs.current[tab]
			console.log("elem", elem)
			elem?.current?.scrollIntoView({ behavior: "smooth", container: "nearest" } as unknown)
		},
		[tabs],
	)

	const onScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement, UIEvent>) => {
			const pos = e.currentTarget.scrollLeft / e.currentTarget.clientWidth
			const index = Math.round(pos)
			const tab = tabs[index]
			if (!tab) return
			setSelectedTab(tab)
		},
		[tabs],
	)

	useEffect(() => {
		if (onChanged) {
			if (selectedTab) onChanged(selectedTab)
		}
	}, [onChanged, selectedTab])

	const registerPages = useCallback((tabs: { label: string; ref: RefObject<HTMLDivElement> }[]) => {
		console.log("registerPages", tabs)

		for (const tab of tabs) {
			if (tab.ref) refs[tab.label] = tab.ref
		}
		console.log(refs.current)
		const labels = tabs.map((v) => v.label)

		if (!areEquivalent(labels, tabs)) setTabs(tabs.map((v) => v.label))
	}, [])

	const cv = useMemo(
		() => ({ tabs, registerPages, selectTab, onScroll, selectedTab }),
		[tabs, registerPages, selectTab, onScroll, selectedTab],
	)

	return cv
}

export function useScrollTabs() {
	return useContext(ScrollTabsContext)
}
