import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu"
import { message } from "@tauri-apps/plugin-dialog"
import { exit } from "@tauri-apps/plugin-process"
import { open } from "@tauri-apps/plugin-dialog"
import { getLocalImage } from "./utils/clipboard"
import { createImageItem } from "./metadata/state/store"
import * as pathLib from "@tauri-apps/api/path"
import { loadFromPasteboard } from "./metadata/state/imageLoaders"
import AppState from "./hooks/useAppState"

// Will become the application submenu on MacOS
const aboutSubmenu = await Submenu.new({
	text: "About",
	items: [
		await MenuItem.new({
			id: "dtm-about",
			text: "About DTM",
			action: async () => {
				await message("DTM\nDraw Things Metadata Viewer\nVersion 0.1.0", {
					title: "DTM",
					kind: "info",
				})
			},
		}),
		await MenuItem.new({
			id: "quit",
			text: "Quit",
			action: async () => {
				await exit(0)
			},
		}),
	],
})

const fileSubmenu = await Submenu.new({
	text: "File",
	items: [
		await MenuItem.new({
			text: "Open...",
			id: "file-open",
			action: async () => {
				const imagePath = await open({
					multiple: false,
					title: "Open image",
					filters: [
						{ name: "Image", extensions: ["jpg", "jpeg", "png", "tiff", "webp", "gif", "bmp"] },
					],
				})
				if (imagePath == null) return
				const image = await getLocalImage(imagePath)
				if (image)
					await createImageItem(image, await pathLib.extname(imagePath), { file: imagePath })
			},
		}),
		await MenuItem.new({
			text: "Open from pasteboard...",
			id: "file-openpasteboard",
			action: async () => {
				await loadFromPasteboard("general")
			},
		}),
		await MenuItem.new({
			text: "Close",
		}),
		await MenuItem.new({
			text: "Close unpinned",
		}),
		await MenuItem.new({
			text: "Close all",
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

const viewSubmenu = await Submenu.new({
	text: "View",
	items: [
		await MenuItem.new({
			text: "Metadata",
			id: "view-metadata",
			action: async () => {
				AppState.setView("metadata")
			},
		}),
		await MenuItem.new({
			text: "Vid",
			id: "view-vid",
			action: async () => {
				AppState.setView("vid")
			},
		}),
		await MenuItem.new({
			text: "Library",
			id: "view-library",
			action: async () => {
				AppState.setView("library")
			}
		})
	],
})

const menu = await Menu.new({
	items: [aboutSubmenu, fileSubmenu, editSubmenu, viewSubmenu],
})

menu.setAsAppMenu()
