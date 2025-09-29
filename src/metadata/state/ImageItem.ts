import ExifReader from "exifreader"
import type { DrawThingsMetaData, ImageSource } from "@/types"
import ImageStore, { type ImageStoreEntry } from "@/utils/imageStore"
import { getDrawThingsDataFromExif } from "../helpers"
import { ExifType, getExif } from './store'

export type ImageItemConstructorOpts = {
	id: string
	pin?: number | null
	loadedAt: number
	source: ImageSource
	type: string
	exif?: ExifType | null
	dtData?: DrawThingsMetaData | null
	entry?: ImageStoreEntry
}

export class ImageItem {
	id: string
	pin?: number | null
	loadedAt: number
	source: ImageSource
	type: string

	private _exif?: ExifType
	private _dtData?: DrawThingsMetaData | null
	private _exifStatus?: "pending" | "done"
	private _entry?: ImageStoreEntry
	private _entryStatus?: "pending" | "done"

	constructor(opts: ImageItemConstructorOpts) {
		if (!opts.id) throw new Error("ImageItem must have an id")
		if (!opts.source) throw new Error("ImageItem must have a source")
		if (!opts.type) throw new Error("ImageItem must have a type")
		this.id = opts.id
		this.source = opts.source
		this.type = opts.type
		this.pin = opts.pin
		this.loadedAt = opts.loadedAt

		if (opts.exif) {
			this._exif = opts.exif
			this._dtData = opts.dtData
			this._exifStatus = "done"
		}

		if (opts.entry) {
			this._entry = opts.entry
			this._entryStatus = "done"
		}
	}

	get exif() {
		if (!this._exif && !this._exifStatus) this.loadExif()

		return this._exif
	}

	get dtData() {
		// return undefined
		if (!this._dtData && !this._exifStatus && !this.exif) this.loadExif()

		return this._dtData
	}

	async loadExif() {
		if (this._exifStatus) return
		console.log("loading exif", this.id)
		this._exifStatus = "pending"

		if (!this._entry) await this.loadEntry()
		if (!this._entry?.url) return

		try {
			const exif = await getExif(this._entry.url)
			this._exif = exif
			this._dtData = getDrawThingsDataFromExif(exif) ?? null
		} catch (e) {
			console.warn("couldn't load exif from ", this._entry.url, e)
		} finally {
			this._exifStatus = "done"
		}
	}

	get thumbUrl() {
		if (!this._entry?.thumbUrl && !this._entryStatus) this.loadEntry()
		return this._entry?.thumbUrl
	}

	get url() {
		if (!this._entry?.url && !this._entryStatus) this.loadEntry()
		return this._entry?.url
	}

	async loadEntry() {
		if (this._entryStatus) return
		this._entryStatus = "pending"
		this._entry = await ImageStore.get(this.id)
		this._entryStatus = "done"
	}

	toJSON() {
		return {
			id: this.id,
			source: this.source,
			pin: this.pin,
			loadedAt: this.loadedAt,
			type: this.type,
		}
	}
}
