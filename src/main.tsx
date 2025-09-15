import { ChakraProvider } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, StrictMode, Suspense, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import { ColorModeProvider } from "./components/ui/color-mode"
import { system } from "./theme/theme"
import "./index.css"
import { MessageProvider } from "./context/Alert"

const app = document.location.hash === "#mini" ? "mini" : "main"

const AppComponent = lazy(async () => {
	if (app === "mini") return import("./Mini")

	await getCurrentWindow().show()
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
			</ColorModeProvider>
		</ChakraProvider>
	</StrictMode>,
)

function Loading({ show }: { show: boolean }) {
	return (
		<div className={"loading-container"}>
			<div className={"loading-text"}>Loading...</div>
		</div>
	)
}
