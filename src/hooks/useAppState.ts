import { check } from "@tauri-apps/plugin-updater"
import { proxy, subscribe } from "valtio"

type AppStateType = {
	// update: Awaited<ReturnType<typeof check>>
	updateSize: number
	updateProgress: number
	updateStatus:
		| "unknown"
		| "checking"
		| "none"
		| "found"
		| "downloading"
		| "ready"
		| "installing"
		| "installed"
		| "error"
	currentView: string
}

let update: Awaited<ReturnType<typeof check>> = null
const store: AppStateType = proxy({
	updateSize: 0,
	updateProgress: 0,
	updateStatus: "unknown",
	currentView: localStorage.getItem("currentView") || "metadata",
})

async function checkForUpdate() {
	store.updateStatus = "checking"
	update = await check()

	if (update) store.updateStatus = "found"
	else store.updateStatus = "none"
}

async function downloadUpdate() {
	if (!update || store.updateStatus !== "found") return
	store.updateStatus = "downloading"
	try {
		await update.download()
		store.updateStatus = "ready"
	} catch (e) {
		console.error(e)
		store.updateStatus = "error"
	}
}

async function installUpdate() {
	if (!update || store.updateStatus !== "ready") return
	store.updateStatus = "installing"
	try {
		await update.install()
		store.updateStatus = "installed"
	} catch (e) {
		console.error(e)
		store.updateStatus = "error"
	}
}

async function setView(view: string) {
	store.currentView = view
	localStorage.setItem("currentView", view)
}

const AppState = {
	store,
	checkForUpdate,
	downloadUpdate,
	installUpdate,
	setView
}

export default AppState
