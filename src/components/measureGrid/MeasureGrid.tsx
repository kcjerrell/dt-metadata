import { SimpleGrid, type SimpleGridProps } from '@chakra-ui/react'
import { type PropsWithChildren, useLayoutEffect, useRef } from "react"
import { MeasureGroupContext } from "@/components/measureGrid/useMeasureGrid"

interface MeasureGridProps extends SimpleGridProps {
	// containerRef: React.RefObject<HTMLDivElement>
	columns: number
	maxHeight?: string
  maxItemLines?: number
}

export function MeasureGrid(props: PropsWithChildren<MeasureGridProps>) {
	const { columns, children, maxItemLines = 4, ...restProps } = props

	const gridRef = useRef<HTMLDivElement>(null)
	const cv = useRef({ columns, gap: 8, lineHeight: 0, maxWidth: 0, maxHeight: 0 })

	const measureElem = MeasureGroupContext.measureElem

	useLayoutEffect(() => {
		if (!gridRef.current) return

		cv.current.maxWidth = gridRef.current.clientWidth
		measureElem.style.maxWidth = `${cv.current.maxWidth}px`
		const fontSize = window.getComputedStyle(gridRef.current).fontSize

    measureElem.style.fontSize = fontSize
    
    measureElem.textContent = Array(maxItemLines).fill("ABC").join("\n")
		cv.current.maxHeight = measureElem.clientHeight

		measureElem.textContent = "ABC"
		cv.current.lineHeight = measureElem.clientHeight

	})

	return (
		<MeasureGroupContext value={cv.current}>
			<SimpleGrid ref={gridRef} columns={columns} {...restProps}>
				{children}
			</SimpleGrid>
		</MeasureGroupContext>
	)
}

export default MeasureGrid