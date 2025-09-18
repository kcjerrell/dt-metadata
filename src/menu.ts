import { Menu, MenuItem, Submenu, PredefinedMenuItem } from "@tauri-apps/api/menu"
import { check } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"

// Will become the application submenu on MacOS
const aboutSubmenu = await Submenu.new({
	text: "About",
	items: [
		await MenuItem.new({
			id: "chceckUpdates",
			text: "Check for updates",
			action: async () => {
				const update = await check()
        console.log(update)
        await update.downloadAndInstall()
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
		await MenuItem.new({
			id: "undo",
			text: "Undo",
			action: () => {
				console.log("Undo clicked")
			},
		}),
		await MenuItem.new({
			id: "redo",
			text: "Redo",
			action: () => {
				console.log("Redo clicked")
			},
		}),
	],
})

const windowMenu = await Submenu.new({
	text: "Window",
	items: [{ id: "Something", text: "Something" }],
})

const menu = await Menu.new({
	items: [aboutSubmenu, editSubmenu, windowMenu],
})

menu.setAsAppMenu()

// You can also update the submenu icon dynamically
// fileSubmenu.setIcon("document")
// Or set a native icon (only one type applies per platform)
// fileSubmenu.setIcon("NSFolder")
