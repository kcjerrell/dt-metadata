import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu"
import { message } from "@tauri-apps/plugin-dialog"
import { relaunch } from "@tauri-apps/plugin-process"
import { check } from "@tauri-apps/plugin-updater"

// Will become the application submenu on MacOS
const aboutSubmenu = await Submenu.new({
	text: "About",
	items: [
		await MenuItem.new({
			id: "dtm-about",
			text: "About DTM",
			action: async () => {
				await message("DTM\nDraw Things Metadata Viewer\nVersion 0.1.0", {title: "DTM", kind: "info"})
			},
		}),
		await MenuItem.new({
			id: "chceckUpdates",
			text: "Check for updates",
			action: async () => {
				const result = await check()
				console.log(result)
				if (!result) return
				await result.downloadAndInstall()
				await relaunch()
			},
		}),
		await MenuItem.new({
			id: "quit",
			text: "Quit",
			action: () => {
				console.log("Quit pressed")
			},
		}),
	],
})

const editSubmenu = await Submenu.new({
	text: "Edit",
	items: [
		await PredefinedMenuItem.new({
			text: "Cut",
			item: "Cut",
		}),
		await PredefinedMenuItem.new({
			text: "Copy",
			item: "Copy",
		}),
		await PredefinedMenuItem.new({
			text: "Paste",
			item: "Paste",
		}),
	],
})

const windowSubmenu = await Submenu.new({
	text: "Window",
	id: "window",
})

const menu = await Menu.new({
	items: [aboutSubmenu, editSubmenu, windowSubmenu],
})

menu.setAsAppMenu()
