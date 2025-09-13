import type { ImageSource } from "@/types"
import { convertFileSrc, invoke } from "@tauri-apps/api/core"
import { getMetaDataFromBuffer } from "./metadata"
import { hasDrawThingsData } from "@/metadata/helpers"
import { createImageItem } from "@/metadata/state/store"
import { readFile, exists } from "@tauri-apps/plugin-fs"
import * as pathlib from "@tauri-apps/api/path"
import * as plist from "plist"
import { since } from "@/devStore"

type PasteboardNames = "general" | "drag"
export async function getClipboardTypes(pasteboard?: PasteboardNames): Promise<string[]> {
	return await invoke("read_clipboard_types", { pasteboard })
}

export async function getClipboardText(
	types: string[],
	pasteboard?: PasteboardNames,
): Promise<Record<string, string>> {
	return await invoke("read_clipboard_strings", { types: types, pasteboard })
}

export async function getClipboardBinary(
	type: string,
	pasteboard?: PasteboardNames,
): Promise<Uint8Array<ArrayBuffer>> {
	const data = await invoke("read_clipboard_binary", { ty: type, pasteboard })

	if (data && Array.isArray(data)) {
		return new Uint8Array(data)
	}
}

export type ImageAndData = {
	data: Uint8Array
	source: ImageSource
	exif: ExifReader.Tags
	hasDrawThingsData: boolean
	type: string
}

export async function getLocalImage(path: string): Promise<Uint8Array<ArrayBuffer> | undefined> {
	// console.log(path)
	// console.log(await exists(path))
	// try {
	// 	if (!(await exists(path))) return
	// 	const data = await readFile(path)
	// 	return data
	// } catch {
	// 	return undefined
	// }
	try {
		const asset = convertFileSrc(path)
		const data = await fetch(asset)
		if (data) return await new Uint8Array(await data.arrayBuffer())
	} catch (e) {
		console.error(e)
	}
}

export async function getBufferImage(buffer: Uint8Array): Promise<ImageAndData | undefined> {
	try {
		return {
			data: buffer,
			source: { clipboard: "png" },
			exif: await getMetaDataFromBuffer(buffer),
			hasDrawThingsData: false,
			type: "png",
		}
	} catch (e) {
		console.warn(e)
		return undefined
	}
}

const textTypes = [
	"NSFilenamesPboardType",
	"public.utf8-plain-text",
	"org.chromium.source-url",
	"public.file-url",
	"public.url",
]

export async function fetchImage(url: string): Promise<Uint8Array<ArrayBuffer> | undefined> {
	try {
		const data = (await invoke("fetch_image_file", {
			url: url,
		})) as Uint8Array

		if (data && Array.isArray(data)) {
			return new Uint8Array(data)
		}
	} catch (e) {
		console.error(e)
	}
}

function groupPaths(paths: string[]) {
	const urls: URL[] = []
	const files: string[] = []

	for (const path of paths) {
		try {
			const url = new URL(path)
			if (url.protocol === "file:") files.push(url.pathname)
			else urls.push(url)
		} catch (e) {
			if (path.startsWith("file://")) files.push(path)
			if (path.startsWith("/")) files.push(path)
		}
	}

	return { urls, files }
}

export function checkData(data?: Partial<ImageAndData>) {
	if (!data) return "incomplete"
	if (!data.data || data.data.length === 0) return "incomplete"
	if (!data.exif) return "incomplete"
	if (!data.source) return "incomplete"

	if (data.hasDrawThingsData) return "ideal"

	return "partial"
}

function parseText(value: string, type: string): string[] {
	let paths: string[] = []

	if (typeof value !== "string") return paths

	switch (type) {
		case "NSFilenamesPboardType":
			// when copying from mac finder
			paths = plist.parse(value) as string[]
			break
		case "public.file-url":
		case "public.url":
		case "org.chromium.source-url":
		case "public.utf8-plain-text":
		default:
			// URLs, possibly file URLs
			paths = value
				.split("\n")
				.map((f) => f.trim())
				.filter((f) => f.length > 0)
			break
		// Try to detect file paths or URLs in plain text
		// paths = value
		//   .split('\n')
		//   .map(f => f.trim())
		//   .filter(f => f.length > 0)
	}

	return paths
}
