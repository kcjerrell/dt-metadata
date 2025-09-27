import { Box, type BoxProps } from "@chakra-ui/react"
import { motion, useAnimate, useMotionValue, type ValueAnimationTransition,  } from "motion/react"
import { createRef, useEffect } from "react"
import { proxy, ref, useSnapshot } from "valtio"

const store = proxy({
	showPreview: false,
	sourceElement: ref(createRef<HTMLImageElement>()),
	src: null as string | null,
	originalOpacity: null as number | null,
	initialRender: true,
})

export function showPreview(srcElem: HTMLImageElement, src?: string) {
	store.sourceElement.current = srcElem
	store.src = src ?? srcElem.src
	store.showPreview = true
	store.originalOpacity = parseFloat(getComputedStyle(srcElem).opacity)
}

export function hidePreview() {
	store.showPreview = false
}

interface PreviewProps extends BoxProps {}

const posTransition: ValueAnimationTransition<number> = {
	duration: 3,
	ease: "linear",
}

export function Preview(props: PreviewProps) {
	const { ...restProps } = props

	const snap = useSnapshot(store)
	const { src, showPreview: show } = snap

	const leftMv = useMotionValue(0)
	const topMv = useMotionValue(0)
	const widthMv = useMotionValue(0)
	const heightMv = useMotionValue(0)

	const [scope, animate] = useAnimate()

	useEffect(() => {
		show
		const sourceElement = store.sourceElement.current
		if (!sourceElement) return

    const { left, top, width, height } = sourceElement.getBoundingClientRect()

		if (store.showPreview) {
			const target: DOMRect = contain(
				sourceElement.naturalWidth,
				sourceElement.naturalHeight,
				window.innerWidth,
				window.innerHeight,
			)

			leftMv.set(left)
			widthMv.set(width)
			topMv.set(top)
			heightMv.set(height)
      
			animate(leftMv, target.left, posTransition)
			animate(topMv, target.top, posTransition)
			animate(widthMv, target.width, posTransition)
			animate(heightMv, target.height, posTransition)
			animate(sourceElement, { opacity: 0 })
		} else {
			animate(leftMv, left, posTransition)
			animate(widthMv, width, posTransition)
			animate(topMv, top, posTransition)
			animate(heightMv, height, posTransition)

			const controls = animate(
				sourceElement,
				{ opacity: store.originalOpacity },
				{ duration: 0.1, delay: posTransition.duration - 0.1 },
			)

			controls.finished.then(() => {
				// sourceElement.style.opacity = store.originalOpacity
				store.originalOpacity = null
				store.sourceElement.current = null
				store.src = null
			})
		}
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
					backgroundColor: show ? "#000000ff" : "#00000000",
					opacity: show ? 1 : 0,
				}}
				transition={{
					duration: 3,
					ease: "circOut",
					opacity: {
						duration: 0,
						delay: show ? 0 : 3,
					},
				}}
				style={
					{
						// position: "relative",
					}
				}
			>
				<motion.img
					style={{
						position: "absolute",
						objectFit: "contain",
						left: leftMv,
						top: topMv,
						width: widthMv,
						height: heightMv,
					}}
					src={src}
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
