import { getCurrentWindow } from "@tauri-apps/api/window"
import { useMemo, useRef } from "react"
import { proxy, useSnapshot } from "valtio"
import { loadFromPasteboard, loadImage2 } from "./state/imageLoaders"

export function useMetadataDrop() {
	const state = useRef(null)

	if (state.current === null) {
		state.current = proxy({ isDragging: true, dragCounter: 0 })
	}

	const snap = useSnapshot(state.current)

	const handlers = useMemo(
		() => ({
			onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
			},
			onDrop: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.current.isDragging = false
				state.current.dragCounter = 0
				getCurrentWindow().setFocus()
				// loadFromPasteboard("drag")
				loadImage2("drag")
			},
			onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.current.dragCounter++
				if (state.current.dragCounter >= 1) state.current.isDragging = true
				// console.log("drag enter", e.currentTarget)
			},
			onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.current.dragCounter--
				if (state.current.dragCounter === 0) state.current.isDragging = false
				// console.log("drag leave", e.currentTarget)
			}
		}),
		[],
	)

	return {
		isDragging: snap.isDragging,
		handlers,
	}
}
