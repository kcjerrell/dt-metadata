import { ChakraProvider } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { ColorModeProvider } from "./components/ui/color-mode"
import { system } from "./theme/theme"
import "./index.css"
import { MessagesProvider } from "./context/Messages"

const app = document.location.hash === "#mini" ? "mini" : "main"

const AppComponent = lazy(async () => {
	if (app === "mini") return import("./Mini")

	await getCurrentWindow().show()
	return import("./metadata/MetadataContainer")
})

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<Suspense fallback={<Loading />}>
					<MessagesProvider>
						<AppComponent />
					</MessagesProvider>
				</Suspense>
			</ColorModeProvider>
		</ChakraProvider>
	</StrictMode>,
)

function Loading() {
	return (
		<div className={"loading-container"}>
			<div className={"loading-text"}>Loading...</div>
		</div>
	)
}
