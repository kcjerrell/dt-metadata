import { Box } from "@chakra-ui/react"
import {
	createContext,
	PropsWithChildren,
	RefObject,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"

const measureContainer = document.createElement("div")
measureContainer.style.position = "relative"
measureContainer.style.width = "0"
measureContainer.style.height = "0"
measureContainer.style.overflow = "hidden"
const measureElem = document.createElement("div")
measureElem.style.position = "absolute"
measureElem.style.visibility = "hidden"
measureElem.style.width = "max-content"
measureElem.style.whiteSpace = "pre-wrap"
measureContainer.appendChild(measureElem)
document.body.appendChild(measureContainer)

const MeasureGroupContext = createContext<RefObject<{
	// measureElem: HTMLDivElement
	columns: number
	gap: number
	lineHeight: number
	maxWidth: number
	maxHeight: number
}> | null>(null)

export function useMeasureGroup(content?: string) {
	const cv = useContext(MeasureGroupContext)

	const [measure, setMeasure] = useState({
		span: 1,
		collapse: false,
	})

	useLayoutEffect(() => {
		if (!cv || !measureElem) return
		const { columns, gap, lineHeight, maxHeight, maxWidth } = cv.current

		measureElem.textContent = content ?? ""

		const width = measureElem.clientWidth
		const height = measureElem.clientHeight

		const span = width > maxWidth / columns - gap ? columns : 1
		const collapse = height > maxHeight
		// console.log(content.toString().slice(0, 20), maxHeight, height, width)
		// console.log(width, measureElem.clientWidth, columns, gap)
		// console.log(
		// 	span,
		// 	collapse,
		// 	measureElem.clientWidth,
		// 	measureElem.clientHeight,
		// 	content.slice(0, 20),
		// )
		setMeasure({
			span,
			collapse,
		})
	}, [content, cv])

	return measure
}

type MeasureGroupProviderProps = PropsWithChildren<{
	// containerRef: React.RefObject<HTMLDivElement>
	columns: number
	maxHeight?: string
}>
export function MeasureGroupProvider(props: MeasureGroupProviderProps) {
	const { columns, maxHeight = "6rem", children } = props

	const containerRef = useRef<HTMLDivElement>(null)
	const cv = useRef({ columns, gap: 8, lineHeight: 0, maxWidth: 0, maxHeight: 0 })

	// if (!cv.current.measureElem) {
	// 	const measureElem = document.createElement("div")
	//   measureElem.id = "measureElem"
	// 	// measureElem.style.position = "absolute"
	// 	// measureElem.style.visibility = "hidden"
	// 	measureElem.style.width = "auto"
	// 	measureElem.style.height = "auto"
	// 	measureElem.style.whiteSpace = "pre"
	// 	measureElem.style.overflowX = "clip"
	// 	document.body.appendChild(measureElem)
	// 	cv.current.measureElem = measureElem
	//   console.log(measureElem.clientWidth)
	//   console.log(measureElem.style)
	// }

	useLayoutEffect(() => {
		if (!containerRef.current) return

		cv.current.maxWidth = containerRef.current.clientWidth
		measureElem.style.maxWidth = `${cv.current.maxWidth}px`
		const fontSize = window.getComputedStyle(containerRef.current).fontSize
		// measureElem.style.width = 'auto'

		// measureElem.style.height = "auto"
		measureElem.style.fontSize = fontSize
		measureElem.textContent = "ABC"
		cv.current.lineHeight = measureElem.clientHeight

		// measureElem.style.whiteSpace="pre"
		// measureElem.textContent = Array(6).fill("ABC").join("\n")
		cv.current.maxHeight = measureElem.clientHeight * 4
		// measureElem.style.whiteSpace = "normal"

		console.log(
			cv.current,
			fontSize,
			measureElem.clientWidth,
			measureElem.clientHeight,
			containerRef.current.clientWidth,
			containerRef.current.clientHeight,
		)
		// console.log(cv.current.maxWidth, measureElem, measureElem.clientWidth, cv.current.lineHeight)
	})

	// useEffect(() => {
	// 	return () => {
	// 		if (cv.current.measureElem) {
	// 			cv.current.measureElem.remove()
	// 		}
	// 	}
	// }, [])

	return (
		<MeasureGroupContext value={cv}>
			<Box ref={containerRef} asChild>
				{children}
			</Box>
		</MeasureGroupContext>
	)
}
