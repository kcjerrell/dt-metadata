import { Box, type BoxProps, GridItem, type GridItemProps, HStack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useMeasureGrid } from "@/components/measureGrid/useMeasureGrid"

import { useColorMode } from "@/components/ui/color-mode"

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

	const { colorMode } = useColorMode()

	const [showCopied, setShowCopied] = useState(false)
	// const [collapse, setCollapsible] = useState(false)
	const [collapsed, setCollapsed] = useState(!expandByDefault)
	// const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 })
	// const dataRef = useRef<HTMLDivElement>(null)

	const [data, isJson = forceJson] = coerceData(dataProp, decimalPlaces)
	// const isJson = forceJson || typeof data === "object"
	const { collapse, span, maxHeight } = useMeasureGrid(data?.toString())

	const colSpan = colsProp ?? span
	const gridColumn = colSpan > 1 ? `1 / span ${colSpan}` : undefined

	const dataProps = collapse
		? {
				// height: collapsed ? "6em" : "unset",
				maxHeight: collapsed ? maxHeight : "unset",
				overflowY: "clip",
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
			overflow={'clip'}
			textOverflow={"ellipsis"}
			{...restProps}
		>
			<HStack justifyContent={"space-between"}>
				<Box
					fontSize={"xs"}
					color={"fg.2"}
					fontWeight={"semibold"}
					userSelect={"none"}
					cursor={"default"}
				>
					{showCopied ? "Copied" : label} {isJson && "JSON"}
				</Box>
				{/* Show all/Show less button for collapsible items */}
				{collapse && (
					<Text fontSize={"xs"} _hover={{ color: "fg.1" }} asChild>
						<button type="button" onClick={() => setCollapsed(!collapsed)}>
							{collapsed ? "Show all" : "Show less"}
						</button>
					</Text>
				)}
			</HStack>

			<Box
				position={"relative"}
				outline={"1px solid transparent"}
				border={"1px solid transparent"}
				paddingX={1}
				_hover={{ outlineColor: "fg/40" }}
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
				transition={"all .1s ease-in-out"}
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
				{isJson ? (
					// <Box overflowX={"scroll"}>
					// 	<JsonView
					// 		src={data}
					// 		name={null}
					// 		theme={colorMode === "dark" ? "grayscale" : "rjv-default"}
					// 		style={{ backgroundColor: "var(--chakra-colors-bg-2)", fontSize: "10px", width: "auto",
					// 			lineHeight: "1"
					// 		 }}
					// 		// iconStyle={"triangle"}
					// 		indentWidth={2}
					// 		collapsed={2}
					// 		collapseStringsAfterLength={50}
					// 		enableClipboard={false}
					// 		displayObjectSize={false}
					// 		displayDataTypes={false}
					// 		displayArrayKey={false}
					// 		quotesOnKeys={false}
					// 	/>
					// </Box>
					<code>{data}</code>
				) : (
					<div>{data.toString()}</div>
				)}
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
	if (typeof data === "number") return [formatNumber(data, decimalPlaces)]
	if (typeof data === "string") {
		if (
			(data.startsWith("{") && data.endsWith("}")) ||
			(data.startsWith("[") && data.endsWith("]"))
		) {
			try {
				return [JSON.stringify(JSON.parse(data), null, 2), true]
			} catch {}
			try {
				const cleaned = data
					.replace(/\bNaN\b/g, "null")
					.replace(/\bInfinity\b/g, "null")
					.replace(/\b-?Infinity\b/g, "null")
					.replace(/\bundefined\b/g, "null")

				return [JSON.stringify(JSON.parse(cleaned), null, 2), true]
			} catch {}
		}
		return [data, false]
	}
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
