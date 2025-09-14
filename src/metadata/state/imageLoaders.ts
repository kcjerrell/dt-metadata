import plist from "plist"
import {
	fetchImage,
	getClipboardBinary,
	getClipboardText,
	getClipboardTypes,
	getLocalImage,
} from "@/utils/clipboard"
import { createImageItem, replaceWithBetter } from "./store"
import * as pathlib from "@tauri-apps/api/path"
import type { ImageItem } from "./ImageItem"

type PromiseOrNot<T> = Promise<T> | T
type GetterOrNot<T> = T | (() => T)
type ImageBuffer = Uint8Array<ArrayBuffer>
type ImageFile = { data: ImageBuffer; type: string }
type ImageGetter = GetterOrNot<PromiseOrNot<ImageFile | null>>
type Text = Record<string, string>
type TextGetter = GetterOrNot<PromiseOrNot<Text | null>>

/**
 * Since clipboard and drops have different methods of obtaining thr data,
 * the params here are pretty flexible. The buffer will be checked first. In
 * the event that the buffer does not have metadata, MAYBE the text will be checked
 * @param getBuffer either an image buffer (or a function that returns or promises one)
 * @param getText an object of text items that may contain paths/urls (or a function that returns or promises one)
 */
export async function loadImage(imageOrGetter: ImageGetter, textOrGetter: TextGetter) {
	const fileImage = await resolveGetter(imageOrGetter)
	let imageItem: ImageItem | null = null

	if (fileImage?.data && fileImage.type) {
		imageItem = await createImageItem(fileImage.data, getImageType(fileImage.type), {
			clipboard: fileImage.type,
		})
		if (imageItem?.dtData) return
	}

	// try loading text
	const text = (await resolveGetter(textOrGetter)) ?? {}

	let textItem = null as Parameters<typeof createImageItem> | null
	const checked = [] as string[]

	for (const textType of clipboardTextTypes) {
		if (textItem) break
		if (!text[textType]) continue

		const { files, urls } = parseText(text[textType], textType)
		console.log(`${textType} has ${files.length} files and ${urls.length} urls`)

		for (const file of files) {
			if (textItem) break
			if (checked.includes(file)) continue
			checked.push(file)
			console.log(`gonna try downloading ${file}`)
			const image = await getLocalImage(file)
			if (image) {
				console.log("got an image")
				textItem = [
					image,
					(await pathlib.extname(file)) ?? "png",
					{
						clipboard: textType,
					},
				]
			}
		}

		for (const url of urls) {
			if (textItem) break
			if (checked.includes(url)) continue
			checked.push(url)
			console.log(`gonna try downloading ${url}`)
			const image = await fetchImage(url)
			if (image) {
				console.log("got an image")
				textItem = [
					image,
					(await pathlib.extname(new URL(url).pathname)) ?? "png",
					{
						clipboard: textType,
					},
				]
			}
		}
	}

	if (!textItem) return

	if (imageItem) await replaceWithBetter(imageItem, ...textItem)
	else await createImageItem(...textItem)
}

function parseText(value: string, type: string) {
	let paths: string[] = []

	if (typeof value !== "string") return { files: [], urls: [] }

	switch (type) {
		case "NSFilenamesPboardType":
			// when copying from mac finder
			paths = plist.parse(value) as string[]
			break
		case "public.html": {
			const imgSrc = extractImgSrc(value)
			paths = imgSrc ? [imgSrc] : []
			break
		}
		case "public.file-url":
		case "public.url":
		case "org.chromium.source-url":
		case "public.utf8-plain-text":
			paths = value
				.split("\n")
				.map((f) => f.trim())
				.filter((f) => f.length > 0)
			break
	}

	const files = [] as string[]
	const urls = [] as string[]

	for (const p of paths) {
		if (isValidUrl(p)) urls.push(p)
		else {
			const localPath = getLocalPath(p)
			if (localPath) files.push(localPath)
		}
	}

	return { files, urls }
}

const clipboardTextTypes = [
	"NSFilenamesPboardType",
	"public.html",
	"public.utf8-plain-text",
	"org.chromium.source-url",
	"public.file-url",
	"public.url",
]
const clipboardImageTypes = ["public.png", "public.tiff", "public.jpeg"]
export async function loadFromPasteboard(pasteboard = "general" as "general" | "drag") {
	const types = await getClipboardTypes(pasteboard)

	const getBuffer = async () => {
		for (const type of clipboardImageTypes) {
			if (types.includes(type)) {
				const data = await getClipboardBinary(type, pasteboard)
				if (data) return { data, type }
			}
		}
		return null
	}

	const getText = async () => {
		return await getClipboardText(
			clipboardTextTypes.filter((t) => types.includes(t)),
			pasteboard,
		)
	}

	await loadImage(getBuffer, getText)
}

/**
 * If the arg is not a function, it will be returned. If it is a function, it will be
 * called, and awaited if necessary.
 * @param thing could be an item, or a function that returns an item
 * @returns
 */
async function resolveGetter<T>(thing: GetterOrNot<PromiseOrNot<T | null>>) {
	const value: T | null =
		typeof thing === "function" ? ((thing as () => PromiseOrNot<T | null>)() as T) : (thing as T)
	if (value instanceof Promise) return await value
	return value
}

function getImageType(imageType: string) {
	let type = imageType

	if (type.startsWith("image/")) {
		type = type.split("/")[1]
	}
	if (type.startsWith("public.")) {
		type = type.split(".")[1]
	}

	if (type === "jpeg") type = "jpg"

	return type
}

/**
 * When copying or dragging an image from chromium, public.html will have a single
 * <img> element. This will return the value of the src attribute
 * @param htmlString html containing a single img element
 * @returns img.src
 */

function extractImgSrc(htmlString: string): string | null {
	try {
		const parser = new DOMParser()
		const doc = parser.parseFromString(htmlString, "text/html")
		const img = doc.querySelector("img")
		return img?.getAttribute("src") ?? null
	} catch {
		return null
	}
}

function isValidUrl(url: string) {
	try {
		const urlObj = new URL(url)
		if (urlObj.protocol === "file:") return false
		return true
	} catch {
		return false
	}
}

export function getLocalPath(path: string) {
	let p = path

	if (p.startsWith("asset://")) p = p.slice(8)
	if (p.startsWith("file://")) p = p.slice(7)
	if (p.startsWith("/.file")) return null
	if (p.startsWith("/")) return p

	return null
}
