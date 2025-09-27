import { lazy, useRef } from "react"
import AppState from "./hooks/useAppState"
import { useSnapshot } from "valtio"
import { getCurrentWindow } from "@tauri-apps/api/window"

function App() {
	const firstRender = useRef(true)
	if (firstRender.current) {
		firstRender.current = false
		getCurrentWindow().show()
	}

	const snap = useSnapshot(AppState.store)
	const View = getView(snap.currentView)
	return <View />
}

const views = {
  metadata: lazy(() => import("./metadata/MetadataContainer")),
  mini: lazy(() => import("./Mini")),
  vid: lazy(() => import("./vid/Vid")),
	library: lazy(() => import("./library/Library")),
}

function getView(view: string) {
  if (view in views) return views[view]
  return views.metadata
}

export default App
