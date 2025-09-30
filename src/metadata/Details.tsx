import MeasureGrid from "@/components/measureGrid/MeasureGrid"
import { useMeasureGrid } from "@/components/measureGrid/useMeasureGrid"
import TabPage from "@/components/scrollTabs/TabPage"
import { useTimedState } from "@/hooks/useTimedState"
import { Box, chakra, GridItem, HStack, VStack } from "@chakra-ui/react"
import { useCallback } from "react"
import type { ImageItem } from "./state/ImageItem"

interface DetailsProps extends ChakraProps {
	image?: ImageItem | ReadonlyState<ImageItem>
}

function Details(props: DetailsProps) {
	const { image, ...rest } = props
	const { exif = {} } = image ?? {}
	const ui = image?.ui as ImageItem["ui"]

	const groups = groupItems(exif)

	// const posSnap = useSnapshot(posStore)
	// const pos = posStore[image?.id]
	// if (image) console.log("pos", JSON.parse(JSON.stringify(posStore[image?.id])))

	// useEffect(() => {
	// 	if (scrollRef.current) {
	// 		// scrollRef.current.scrollTop = posStore[image?.id].y
	// 		requestAnimationFrame(() => {
	// 			requestAnimationFrame(() => {
	// 				console.log("scrolling to", posStore[image?.id].y)
	// 				scrollRef.current.scrollTo({ top: posStore[image?.id].y })
	// 				console.log('frame', posStore[image?.id].y, scrollRef.current.scrollHeight)
	// 			})
	// 		})
	// 	}
	// }, [image?.id])

	return (
		<TabPage
			key={`${image?.id}_image`}
			label={"image"}
			padding={0}
			// onScroll={(e) => {
			// 	const y = e.currentTarget.scrollTop
			// 	posStore[image?.id].y = y
			// 	console.log("onscroll", y, e.currentTarget.scrollHeight)
			// }}
		>
			<VStack
				{...rest}
				bgColor={"bg.2"}
				fontSize={"xs"}
				alignItems={"start"}
				width={"100%"}
				minWidth={0}
			>
				{groups.map(({ name, items }) => {
					return (
						<VStack key={name} gap={0} width={"100%"}>
							<MeasureGrid
								columns={2}
								maxItemLines={6}
								fontSize={"xs"}
								bgColor={"bg.1"}
								gap={1}
								width={"100%"}
								padding={1}
							>
								<Box gridColumn={"1 / span 2"}>{name}</Box>
								{items.map(({ key, value }) => {
									return (
										<DataItem
											key={key}
											label={key}
											data={value}
											initialCollapse={ui.expanded.has(`${name}_${key}`) ? "expanded" : "collapsed"}
											onCollapseChange={(value) => {
												// console.log("called")
												const expKey = `${name}_${key}`
												if (value === "expanded") ui.expanded.add(expKey)
												else if (value === "collapsed") ui.expanded.delete(expKey)
											}}
										/>
									)
								})}
							</MeasureGrid>
						</VStack>
					)
				})}
			</VStack>
		</TabPage>
	)
}

type MetaDataGroup = {
	name: string
	items: { key: string; value: unknown }[]
}

function groupItems(data: Record<string, unknown>) {
	let root = data
	const groups: MetaDataGroup[] = []

	// if (!Object.values(data).every((v) => typeof v === "object" && v !== null)) root = { root: data }

	for (const [k, v] of Object.entries(root)) {
		const group: MetaDataGroup = { name: k, items: [] }

		for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) {
			group.items.push({ key: k2, value: v2 })
		}

		groups.push(group)
	}

	return groups
}

function separateItems(data: Record<string, unknown>) {
	const values = Object.values(data)

	if (values.every((v) => typeof v === "object" && v !== null)) {
		const res = {} as Record<string, unknown>
		for (const [k1, v1] of Object.entries(data)) {
			for (const [k2, v2] of Object.entries(v1 as Record<string, unknown>)) {
				res[`${k1}.${k2}`] = v2
			}
		}
		return res
	}

	return data
}

function isInt(value: number, epsilon = 0.000001) {
	return Math.abs(Math.round(value) - value) < epsilon
}

type PrepDataOpts = {
	decimalPlaces?: number
}
type PrepDataTypes = "string" | "number" | "boolean" | "array" | "object" | "null" | "undefined"
function prepData(data: unknown, opts?: PrepDataOpts): [string | null, boolean, PrepDataTypes] {
	if (Array.isArray(data)) return [null, true, "array"]
	if (typeof data === "number") {
		if (opts?.decimalPlaces === undefined && isInt(data))
			return [String(Math.round(data)), false, "number"]
		return [data.toFixed(opts?.decimalPlaces ?? 2), false, "number"]
	}
	if (typeof data === "boolean") return [String(data), false, "boolean"]
	if (typeof data === "string") {
		if (
			(data.startsWith("{") && data.endsWith("}")) ||
			(data.startsWith("[") && data.endsWith("]"))
		) {
			try {
				return prepData(JSON.parse(data), opts)
			} catch {}
			try {
				const cleaned = data
					.replace(/\bNaN\b/g, "null")
					.replace(/\bInfinity\b/g, "null")
					.replace(/\b-?Infinity\b/g, "null")
					.replace(/\bundefined\b/g, "null")

				return prepData(JSON.parse(cleaned), opts)
			} catch {}
		}
		return [data, false, "string"]
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

export function DataItem(props: DataItemProps<unknown>) {
	const {
		data,
		label,
		cols,
		decimalPlaces,
		expandByDefault,
		ignore,
		onCollapseChange,
		initialCollapse,
		...rest
	} = props

	const [justCopied, setJustCopied] = useTimedState(false, 1000)

	const [content, forceSpan, type] = prepData(data, { decimalPlaces })
	const { collapse, span, maxHeight, toggleCollapsed } = useMeasureGrid(content, {
		forceSpan,
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
				<Box paddingLeft={1} fontWeight={600} fontSize={"xs"} color={"fg.2"}>
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

const DataItemContent = chakra("div", {
	base: {
		outline: "1px solid transparent",
		padding: 1,
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
				_after: {
					content: '""',
					position: "absolute",
					height: "2rem",
					backgroundImage: "linear-gradient(0deg, var(--chakra-colors-bg-2) 0%, #00000000 100%)",
					bottom: 0,
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

interface DataItemProps<T> extends ChakraProps {
	label: string
	data: T
	cols?: number
	collapsed?: boolean
	ignore?: boolean
	expandByDefault?: boolean
	decimalPlaces?: number
	onCollapseChange?: (collapsed: "collapsed" | "expanded") => void
	initialCollapse?: "collapsed" | "expanded"
}

export default Details
