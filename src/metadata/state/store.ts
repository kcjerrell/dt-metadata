import { store } from "@tauri-store/valtio"
import ExifReader from "exifreader"
import { proxy } from "valtio"
import type { ImageSource } from "@/types"
import ImageStore from "@/utils/imageStore"
import { getDrawThingsDataFromExif } from "../helpers"
import { ImageItem, type ImageItemConstructorOpts } from "./ImageItem"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { readFile } from '@tauri-apps/plugin-fs'

export function bind<T extends object>(instance: T): T {
	const props = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))

	for (const prop of props) {
		const method = instance[prop as keyof T]
		if (prop === "constructor" || typeof method !== "function") continue
		;(instance as Record<string, unknown>)[prop] = (...args: unknown[]) =>
			method.apply(instance, args)
	}

	return instance
}

const metadataStore = store(
	"metadata",
	{
		images: [] as ImageItem[],
		currentIndex: null as number | null,
		zoomPreview: false,
		maxHistory: 10,
		clearHistoryOnExit: true,
		clearPinsOnExit: false,
		get currentImage(): ImageItem | undefined {
			if (MetadataStore.currentIndex === null) return undefined
			return MetadataStore.images[MetadataStore.currentIndex]
		},
	},
	{
		filterKeys: ["currentImage", "currentIndex", "zoomPreview"],
		filterKeysStrategy: "omit",
		hooks: {
			beforeFrontendSync(state) {
				console.log("fe sync")
				if (typeof state !== "object" || state === null) return state

				if ("images" in state && Array.isArray(state.images)) {
					state.images = state.images.map((im) => {
						if (im instanceof ImageItem) return im
						return bind(proxy(new ImageItem(im as ImageItemConstructorOpts)))
					})
				}

				return state
			},
		},
	},
)
await metadataStore.start()
export const MetadataStore = metadataStore.state

type ImageItemParam = ReadonlyState<ImageItem> | ImageItem | number | null

getCurrentWindow().onCloseRequested(async (e) => {
	e.preventDefault()
	const window = getCurrentWindow()
	await window.hide()
	await cleanUp()
	await window.destroy()
})

export async function cleanUp() {
	const clearHistory = MetadataStore.clearHistoryOnExit
	const clearPins = MetadataStore.clearPinsOnExit

	const saveIds = MetadataStore.images
		.filter((im) => {
			if (im.pin != null && !clearPins) return true
			if (!clearHistory) return true
			return false
		})
		.map((im) => im.id)

	MetadataStore.images = MetadataStore.images.filter((im) => saveIds.includes(im.id))
	await syncImageStore()
}

async function syncImageStore() {
	const ids = MetadataStore.images.map((im) => im.id)
	await ImageStore.sync(ids)
}

export function selectImage(image?: ImageItemParam) {
	if (image == null) {
		MetadataStore.currentIndex = null
	} else if (typeof image === "number") {
		if (image < 0 || image >= MetadataStore.images.length) return
		MetadataStore.currentIndex = image
	} else {
		const index = MetadataStore.images.findIndex((im) => im.id === image?.id)
		if (index === -1) return
		MetadataStore.currentIndex = index
	}
}

export function pinImage(image: ImageItemParam, value: number | boolean | null): void
export function pinImage(useCurrent: true, value: number | boolean | null): void
export function pinImage(
	imageOrCurrent: ImageItemParam | true,
	value: number | boolean | null,
): void {
	let index = -1
	if (typeof imageOrCurrent === "number") index = imageOrCurrent
	else if (imageOrCurrent === true) index = MetadataStore.currentIndex ?? -1
	else index = MetadataStore.images.findIndex((im) => im.id === imageOrCurrent?.id)

	if (index < 0 || index >= MetadataStore.images.length) return
	const storeImage = MetadataStore.images[index]
	if (!storeImage) return

	const pinValue =
		typeof value === "number" ? value : value === true ? Number.POSITIVE_INFINITY : null

	storeImage.pin = pinValue
	reconcilePins()
}

function reconcilePins() {
	const pins = MetadataStore.images
		.filter((im) => im.pin != null)
		.sort((a, b) => (a.pin ?? 0) - (b.pin ?? 0))

	pins.forEach((im, i) => {
		im.pin = i + 1
	})
}

export async function clearImages(keepTabs = false) {
	if (keepTabs) MetadataStore.images = MetadataStore.images.filter((im) => im.pin != null)
	else MetadataStore.images = []

	MetadataStore.currentIndex = MetadataStore.images.length - 1
	await syncImageStore()
}

export async function createImageItem(
	imageData: Uint8Array<ArrayBuffer>,
	type: string,
	source: ImageSource,
) {
	console.log("create image item")
	if (!imageData || !type || !source) return null
	if (imageData.length === 0) return null

	// save image to image store
	const entry = await ImageStore.save(imageData, type)
	if (!entry) return null

	const exif = await getExif(imageData.buffer)
	const dtData = getDrawThingsDataFromExif(exif)

	const item: ImageItemConstructorOpts = {
		id: entry.id,
		entry,
		source,
		loadedAt: Date.now(),
		pin: null,
		type,
		exif,
		dtData,
	}

	const imageItem = bind(proxy(new ImageItem(item)))

	const itemIndex = MetadataStore.images.push(imageItem) - 1
	selectImage(itemIndex)
	return MetadataStore.images[itemIndex]
}

/**
 * replace the given ImageItem with a new one from imageData, only if the new one has DTMetadata
 * and the original does not
 */
export async function replaceWithBetter(
	imageItem: ImageItem,
	imageData: Uint8Array<ArrayBuffer>,
	imageType: string,
	source: ImageSource,
) {
	const index = MetadataStore.images.indexOf(imageItem)
	if (index === -1) return

	const exif = await getExif(imageData.buffer)
	const dtData = getDrawThingsDataFromExif(exif)

	if (dtData && !imageItem.dtData) {
		const entry = await ImageStore.save(imageData, imageType)
		if (!entry) return

		const item: ImageItemConstructorOpts = {
			id: entry.id,
			entry,
			source,
			loadedAt: imageItem.loadedAt,
			pin: null,
			type: imageType,
			exif,
			dtData,
		}
		MetadataStore.images[index] = bind(proxy(new ImageItem(item)))
	}
	await syncImageStore()
	if (dtData) return dtData
}

export async function getExif(imagePath: string)
export async function getExif(imageDataBuffer: ArrayBuffer)
export async function getExif(arg: ArrayBuffer | string) {
	let data = typeof arg !== "string" ? arg : null

	if (data === null) data = (await readFile(arg as string)).buffer

	try {
		return await ExifReader.load(data, { async: true })
	} catch (e) {
		console.warn(e)
		return null
	}
}
