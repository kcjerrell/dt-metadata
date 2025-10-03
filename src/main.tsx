import { ChakraProvider } from "@chakra-ui/react"
import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { ColorModeProvider } from "./components/ui/color-mode"
import AppState from "./hooks/useAppState"
import "./index.css"
import { system } from "./theme/theme"
import { motion } from "motion/react"

window.toJSON = (object: unknown) => JSON.parse(JSON.stringify(object))

const hash = document.location?.hash?.slice(1)

if (hash === "mini") AppState.setView("mini")
else if (hash === "vid") AppState.setView("vid")

createRoot(document.getElementById("root")).render(
	<StrictMode>
		{/* <Suspense fallback={<Loading />}> */}
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<App />
			</ColorModeProvider>
		</ChakraProvider>
		{/* </Suspense> */}
	</StrictMode>,
)

export function Loading() {
	return (
		<motion.div
			initial={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={"loading-container"}
			style={{ zIndex: 100}}
			transition={{ duration: 0.5 }}
		>
			<div className={"loading-text"}>Loading...</div>
		</motion.div>
	)
}
