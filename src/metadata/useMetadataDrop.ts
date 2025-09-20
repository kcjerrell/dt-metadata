import { getCurrentWindow } from "@tauri-apps/api/window"
import { useMemo, useRef } from "react"
import { proxy, useSnapshot } from "valtio"
import { postMessage } from "@/context/Messages"
import { loadFromPasteboard } from "./state/imageLoaders"

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
				loadFromPasteboard("drag")
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
			},
		}),
		[],
	)

	// useEffect(() => {
	// 	const {onDragEnter, onDragLeave, onDragOver, onDrop} = handlers

	// 	document.addEventListener("dragenter", onDragEnter as DragEvent)
	// 	document.addEventListener("dragleave", onDragLeave as DragEvent)
	// 	document.addEventListener("dragover", onDragOver)
	// 	document.addEventListener("drop", onDrop as DragEvent)

	// 	return () => {
	// 		document.removeEventListener("dragenter", onDragEnter)
	// 		document.removeEventListener("dragleave", onDragLeave)
	// 		document.removeEventListener("dragover", onDragOver)
	// 		document.removeEventListener("drop", onDrop)
	// 	}
	// })
	console.log('usemetadataDrop')
	return {
		isDragging: snap.isDragging,
		handlers,
	}
}
