import { convertFileSrc, invoke } from "@tauri-apps/api/core"
import type { ImageSource } from "@/types"

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
): Promise<Uint8Array<ArrayBuffer> | undefined> {
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
