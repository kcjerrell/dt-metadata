import { Spinner } from "@chakra-ui/react"
import { relaunch } from "@tauri-apps/plugin-process"
import { motion } from "motion/react"
import { useEffect } from "react"
import { useSnapshot } from "valtio"
import { type ColorMode, useColorMode } from "@/components/ui/color-mode"
import AppState from "@/hooks/useAppState"
import ToolbarButton from "./ToolbarButton"

const statusTips = {
	found: "Download update",
	installed: "Click to finish update",
	error: "Click to retry update",
	downloading: "Downloading update",
	installing: "Installing update",
} as const
function getStatusTip(status: (typeof AppState.store)["updateStatus"]) {
	if (status in statusTips) return statusTips[status as keyof typeof statusTips]
	else return undefined
}

const UpgradeButton = () => {
	const appState = useSnapshot(AppState.store)

	useEffect(() => {
		if (appState.updateStatus === "unknown") AppState.checkForUpdate()
	}, [appState.updateStatus])

	if (appState.updateAttempts >= 3) return null

	if (["checking", "unknown", "none"].includes(appState.updateStatus)) return null

	if (["found", "installed", "error"].includes(appState.updateStatus)) {
		return (
			<ToolbarButton
				icon={UpgradeIcon}
				tip={getStatusTip(appState.updateStatus)}
				onClick={async () => {
					if (AppState.store.updateStatus === "found") {
						await AppState.downloadAndInstallUpdate()
					} else if (appState.updateStatus === "installed") await relaunch()
					else if (appState.updateStatus === "error") await AppState.retryUpdate()
				}}
			/>
		)
	}

	if (appState.updateStatus === "downloading" || appState.updateStatus === "installing") {
		return <ToolbarButton icon={Spinner} tip={statusTips[appState.updateStatus]} />
	}
}

const UpgradeIcon = () => {
	const { colorMode } = useColorMode()

	return (
		<motion.svg
			width="200"
			height="200"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			// style={{ scaleX: 1, scaleY: 1 }}
			animate={{
				// filter: ["drop-shadow(3px 3px 2px #000000)"]
				// boxShadow: ["3px 3px 2px #000000"]
				y: [0, 0, 1, -2, 1, -2, 0],
				// scale: [1, 1.2]
			}}
			transition={{
				duration: 5,
				times: [0, 0.5, 0.7, 0.725, 0.8, 0.825, 1],
				repeat: Infinity,
				repeatType: "loop",
				ease: "easeOut",
				delay: 0.7,
			}}
			whileHover={{ y: 0 }}
			// style={{ scale: 2 }}
		>
			<g>
				<UpgradePath
					i={2}
					d={
						"M90.2344 0L0 60.1562L0 101.706L90.2344 41.55L180.469 101.706L180.469 60.1562L90.2344 0Z"
					}
					colorMode={colorMode}
					tx={9.766}
					ty={11.647}
				/>
				<UpgradePath
					i={1}
					d="M58.9844 0L0 39.8141L0 75.0809L58.9844 35.2664L117.969 75.0809L117.969 39.8141L58.9844 0Z"
					tx={41.016}
					ty={61.664}
					colorMode={colorMode}
				/>
				<UpgradePath
					i={0}
					d="M33.9844 0L0 22.9395L0 49.3457L33.9844 26.6895L67.9688 49.3457L67.9688 22.9395L33.9844 0Z"
					tx={66.016}
					ty={105.414}
					colorMode={colorMode}
				/>
			</g>
		</motion.svg>
	)
}

const UpgradePath = ({
	d,
	tx,
	ty,
	i,
	colorMode,
}: {
	d: string
	tx: number
	ty: number
	i: number
	colorMode: ColorMode
}) => {
	const colorDuration = 5
	const fg = colorMode === "light" ? "#565e67" : "#8e97a2"
	const fgb = colorMode === "light" ? "#476d53ff" : "#66a676ff"
	return (
		<motion.path
			d={d}
			animate={{
				fill: [fgb, fg, "#83ff67ff", fgb],
				scale: [1, 1.1, 1.2, 1],
			}}
			transition={{
				duration: colorDuration,
				times: [0, 0.8, 0.9, 1],
				ease: ["easeOut", "linear", "linear"],
				repeat: Infinity,
				repeatType: "loop",
				delay: 0.1 * i, // (colorDuration * i) / 16,
			}}
			stroke-width="0"
			stroke="#000000"
			style={{ x: tx, y: ty * 1.3 }}
		/>
	)
}

export default UpgradeButton
