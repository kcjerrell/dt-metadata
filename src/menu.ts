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
				const result = await check()
				console.log(result)
				if (!result) return
				await result.downloadAndInstall()
				await relaunch()
				// const latest = await fetch(
				// 	"https://api.github.com/repos/kcjerrell/dt-metadata/releases/latest",
				// 	{
				// 		headers: {
				// 			Accept: "application/vnd.github+json",
				// 			"X-GitHub-Api-Version": "2022-11-28",
				// 		},
				// 	},
				// )
				// 	.then((res) => res?.json())
				// 	.catch(void 0)
				// console.log("latest release", latest)
				// const assetsUrl = latest?.assets_url

				// if (!assetsUrl) return

				// const release = (await fetch(`${assetsUrl}`, {
				// 	headers: {
				// 		Accept: "application/vnd.github+json",
				// 		"X-GitHub-Api-Version": "2022-11-28",
				// 	},
				// })
				// 	.then((res) => res?.json())
				// 	.catch(void 0)) as Record<string, string>[]

				// console.log("assets", release)
				// const releaseJsonUrl = release.find((r) => r.name === "release.json")?.browser_download_url
				// console.log(releaseJsonUrl)
				// const update = await check({
				// 	proxy: releaseJsonUrl,
				// })
        // console.log(update)
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
