import { ChakraProvider } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, StrictMode, Suspense, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { ColorModeProvider } from "./components/ui/color-mode"
import { system } from "./theme/theme"
import "./index.css"
import { MessageProvider } from "./context/Alert"

const MetadataContainer = lazy(async () => {
	// await new Promise((resolve) => setTimeout(resolve, 20000))
	return import("./metadata/MetadataContainer")
})

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<Suspense fallback={<Loading />}>
					<MessageProvider>
						<MetadataContainer />
					</MessageProvider>
				</Suspense>
				{/* <Test/> */}
			</ColorModeProvider>
		</ChakraProvider>
	</StrictMode>,
)

let showWindow = false
function Loading() {
	useEffect(() => {
		if (!showWindow) {
			// getCurrentWindow().hide()
			setTimeout(() => {
				getCurrentWindow().show()
			}, 5)
			showWindow = true
		}
	}, [])

	return (
		<div className={"loading-container"}>
			<div className={"loading-text"}>Loading...</div>
		</div>
	)
}
