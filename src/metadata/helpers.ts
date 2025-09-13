import type { DrawThingsMetaData } from "@/types"

export function hasDrawThingsData(
	exif?: unknown,
	skipParse = false,
): exif is { UserComment: { description: string } } {
	try {
		if (
			exif &&
			typeof exif === "object" &&
			"UserComment" in exif &&
			exif.UserComment &&
			typeof exif.UserComment === "object" &&
			"description" in exif.UserComment &&
			typeof exif.UserComment.description === "string"
		) {
			if (!skipParse) JSON.parse(exif.UserComment.description)

			return true
		}
	} catch (_) {
		return false
	}
	return false
}

export function getDrawThingsDataFromExif(exif?: ExifReader.Tags): DrawThingsMetaData | undefined {
	if (hasDrawThingsData(exif, true)) {
		try {
			const data = JSON.parse(exif.UserComment.description)

			data.prompt = data.c
			delete data.c
			data.negativePrompt = data.uc
			delete data.uc
			data.config = data.v2
			delete data.v2

			return data
		} catch (_) {
			return undefined
		}
	}

	return undefined
}
