import { createContext, RefObject, useContext, useLayoutEffect, useState } from "react"

type MeasureGroupContextObject = React.Context<{
	columns: number
	gap: number
	collapseHeight?: number
	sizerRef: RefObject<HTMLDivElement | null>
	maxItemLines: number
}>

export const MeasureGroupContext: MeasureGroupContextObject = createContext(null)

export function useMeasureGrid(content?: string) {
	const cv = useContext(MeasureGroupContext)

	const [measure, setMeasure] = useState({
		span: 1,
		collapse: false,
		maxHeight: "500px",
	})

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

		const span = width > maxWidth / columns - gap ? columns : 1
		const collapse = height > collapseHeight

		setMeasure({
			span,
			collapse,
			maxHeight: `${collapseHeight}px`,
		})
	}, [content, cv])

	return measure
}
