import { ChakraProvider } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, StrictMode, Suspense, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import { ColorModeProvider } from "./components/ui/color-mode"
import { system } from "./theme/theme"
import "./index.css"
import { MessageProvider } from "./context/Alert"

let app = "main"
switch (document.location.hash) {
	case "#mini":
		app = "mini"
}
console.log(app)
const AppComponent = lazy(async () => {
	if (app === "mini") return import("./Mini")
	return import("./metadata/MetadataContainer")
})

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<Suspense fallback={<Loading show={app === "main"} />}>
					<MessageProvider>
						<AppComponent />
					</MessageProvider>
				</Suspense>
				{/* <Test/> */}
			</ColorModeProvider>
		</ChakraProvider>
	</StrictMode>,
)

function Loading({ show }: { show: boolean }) {
	const didShowWindow = useRef(false)
	useEffect(() => {
		if (!show) return
		if (!didShowWindow.current) {
			// getCurrentWindow().hide()
			setTimeout(() => {
				getCurrentWindow().show()
			}, 5)
			didShowWindow.current = true
		}
	}, [show])

	return (
		<div className={"loading-container"}>
			<div className={"loading-text"}>Loading...</div>
		</div>
	)
}
