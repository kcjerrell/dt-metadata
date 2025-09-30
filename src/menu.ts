import { CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu"
import * as pathLib from "@tauri-apps/api/path"
import { message, open } from "@tauri-apps/plugin-dialog"
import { exit } from "@tauri-apps/plugin-process"
import AppState from "./hooks/useAppState"
import { loadFromPasteboard } from "./metadata/state/imageLoaders"
import { createImageItem, MetadataStore } from "./metadata/state/store"
import { getLocalImage } from "./utils/clipboard"
import { subscribe } from "valtio"

// Will become the application submenu on MacOS
const aboutSubmenu = await Submenu.new({
	text: "About",
	items: [
		await MenuItem.new({
			id: "dtm_about",
			text: "About DTM",
			action: async () => {
				await message("DTM\nDraw Things Metadata Viewer\nVersion 0.1.0", {
					title: "DTM",
					kind: "info",
				})
			},
		}),
		await MenuItem.new({
			id: "dtm_quit",
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
			id: "file_open",
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
			id: "file_openPasteboard",
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
			},
		}),
	],
})

type CreateOptionMenuOpts = {
	clearPinsOnExit?: boolean
	clearHistoryOnExit?: boolean
}
async function createOptionsMenu(opts?: CreateOptionMenuOpts) {
	return await Submenu.new({
		text: "Options",
		items: [
			await CheckMenuItem.new({
				text: "Clear pinned images on exit",
				id: "options_clearPinsOnExit",
				checked: opts?.clearPinsOnExit,
				action: () => {
					MetadataStore.clearPinsOnExit = !opts?.clearPinsOnExit
				}
			}),
			await CheckMenuItem.new({
				text: "Clear history on exit",
				id: "options_clearHistoryOnExit",
				checked: opts?.clearHistoryOnExit,
				action: () => {
					MetadataStore.clearHistoryOnExit = !opts?.clearHistoryOnExit
				}
			}),
		],
	})
}

let lastOpts = null as CreateOptionMenuOpts

async function updateMenu(opts?: CreateOptionMenuOpts) {
	lastOpts = opts ?? createOpts()

	const menu = await Menu.new({
		items: [aboutSubmenu, fileSubmenu, editSubmenu, await createOptionsMenu(lastOpts), viewSubmenu],
	})

	menu.setAsAppMenu()
}

function createOpts(): CreateOptionMenuOpts {
	return {
		clearHistoryOnExit: MetadataStore.clearHistoryOnExit,
		clearPinsOnExit: MetadataStore.clearPinsOnExit,
	}
}

await updateMenu()

subscribe(MetadataStore, async () => {
	if (
		lastOpts?.clearHistoryOnExit !== MetadataStore.clearHistoryOnExit ||
		lastOpts?.clearPinsOnExit !== MetadataStore.clearPinsOnExit
	) {
		await updateMenu()
	}
})
