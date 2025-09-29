import { ChakraProvider } from "@chakra-ui/react"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import App from './App'
import { ColorModeProvider } from "./components/ui/color-mode"
import AppState from "./hooks/useAppState"
import "./index.css"
import { system } from "./theme/theme"

const hash  = document.location?.hash?.slice(1)

if (hash === "mini") AppState.setView("mini")
else if (hash  === "vid") AppState.setView("vid")

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

export function Loading() {
	return (
		<div className={"loading-container"}>
			<div className={"loading-text"}>Loading...</div>
		</div>
	)
}
