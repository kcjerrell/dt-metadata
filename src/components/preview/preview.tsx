import { Box, type BoxProps } from "@chakra-ui/react"
import { motion, useAnimate, useMotionValue, type ValueAnimationTransition } from "motion/react"
import { createRef, useEffect, useRef } from "react"
import { proxy, ref, useSnapshot } from "valtio"

const store = proxy({
	showPreview: false,
	sourceElement: ref(createRef<HTMLImageElement>()),
	src: null as string | null,
})

export function showPreview(srcElem: HTMLImageElement, src?: string) {
	store.sourceElement.current = srcElem
	store.src = src ?? srcElem.src
	store.showPreview = true
}

export function hidePreview() {
	store.showPreview = false
}

interface PreviewProps extends BoxProps {}

const posTransition: ValueAnimationTransition<number> = {
	duration: 0.3,
	ease: "circOut",
}

export function Preview(props: PreviewProps) {
	const { ...restProps } = props

	const snap = useSnapshot(store)
	const { src, showPreview: show } = snap

	const leftMv = useMotionValue(0)
	const topMv = useMotionValue(0)
	const widthMv = useMotionValue<number>(0)
	const heightMv = useMotionValue<number>(0)

	const [scope, animate] = useAnimate()

	const transRef = useRef<HTMLImageElement>(null)
	const finalRef = useRef<HTMLImageElement>(null)

	useEffect(() => {
		const sourceElement = store.sourceElement.current
		if (!sourceElement || !transRef.current || !finalRef.current) return

		const originalRect = sourceElement.getBoundingClientRect()
		const previewRect = contain(
			sourceElement.naturalWidth,
			sourceElement.naturalHeight,
			window.innerWidth,
			window.innerHeight,
		)

		const sourceRect = store.showPreview ? originalRect : previewRect
		const targetRect = store.showPreview ? previewRect : originalRect

		const { left, top, width, height } = sourceRect

		leftMv.set(left)
		widthMv.set(width)
		topMv.set(top)
		heightMv.set(height)

		animate(leftMv, targetRect.left, posTransition)
		animate(topMv, targetRect.top, posTransition)
		animate(widthMv, targetRect.width, posTransition)
		animate(heightMv, targetRect.height, posTransition)

		animate(
			transRef.current,
			{ visibility: ["hidden", "visible", "visible", "hidden"] },
			{ duration: posTransition.duration, times: [0, 0, 1, 1] },
		)

		animate(
			finalRef.current,
			{ visibility: ["hidden", "hidden", show ? "visible" : "hidden"] },
			{ duration: posTransition.duration, times: [0, 1, 1] },
		)

		animate(
			sourceElement,
			{ visibility: ["hidden", "hidden", show ? "hidden" : "visible"] },
			{ duration: posTransition.duration, times: [0, 1, 1] },
		)
	}, [animate, heightMv, leftMv, widthMv, topMv, show])

	return (
		<Box
			ref={scope}
			width={"100vw"}
			height={"100vh"}
			overflow={"clip"}
			position={"absolute"}
			zIndex={20}
			bgColor={"black/90"}
			onClick={() => hidePreview()}
			pointerEvents={show ? "all" : "none"}
			{...restProps}
			asChild
		>
			<motion.div
				initial={{
					opacity: 0,
					backgroundColor: "#00000000",
				}}
				animate={{
					backgroundColor: show ? "#000000dd" : "#00000000",
					opacity: show ? 1 : 0,
				}}
				transition={{
					...posTransition,
					duration: show ? (posTransition.duration ?? 0) * 1.5 : posTransition.duration,
					opacity: {
						duration: 0,
						delay: show ? 0 : posTransition.duration,
					},
				}}
			>
				<motion.img
					ref={transRef}
					style={{
						position: "absolute",
						objectFit: "contain",
						left: leftMv,
						top: topMv,
						width: widthMv,
						height: heightMv,
					}}
					src={src ?? undefined}
					transition={posTransition}
				/>
				<motion.img
					ref={finalRef}
					style={{
						position: "absolute",
						objectFit: "contain",
						left: 0,
						top: 0,
						width: "100%",
						height: "100%",
					}}
					src={src ?? undefined}
					transition={posTransition}
				/>
			</motion.div>
		</Box>
	)
}

function contain(
	naturalWidth: number,
	naturalHeight: number,
	innerWidth: number,
	innerHeight: number,
): DOMRect {
	const aspectRatio = naturalWidth / naturalHeight
	let width = innerWidth
	let height = innerWidth / aspectRatio

	if (height > innerHeight) {
		height = innerHeight
		width = innerHeight * aspectRatio
	}

	const left = (innerWidth - width) / 2
	const top = (innerHeight - height) / 2

	// DOMRect: x, y, width, height, top, right, bottom, left
	return {
		x: left,
		y: top,
		width,
		height,
		top,
		left,
		right: left + width,
		bottom: top + height,
	} as DOMRect
}
