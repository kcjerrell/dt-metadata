import { ChakraProvider } from "@chakra-ui/react"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import App from './App'
import { ColorModeProvider } from "./components/ui/color-mode"
import AppState from "./hooks/useAppState"
import "./index.css"
import { system } from "./theme/theme"

const app = document.location?.hash?.slice(1) ?? "main"

if (app === "mini") AppState.setView("mini")
else if (app === "vid") AppState.setView("vid")
else AppState.setView("metadata")

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
