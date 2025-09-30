import { createContext, RefObject, useContext, useLayoutEffect, useRef, useState } from "react"
import { proxy, useSnapshot } from "valtio"

type MeasureGroupContextObject = React.Context<{
	columns: number
	gap: number
	collapseHeight?: number
	sizerRef: RefObject<HTMLDivElement | null>
	maxItemLines: number
}>

type UseMeasureGridState = {
	span: number
	collapse: "normal" | "collapsed" | "expanded"
	maxHeight: string
	toggleCollapsed: () => void
}

export const MeasureGroupContext: MeasureGroupContextObject = createContext(null)

type UseMeasureGridOpts = {
	forceSpan?: boolean
	onCollapseChange?: (value: "collapsed" | "expanded") => void
	initialCollapse?: "collapsed" | "expanded"
}

export function useMeasureGrid(content?: string, opts: UseMeasureGridOpts = {}) {
	const {
		forceSpan = false,
		onCollapseChange,
		initialCollapse = "collapsed",
	} = opts

	const cv = useContext(MeasureGroupContext)
	const stateRef = useRef<UseMeasureGridState>(null)
	if (!stateRef.current) {
		stateRef.current = proxy({
			span: 1,
			collapse: "normal",
			maxHeight: "500px",
			toggleCollapsed: () => {
				if (stateRef.current.collapse === "normal") return
				const newValue = stateRef.current.collapse === "expanded" ? "collapsed" : "expanded"
				stateRef.current.collapse = newValue
				if (onCollapseChange) onCollapseChange(newValue)
			},
		})
	}
	const state = stateRef.current
	const snap = useSnapshot(state)

	useLayoutEffect(() => {
		if (!cv || !cv.sizerRef.current) return
		const sizer = cv.sizerRef.current
		if (cv.collapseHeight === null) {
			sizer.textContent = Array(cv.maxItemLines).fill("ABC").join("\n")
			cv.collapseHeight = sizer.clientHeight
		}

		const { columns, gap, collapseHeight } = cv

		sizer.textContent = content ?? ""

		const width = sizer.clientWidth
		const height = sizer.clientHeight
		const maxWidth = sizer.parentElement?.clientWidth

		state.span = width > maxWidth / columns - gap || forceSpan ? columns : 1
		if (height > collapseHeight && state.collapse === "normal") {
			state.collapse = initialCollapse
		}
		state.maxHeight = `${collapseHeight}px`
	}, [content, cv, forceSpan, state, initialCollapse])

	return snap
}
