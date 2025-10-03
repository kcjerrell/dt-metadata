import { Box, chakra, GridItem, HStack } from "@chakra-ui/react"
import { useCallback } from "react"
import { useMeasureGrid } from "@/components/measureGrid/useMeasureGrid"
import { useTimedState } from "@/hooks/useTimedState"

interface DataItemProps<T> extends ChakraProps {
	label: string
	data: T
	cols?: number
	ignore?: boolean
	decimalPlaces?: number
	onCollapseChange?: (collapsed: "collapsed" | "expanded") => void
	initialCollapse?: "collapsed" | "expanded"
	expanded?: boolean
}

function DataItem(props: DataItemProps<unknown>) {
	const {
		data,
		label,
		cols,
		decimalPlaces,
		ignore,
		onCollapseChange,
		initialCollapse,
		expanded,
		...rest
	} = props
	const [justCopied, setJustCopied] = useTimedState(false, 1000)

	const [content, forceSpan, type] = prepData(data, { decimalPlaces })
	const { collapse, span, maxHeight, toggleCollapsed } = useMeasureGrid(content, {
		forceSpan,
		expanded,
		initialCollapse,
		onCollapseChange,
	})
	const colSpan = cols ?? span
	const gridColumn = colSpan > 1 ? `1 / span ${colSpan}` : undefined

	const handleClick = useCallback(() => {
		setJustCopied(true)
	}, [setJustCopied])

	return (
		<GridItem
			alignItems={"stretch"}
			display={"flex"}
			flexDirection={"column"}
			gridColumn={gridColumn}
			position={"relative"}
		>
			{/* <VStack gap={0}> */}
			<HStack justifyContent={"space-between"}>
				<Box paddingLeft={0.5} fontWeight={600} fontSize={"xs"} color={"fg.2"}>
					{justCopied ? "Copied!" : label}
				</Box>
				{collapse !== "normal" && (
					<Box fontSize={"xs"} color={"fg.2"} onClick={() => toggleCollapsed()}>
						{collapse === "collapsed" ? "Expand" : "Collapse"}
					</Box>
				)}
			</HStack>
			<DataItemContent
				collapse={collapse}
				type={type}
				onClick={handleClick}
				maxHeight={maxHeight}
				{...rest}
			>
				{content}
			</DataItemContent>
		</GridItem>
	)
}

export default DataItem

const DataItemContent = chakra("div", {
	base: {
		outline: "1px solid transparent",
		padding: 0.5,
		border: "1px solid transparent",
		overflowX: "clip",
		overflowY: "clip",
		minWidth: 0,
		whiteSpace: "pre-wrap",
		_hover: {
			outlineColor: "fg.2",
		},
	},
	variants: {
		collapse: {
			collapsed: {
				marginBottom: 0.5,
				_after: {
					content: '""',
					position: "absolute",
					height: "2rem",
					backgroundImage: "linear-gradient(0deg, var(--chakra-colors-bg-2) 0%, #00000000 100%)",
					bottom: '2px',
					right: 0,
					left: 0,
				},
			},
			expanded: {
				maxHeight: "min-content !important",
			},
			normal: {},
		},
		type: {
			object: {
				textIndent: "1rem hanging each-line",
			},
			string: {},
			number: {},
			boolean: {},
			array: {},
			null: {},
			undefined: {},
		},
	},
})

type PrepDataOpts = {
	decimalPlaces?: number
}
type PrepDataTypes = "string" | "number" | "boolean" | "array" | "object" | "null" | "undefined"
export function prepData(
	data: unknown,
	opts?: PrepDataOpts,
): [string | null, boolean, PrepDataTypes] {
	if (Array.isArray(data)) return [null, true, "array"]
	if (typeof data === "number") {
		if (opts?.decimalPlaces === undefined && isInt(data))
			return [String(Math.round(data)), false, "number"]
		return [data.toFixed(opts?.decimalPlaces ?? 2), false, "number"]
	}
	if (typeof data === "boolean") return [String(data), false, "boolean"]
	if (typeof data === "string") {
		const text = data.replace(/&#xA;/g, "\n")
		if (
			(text.startsWith("{") && text.endsWith("}")) ||
			(text.startsWith("[") && text.endsWith("]"))
		) {
			try {
				return prepData(JSON.parse(text), opts)
			} catch {}
			try {
				const cleaned = text
					.replace(/\bNaN\b/g, "null")
					.replace(/\bInfinity\b/g, "null")
					.replace(/\b-?Infinity\b/g, "null")
					.replace(/\bundefined\b/g, "null")

				return prepData(JSON.parse(cleaned), opts)
			} catch {}
		}
		return [text, false, "string"]
	}
	if (data === null) return ["undefined", false, "null"]
	if (data === undefined) return ["undefined", false, "undefined"]
	if (typeof data === "object") {
		if ("lang" in data && data.lang === "x-default" && "value" in data)
			return prepData(data.value, opts)
		return [JSON.stringify(data, null, 2), true, "object"]
	}

	return [null, false, "null"]
}

function isInt(value: number, epsilon = 0.000001) {
	return Math.abs(Math.round(value) - value) < epsilon
}