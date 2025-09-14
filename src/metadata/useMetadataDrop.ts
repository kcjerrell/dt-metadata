import { useMemo, useRef } from "react"
import { proxy, useSnapshot } from "valtio"
import { loadFromPasteboard } from "./state/imageLoaders"
import { getCurrentWindow } from '@tauri-apps/api/window'
import { usePostMessage } from '@/context/Alert'

export function useMetadataDrop() {
	const state = useRef(null)

	if (state.current === null) {
		state.current = proxy({ isDragging: false })
	}

	const snap = useSnapshot(state.current)

	const postMessage = usePostMessage()

	const handlers = useMemo(
		() => ({
			onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
			},
			onDrop: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				getCurrentWindow().setFocus()
				postMessage({
					channel: "toolbar",
					message: "Loading image...",
					
				})
				loadFromPasteboard("drag")
				state.current.isDragging = false
			},
			onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.current.isDragging = true
			},
			onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				state.current.isDragging = false
			},
		}),
		[postMessage],
	)

	return {
		isDragging: snap.isDragging,
		handlers,
	}
}
