import { clipboardTextTypes, parseText } from "@/metadata/state/imageLoaders"
import { getClipboardTypes, getClipboardText } from "@/utils/clipboard"
import { shuffle } from "@/utils/helpers"
import { Box, VStack } from "@chakra-ui/react"
import { invoke } from "@tauri-apps/api/core"
import { cubicBezier, motion, MotionProps } from "motion/react"
import { useMemo } from "react"
import { proxy, useSnapshot } from "valtio"

const store = proxy({
	file: "",
})

function Scratch(props: ChakraProps) {
	const snap = useSnapshot(store)
	const handlers = useMemo(
		() => ({
			onDrop: async (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				const types = await getClipboardTypes("drag")
				const cliptext = await getClipboardText(
					clipboardTextTypes.filter((t) => types.includes(t)),
					"drag",
				)
				for (const [type, text] of Object.entries(cliptext)) {
					const { files } = parseText(text, type)
					if (files.length > 0) {
						store.file = files[0]
						invoke("load_metadata", { filepath: files[0] })
						return
					}
				}
			},
			onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
			},
		}),
		[],
	)

	const { items } = getMotionItems(512, 512, 32)

	return (
		<VStack {...handlers} {...props}>
			<Box>Hello</Box>
			<Box>{snap.file}</Box>
			<svg id={"check"} width={"64px"} height={"64px"} viewBox={"0 0 64 64"}>
				<title>check</title>
				<rect width={"64px"} height={"64px"} fill={"blue"} />
				<rect x={0} y={0} width={"32px"} height={"32px"} fill={"red"} />
				<rect x={32} y={32} width={"32px"} height={"32px"} fill={"red"} />
			</svg>
			<svg width={512} height={512} viewbox={"0 0 512 512"}>
				<title>bg</title>
				<rect style={{ fill: "var(--chakra-colors-bg-1)" }} width={512} height={512} />
				{items.map((item) => {
					return <motion.rect key={item.index} {...item} />
				})}
			</svg>
		</VStack>
	)
}

// times will be normalized
// we'll do a checkerboard of dots popping in in random order
// then they'll expand into squares
// t=0 nothing
// t=0-1 all dots fade in
// t=1-2 dots become squares
// (the duration of 0-1 and 1-2 can be adjusted, and a gap can be added)

type SequenceItem = {
	index: number
	initial: MotionProps["initial"]
	animate: MotionProps["animate"]
	transition: MotionProps["transition"]
	style: MotionProps["style"]
}
const curves = [cubicBezier(0.74, 0.19, 0.87, 0.29), cubicBezier(0.1, 0.91, 0.87, 0.29)]
const totalDuration = 5
const phases = [
	[0, 2],
	[3, 4],
]

const norm = (times: number[], phaseIndex: number) => {
	const phase = phases[phaseIndex]
	const duration = phase[1] - phase[0]

	return times.map((t) => (curves[phaseIndex](t) * duration + phase[0]) / totalDuration)
}

function getMotionItems(width: number, height: number, size: number): { items: SequenceItem[] } {
	const nCols = Math.ceil(width / size)
	const nRows = Math.ceil(height / size)
	const nItems = nCols * nRows

	const radiusSequence = [size / 8, size / 8, 0, 0]
	const sizeSequence = [size / 4, size / 4, size, size]
	// const sizeTimes = [0, 1, 2]
	const sizeDuration = 0.5
	const sizeTimes = (ti) => [
		0,
		(ti / nItems) * (1 - sizeDuration / totalDuration),
		(ti / nItems + sizeDuration / totalDuration) * (1 - sizeDuration / totalDuration),
		1,
	]

	const getX = (i) => Math.floor(i / nRows)
	const xSequence = (x) => [
		x * size + (size * 3) / 8,
		x * size + (size * 3) / 8,
		x * size,
		x * size,
	]

	const getY = (i) => i % nRows
	const ySequence = (y) => [
		y * size + (size * 3) / 8,
		y * size + (size * 3) / 8,
		y * size,
		y * size,
	]

	const getColorIndex = (i) => ((getX(i) % 2) + (getY(i) % 2)) % 2

	const opacityDuration = 0.1
	const opacitySequence = [0, 0, 1, 1]
	const opacityTimes = (ti) => [
		0,
		(ti / nItems) * (1 - opacityDuration / totalDuration),
		(ti / nItems + opacityDuration / totalDuration) * (1 - opacityDuration / totalDuration),
		1,
	]

	const sizeTrans = (ti) =>
		({
			times: norm(sizeTimes(ti), 1),
			duration: 4,
			repeat: Infinity,
			repeatType: "loop",
		}) as MotionProps["transition"]

	const indexes = shuffle(Array.from({ length: nItems }).map((_, i) => i))

	const items = indexes.map((index, ti) => {
		const style: MotionProps["style"] = {
			fill: `var(--chakra-colors-check-${getColorIndex(index) + 1})`,
		}
		const initial: MotionProps["initial"] = {
			opacity: 0,
		}
		const animate: MotionProps["animate"] = {
			opacity: opacitySequence,
			x: xSequence(getX(index)),
			y: ySequence(getY(index)),
			rx: radiusSequence,
			ry: radiusSequence,
			width: sizeSequence,
			height: sizeSequence,
		}

		const si = ((getX(index) + getY(index)) / (nCols + nRows)) * nItems
		const transition: MotionProps["transition"] = {
			opacity: {
				duration: 4,
				repeat: Infinity,
				repeatType: "loop",
				times: norm(opacityTimes(ti), 0),
			},
			x: sizeTrans(si),
			y: sizeTrans(si),
			rx: sizeTrans(si),
			ry: sizeTrans(si),
			width: sizeTrans(si),
			height: sizeTrans(si),
		}

		return { index, initial, animate, transition, style }
	})

	return { items }
}

export default Scratch

// 64, 0 - 64
// 16  24 - 40
