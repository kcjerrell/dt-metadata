import { ChakraProvider } from "@chakra-ui/react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { ColorModeProvider } from "./components/ui/color-mode"
import { system } from "./theme/theme"
import "./index.css"
import AppState from "./hooks/useAppState"
import App from './App'

const app = document.location?.hash?.slice(1) ?? "main"

if (app === "mini") AppState.setView("mini")
else if (app === "vid") AppState.setView("vid")
else AppState.setView("main")

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<Suspense fallback={<Loading />}>
					<App />
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
