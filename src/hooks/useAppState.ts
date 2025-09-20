import { check } from "@tauri-apps/plugin-updater"
import { createContext, use, useContext, useEffect, useRef } from "react"
import { useMutative } from "use-mutative"
import { proxy, useSnapshot } from "valtio"

type AppStateContextType = {
	updateAvailable: boolean
	update: Awaited<ReturnType<typeof check>>
}

export const AppStateContext = createContext<AppStateContextType | null>(null)

export function useAppState() {
	const cv = useContext(AppStateContext)
	if (!cv) throw new Error("AppStateContext not found")
	const snap = useSnapshot(cv)
	return snap
}

export function useCreateAppState() {
	const store = useRef(null)

	if (store.current === null) {
		store.current = proxy({
			updateAvailable: false,
			update: null as Awaited<ReturnType<typeof check>> | null,
		})
	}

	useEffect(() => {
		setTimeout(async () => {
			console.log("Checking for updates")
			const update = await check()
			console.log(update)
			if (update) {
				store.current.updateAvailable = true
				store.current.update = update
			}
		}, 1000)
	}, [])

	return store.current
}
