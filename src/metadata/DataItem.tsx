import { useColorMode } from "@/components/ui/color-mode"
import { Box, Code, GridItem, HStack, Text } from "@chakra-ui/react"
import { useLayoutEffect, useRef, useState } from "react"

type DataItemProps = {
	label: string
	data?:
		| string
		| number
		| (string | number | undefined)[]
		| Record<string, unknown>
	forceJson?: boolean
	cols?: number
	decimalPlaces?: number
	expandByDefault?: boolean
	ignore?: boolean
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
	} = props

	const [showCopied, setShowCopied] = useState(false)
	const [collapsible, setCollapsible] = useState(false)
	const [collapsed, setCollapsed] = useState(!expandByDefault)
	const dataRef = useRef<HTMLDivElement>(null)

	const data = coerceData(dataProp, decimalPlaces)
	const isJson = forceJson || typeof data === "object"

	const cols = colsProp ? { colStart: 1, colEnd: colsProp + 1 } : {}

	const dataProps = collapsible
		? {
				height: collapsed ? "6em" : "unset",
			}
		: {}

	useLayoutEffect(() => {
		const { height } = dataRef.current?.getBoundingClientRect() || {}

		if (height && height > 100) {
			setCollapsible(true)
		}
	}, [dataProp])

	if (!data || ignore) return null

	return (
		<GridItem padding={1} display={"flex"} flexDirection={"column"} {...cols}>
			<HStack justifyContent={"space-between"}>
				<Box fontSize={"xs"} color={"fg.2"} fontWeight={"semibold"}>
					{showCopied ? "Copied" : label}
				</Box>

				{/* Show all/Show less button for collapsible items */}
				{collapsible && (
					<Text fontSize={"xs"} _hover={{ color: "fg.1" }} asChild>
						<button onClick={() => setCollapsed(!collapsed)}>
							{collapsed ? "Show all" : "Show less"}
						</button>
					</Text>
				)}
			</HStack>

			<Box
				ref={dataRef}
				border={"2px solid transparent"}
				paddingX={1}
				_hover={{ borderColor: "fg/40" }}
				color={"fg.2"}
				bgColor={"bg.2"}
				fontSize={"sm"}
				overflowY={"hidden"}
				overflow={isJson ? "auto" : "hidden"}
				minWidth={0}
				// whiteSpace={'pre-wrap'}
				textOverflow={"ellipsis"}
				onClick={() => {
					navigator.clipboard.writeText(
						isJson
							? JSON.stringify(data, null, 2)
							: replaceWords(data.toString()),  
					)
					setShowCopied(true)
					setTimeout(() => setShowCopied(false), 1000)
				}}
				mask={
					collapsible && collapsed
						? "linear-gradient(180deg, #ffffffff 80%, #00000000 100%)"
						: "none"
				}
				{...dataProps}
				asChild
			>
				{isJson ? (
					<Code fontSize={"sm"} whiteSpace={"pre"} textWrap={"nowrap"}>
						{JSON.stringify(data, null, 2)}
					</Code>
				) : (
					<div>{data.toString()}</div>
				)}
			</Box>
		</GridItem>
	)
}

export default DataItem

function coerceData(
	data:
		| string
		| number
		| (string | number | undefined)[]
		| Record<string, unknown>,
	decimalPlaces = 2,
): string | Record<string, unknown> | unknown[] {
	if (typeof data === "string") return data
	if (typeof data === "number") return data.toFixed(decimalPlaces)
	if (Array.isArray(data)) {
		const isSimple = data.every(
			(d) => typeof d === "string" || typeof d === "number" || d === null,
		)
		if (isSimple)
			return `[${data.map((d) => coerceData(d, decimalPlaces)).join(", ")}]`
		else return data
	}
	if (typeof data === "object") {
		return data
	}
	return data
}