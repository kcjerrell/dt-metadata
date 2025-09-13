import { convertFileSrc } from "@tauri-apps/api/core"
import * as path from "@tauri-apps/api/path"
import * as fs from "@tauri-apps/plugin-fs"
import { store as createStore } from "@tauri-store/valtio"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)

const appDataDir = await path.appDataDir()
if (!(await fs.exists(appDataDir))) {
	console.log("creating app data dir")
	await fs.mkdir(appDataDir)
}
const imageFolder = await path.join(appDataDir, "images")
if (!(await fs.exists(imageFolder))) {
	console.log("creating image folder")
	await fs.mkdir(imageFolder)
}

type ImageStoreEntryBase = {
	id: string
	type: string
}

export type ImageStoreEntry = {
	id: string
	type: string
	url: string
	thumbUrl: string
}

const imagesStore = createStore(
	"images",
	{ images: {} as Record<string, ImageStoreEntryBase> },
	{
		autoStart: true,
		syncStrategy: "debounce",
		syncInterval: 1000,
		saveOnChange: true,
		hooks: {
			beforeFrontendSync: (state) => {
				console.log("fe sync")
				return state
			},
		},
	},
)
const store = imagesStore.state
const _validTypes = ["png", "tiff", "jpg"]

async function saveImage(image: Uint8Array, type: string): Promise<ImageStoreEntry | undefined> {
	if (!type || !_validTypes.includes(type)) return
	if (!image || image.length === 0) return

	try {
		const id = await getNewId()
		const fname = await getFullPath(id, type)

		await fs.writeFile(fname, image, {
			createNew: true,
		})

		const entry = { id, type }
		store.images[id] = entry

		const url = convertFileSrc(fname)
		return { ...entry, url, thumbUrl: url }
	} catch (e) {
		console.error(e)
		return
	}
}

async function getImage(id: string): Promise<ImageStoreEntry | undefined> {
	const entry = store.images[id]

	if (!entry) return

	const url = convertFileSrc(await getFullPath(id, entry.type))
	// const thumbUrl = convertFileSrc(await getThumbPath(id))
	return { ...entry, url, thumbUrl: url }
}

async function getFullPath(id: string, ext: string) {
	return await path.join(imageFolder, `${id}.${ext}`)
}

async function getThumbPath(id: string) {
	return await path.join(imageFolder, `${id}_thumb.png`)
}

async function getNewId() {
	let id: string

	do {
		id = nanoid()
	} while (id in imagesStore)

	return id
}

async function removeImage(id: string) {
	console.log("remove image", id)
	const item = store.images[id]
	if (!item) return
	await removeFile(await getFullPath(id, item.type))
	await removeFile(await getThumbPath(id))
	delete store.images[id]
}

async function syncImages(keepIds: string[] = []) {
	for (const id of Object.keys(store.images)) {
		if (keepIds.includes(id)) continue

		await removeImage(id)
	}

	// for (const file of await fs.readDir(imageFolder)) {
	// 	if (file.name.startsWith(".") || file.isDirectory || file.isSymlink) continue
	// 	console.log("looking at ", file.name)
	// 	const filename = await path.basename(file.name, await path.extname(file.name))
	// 	const id = filename.split("_")[0]

	// 	if (!keepIds.includes(id)) {
	// 		await removeFile(await path.join(imageFolder, file.name))
	// 	}
	// }
}

const ImageStore = {
	save: saveImage,
	get: getImage,
	remove: removeImage,
	sync: syncImages,
}

export default ImageStore

async function removeFile(filePath: string) {
	console.log("remove file", filePath)
	try {
		if (await fs.exists(filePath)) {
			await fs.remove(filePath)
		}
	} catch (e) {
		console.error(e)
	}
}
