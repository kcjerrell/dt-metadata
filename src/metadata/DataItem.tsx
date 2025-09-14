import { Box, type BoxProps, GridItem, type GridItemProps, HStack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useMeasureGroup } from "@/context/MeasureGroup"

interface DataItemProps extends GridItemProps {
	label: string
	data?: string | number | (string | number | undefined)[] | Record<string, unknown>
	forceJson?: boolean
	cols?: number
	decimalPlaces?: number
	expandByDefault?: boolean
	ignore?: boolean
}

const jsonProps: BoxProps = {
	whiteSpace: "pre",
	fontSize: "xs",
}

function DataItem(props: DataItemProps) {
	const {
		data: dataProp,
		label,
		cols: colsProp,
		decimalPlaces,
		forceJson,
		expandByDefault,
		ignore,
		...restProps
	} = props

	const [showCopied, setShowCopied] = useState(false)
	// const [collapse, setCollapsible] = useState(false)
	const [collapsed, setCollapsed] = useState(!expandByDefault)
	// const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 })
	// const dataRef = useRef<HTMLDivElement>(null)

	const [data, isJson = forceJson] = coerceData(dataProp, decimalPlaces)
	// const isJson = forceJson || typeof data === "object"
	const { collapse, span } = useMeasureGroup(data?.toString())

	const colSpan = colsProp ?? span
	const gridColumn = colSpan > 1 ? `1 / span ${colSpan}` : undefined

	const dataProps = collapse
		? {
				height: collapsed ? "6em" : "unset",
				overflowY: 'clip'
			}
		: {}

	const extraProps = isJson ? jsonProps : {}

	if (!data || ignore) return null

	return (
		<GridItem
			flex={"1 1 auto"}
			padding={1}
			display={"flex"}
			flexDirection={"column"}
			position={"relative"}
			gridColumn={gridColumn}
			{...restProps}
		>
			<HStack justifyContent={"space-between"}>
				<Box fontSize={"xs"} color={"fg.2"} fontWeight={"semibold"}>
					{showCopied ? "Copied" : label}
				</Box>
				{/* Show all/Show less button for collapsible items */}
				{collapse && (
					<Text
						fontSize={"xs"}
						_hover={{ color: "fg.1" }}
						asChild
					>
						<button type="button" onClick={() => setCollapsed(!collapsed)}>
							{collapsed ? "Show all" : "Show less"}
						</button>
					</Text>
				)}
			</HStack>

			<Box
				position={"relative"}
				border={"2px solid transparent"}
				paddingX={1}
				_hover={{ borderColor: "fg/40" }}
				color={"fg.2"}
				bgColor={"bg.2"}
				overflowX={isJson && !collapsed ? "auto" : "hidden"}
				minWidth={0}
				onClick={() => {
					const selection = document?.getSelection()?.toString()
					const copyText = selection || data.toString()
					navigator.clipboard.writeText(copyText)
					setShowCopied(true)
					setTimeout(() => setShowCopied(false), 1000)
				}}
				_selection={{ bgColor: "info/50", color: "fg.1" }}
				_after={
					collapse && collapsed
						? {
								content: '""',
								position: "absolute",
								height: "1rem",
								backgroundImage:
									"linear-gradient(0deg, var(--chakra-colors-bg-2) 0%, #00000000 100%)",
								bottom: 0,
								right: 0,
								left: 0,
							}
						: undefined
				}
				{...dataProps}
				{...extraProps}
				asChild
			>
				{isJson ? <code>{data.toString()}</code> : <div>{data.toString()}</div>}
			</Box>
		</GridItem>
	)
}

export default DataItem

function coerceData(
	data?: string | number | (string | number | undefined)[] | Record<string, unknown>,
	decimalPlaces = 2,
): [string | undefined, boolean?] {
	if (data === undefined) return [undefined, false]
	if (typeof data === "string") {
		try {
			if (data.startsWith("{") && data.endsWith("}")) {
				return coerceData(JSON.parse(data))
			}
			if (data.startsWith("[") && data.endsWith("]")) {
				return coerceData(JSON.parse(data))
			}
		} catch {}
		return [data, false]
	}
	if (typeof data === "number") return [formatNumber(data, decimalPlaces)]
	if (Array.isArray(data)) {
		const isSimple = data.every((d) => typeof d === "string" || typeof d === "number" || d === null)
		if (isSimple) return [`[${data.map((d) => coerceData(d, decimalPlaces)).join(", ")}]`]
		else return coerceData(JSON.stringify(data))
	}
	if (typeof data === "object") {
		return [JSON.stringify(data, null, 2), true] // [data, true] // SON.stringify(data, null, 2)
	}
	return [data, false]
}

function formatNumber(value: number, decimalPlaces = 2) {
	const scale = 10 ** decimalPlaces
	if (Math.round(value * scale) / scale === Math.round(value)) return value.toFixed(0)
	return value.toFixed(decimalPlaces)
}
