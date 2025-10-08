import { getCurrentWindow } from "@tauri-apps/api/window"
import { useMemo, useRef } from "react"
import { proxy, useSnapshot } from "valtio"
import { loadImage2 } from "./state/imageLoaders"

export function useMetadataDrop() {
	const stateRef = useRef<{ isDragging: boolean; dragCounter: number } | null>(null)

	if (stateRef.current === null) {
		stateRef.current = proxy({ isDragging: true, dragCounter: 0 })
	}
	const state = stateRef.current

	const snap = useSnapshot(stateRef.current)

	const handlers = useMemo(
		() => ({
			onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
			},
			onDrop: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.isDragging = false
				state.dragCounter = 0
				getCurrentWindow().setFocus()
				// loadFromPasteboard("drag")
				loadImage2("drag")
			},
			onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.dragCounter++
				if (state.dragCounter >= 1) state.isDragging = true
				// console.log("drag enter", e.currentTarget)
			},
			onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.dragCounter--
				if (state.dragCounter === 0) state.isDragging = false
				// console.log("drag leave", e.currentTarget)
			}
		}),
		[state],
	)

	return {
		isDragging: snap.isDragging,
		handlers,
	}
}
