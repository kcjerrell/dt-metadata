import {
	createContext,
	useContext,
	useLayoutEffect,
	useState
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

type MeasureGroupContextObject = React.Context<{
	columns: number
	gap: number
	lineHeight: number
	maxWidth: number
	maxHeight: number
}> & { measureElem?: HTMLDivElement }

export const MeasureGroupContext: MeasureGroupContextObject = createContext(null)
MeasureGroupContext.measureElem = measureElem

export function useMeasureGrid(content?: string) {
	const cv = useContext(MeasureGroupContext)

	const [measure, setMeasure] = useState({
		span: 1,
		collapse: false,
		maxHeight: '500px'
	})

	useLayoutEffect(() => {
		if (!cv || !measureElem) return
		const { columns, gap, maxHeight, maxWidth } = cv

		measureElem.textContent = content ?? ""

		const width = measureElem.clientWidth
		const height = measureElem.clientHeight

		const span = width > maxWidth / columns - gap ? columns : 1
		const collapse = height > maxHeight

		setMeasure({
			span,
			collapse,
			maxHeight: `${cv.maxHeight}px`
		})
	}, [content, cv])

	return measure
}
