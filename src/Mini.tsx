import { Box } from "@chakra-ui/react"
import { invoke } from '@tauri-apps/api/core'
import { TrayIcon } from "@tauri-apps/api/tray"
import { hide, isOpen, show } from "tauri-plugin-nspopover"

function Mini() {
	return <Box>Hello from the mini view!</Box>
}

export default Mini
console.log("mini is here")
await TrayIcon.new({
	id: "main",
  icon: "./icons/128x128.png",
	async action(event) {
		console.log(event)
		if (event.type === "Click" && event.buttonState === "Up" && event.button === "Left") {
			const isShown = await isOpen()
			console.log(isShown)
			if (isShown) {
				hide()
			} else {
				show()
			}
		}
	},
})
await invoke("init_panel")
