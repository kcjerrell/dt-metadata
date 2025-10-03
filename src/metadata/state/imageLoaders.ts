import * as pathlib from "@tauri-apps/api/path"
import plist from "plist"
import { postMessage } from "@/context/Messages"
import {
	fetchImage,
	getClipboardBinary,
	getClipboardText,
	getClipboardTypes,
	getLocalImage,
} from "@/utils/clipboard"
import type { ImageItem } from "./ImageItem"
import { createImageItem, replaceWithBetter } from "./store"

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
export async function loadImage(
	imageOrGetter: ImageGetter,
	textOrGetter: TextGetter,
	source?: "clipboard" | "drop" | "open"
): Promise<boolean> {
	const fileImage = await resolveGetter(imageOrGetter)
	let imageItem: ImageItem | null = null

	if (fileImage?.data && fileImage.type) {
		imageItem = await createImageItem(fileImage.data, getImageType(fileImage.type), {
			source, 
			image: fileImage.type,
		})
		if (imageItem?.dtData) return true
	}

	// try loading text
	const text = (await resolveGetter(textOrGetter)) ?? {}

	const textItems = [] as (Parameters<typeof createImageItem> | null)[]
	const checked = [] as string[]

	for (const textType of clipboardTextTypes) {
		if (textItems.length) break
		if (!text[textType]) continue

		const { files, urls } = parseText(text[textType], textType)
		console.log({files, urls})

		for (const file of files) {
			// if (textItem) break
			if (checked.includes(file)) continue
			checked.push(file)
			console.debug("Creating image item from file", file)
			const image = await getLocalImage(file)
			if (image) {
				const textItem: Parameters<typeof createImageItem> = [
					image,
					(await pathlib.extname(file)),
					{
						source,
						file
					},
				]
				textItems.push(textItem)
			}
		}

		for (const url of urls) {
			if (textItems.length) break
			if (checked.includes(url)) continue
			checked.push(url)
			const image = await fetchImage(url)
			if (image) {
				const textItem: Parameters<typeof createImageItem> = [
					image,
					(await pathlib.extname(new URL(url).pathname)) ?? "png",
					{
						source,
						url
					},
				]
				textItems.push(textItem)
				// createImageItem(...textItem)
			}
		}
	}

	// we didn't find an image url/path, return true if an image item was found
	if (!textItems.length) return imageItem != null

	if (imageItem && textItems.length === 1) return !!(await replaceWithBetter(imageItem, ...textItems[0]))
	else return !!(Promise.all(textItems.map(textItem => createImageItem(...textItem))))
}

export function parseText(value: string, type: string) {
	let paths: string[] = []
	let text: string

	if (typeof value !== "string") return { files: [], urls: [] }

	switch (type) {
		case "NSFilenamesPboardType":
			// when copying from mac finder
			paths = plist.parse(value) as string[]
			text = paths.map((f) => `'${f}'`).join(" ")
			break
		case "public.html": {
			const text = extractImgSrc(value)
			// paths = imgSrc ? [imgSrc] : []
			break
		}
		case "public.file-url":
		case "public.url":
		case "org.chromium.source-url":
		case "public.utf8-plain-text":
			text = value
			// paths = value
			// 	.split("\n")
			// 	.map((f) => f.trim())
			// 	.filter((f) => f.length > 0)
			break
	}

	// const files = [] as string[]
	// const urls = [] as string[]

	// for (const p of paths) {
	// 	const url = getUrl(p)
	// 	if (url) {
	// 		urls.push(url)
	// 		continue
	// 	}
	// 	const localPath = getLocalPath(p)
	// 	if (localPath) files.push(localPath)
	// }

	return extractPaths(text)
}

export const clipboardTextTypes = [
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

	const msg = postMessage({
		channel: "toolbar",
		message: "Loading image...",
	})
	try {
		const success = await loadImage(getBuffer, getText)
		if (success) msg.remove()
		else msg.update("No image found", 2000)
	} catch (e) {
		console.error(e)
		msg.update("No image found", 2000)
	}
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

function getUrl(url: string) {
	try {
		const urlObj = new URL(url)

		if (
			urlObj.hostname.toLowerCase() === "media.discordapp.net" &&
			urlObj.pathname.startsWith("/attachments/")
		) {
			//	https://media.discordapp.net/attachments/1095620416065781790/1415640042264596551/ethereal_fantasy_concept_art_of_billie_piper_is_the_movie_version_of__no_mans_sky___designed_by_chris_foss___magnificent__celestial__ethereal__painterly__epic__majestic__magical__f_1061124224224.png?ex=68c93707&is=68c7e587&hm=7874aad49c772c20ef6c4fa17aa25b7837fb8cd3a05d3d3499e55c27fab26e20&=&format=webp&quality=lossless&width=1152&height=1152
			urlObj.searchParams.delete("format")
			urlObj.searchParams.delete("width")
			urlObj.searchParams.delete("height")
			urlObj.searchParams.delete("quality")
		}
		if (urlObj.protocol === "file:") return null

		return urlObj.toString()
	} catch {
		return null
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

function extractPaths(text: string): { files: string[]; urls: string[] } {
	const files: string[] = []
	const urls: string[] = []

	// Regex for detecting quoted or unquoted chunks (handles spaces inside quotes)
	const chunkRegex = /'([^']+)'|"([^"]+)"|(\S+)/g

	// Regex for URLs
	const urlRegex = /^https?:\/\/[^\s'"]+$/i

	// Regex for absolute Unix-style file paths (/Users/... or ~/...)
	const fileRegex = /^(\/|~\/)[\w\d@%_\-.+!#$^&*()[\]{}:;'",?=\/ ]+$/

	let match: RegExpExecArray | null = chunkRegex.exec(text)
	while (match !== null) {
		const candidate = (match[1] || match[2] || match[3] || "").trim()

		if (!candidate) {
			match = chunkRegex.exec(text)
			continue
		}

		if (urlRegex.test(candidate)) {
			urls.push(candidate)
		} else if (fileRegex.test(candidate)) {
			files.push(candidate)
		}
		// ❌ anything else gets ignored (random words, etc.)
		match = chunkRegex.exec(text)
	}

	return { files, urls }
}
