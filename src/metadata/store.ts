import { DrawThingsMetaData, ImageSource } from "@/types";
import { checkData, ImageAndData } from "@/utils/clipboard";
import ImageStore, { ImageStoreEntry } from "@/utils/imageStore";
import * as path from "@tauri-apps/api/path";
import { store } from "@tauri-store/valtio";
import ExifReader from "exifreader";
import { ReadonlyState } from "..";
import { getDrawThingsDataFromExif } from "./helpers";
import { proxy } from "valtio";
const appDataDir = await path.appDataDir();
console.log(
	await path.localDataDir(),
	await path.appLocalDataDir(),
	await path.configDir(),
	await path.tempDir(),
);

// async function loadStore() {
//   const storage = await load(await path.join(appDataDir, 'store.json'), {
//     defaults: {
//       store: {
//         images: [] as ImageItem[],
//         currentIndex: null as number | null,
//         maxHistory: 10,
//         clearHistoryOnExit: true,
//         clearPinsOnExit: false,
//       },
//     },
//     autoSave: true,
//   })

//   const store = proxy({
//     images: [] as ImageItem[],
//     currentIndex: null as number | null,
//     zoomPreview: false,
//     maxHistory: 10,
//     clearHistoryOnExit: true,
//     clearPinsOnExit: false,
//     get currentImage() {
//       return store.images[store.currentIndex]
//     },
//   })

//   // let initialLoad = true
//   let lastser = undefined
//   // subscribe(store, async () => {
//   //   console.log('store changed maybe')
//   //   const ser = serializeStore(store)
//   //   if (hasDataChanged(ser, lastser)) {
//   //     console.log('yeah it changed')
//   //     await storage.set('store', ser)
//   //   }
//   //   lastser = ser
//   //   // initialLoad = false
//   // })

//   return { storage, store }
// }

// const { storage, store } = await loadStore()
export function bind<T extends object>(instance: T): T {
	// const obj = instance as any
	const props = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

	for (const prop of props) {
		const method = instance[prop];
		if (prop === "constructor" || typeof method !== "function") continue;
		instance[prop] = (...args: unknown[]) => method.apply(instance, args);
	}

	return instance;
}

type ImageItemConstructorOpts = {
	id: string;
	pin?: number | null;
	loadedAt: number;
	source: ImageSource;
	type: string;
	exif?: ExifReader.Tags | null;
	dtData?: DrawThingsMetaData | null;
	entry?: ImageStoreEntry;
};

export class ImageItem {
	id: string;
	pin?: number | null;
	loadedAt: number;
	source: ImageSource;
	type: string;

	private _exif?: ExifReader.Tags | null;
	private _dtData?: DrawThingsMetaData | null;
	private _exifStatus?: "pending" | "done";
	private _entry?: ImageStoreEntry;
	private _entryStatus?: "pending" | "done";

	constructor(opts: ImageItemConstructorOpts) {
		if (!opts.id) throw new Error("ImageItem must have an id");
		if (!opts.source) throw new Error("ImageItem must have a source");
		if (!opts.type) throw new Error("ImageItem must have a type");
		this.id = opts.id;
		this.source = opts.source;
		this.type = opts.type;
		this.pin = opts.pin;
		this.loadedAt = opts.loadedAt;

		if (opts.exif) {
			this._exif = opts.exif;
			this._dtData = opts.dtData;
			this._exifStatus = "done";
		}

		if (opts.entry) {
			this._entry = opts.entry;
			this._entryStatus = "done";
		}
	}

	get exif() {
		if (!this._exif && !this._exifStatus) this.loadExif();

		return this._exif;
	}

	get dtData() {
		// return undefined
		if (!this._dtData && !this._exifStatus && !this.exif) this.loadExif();

		return this._dtData;
	}

	async loadExif() {
		if (this._exifStatus) return;
		console.log("loading exif", this.id);
		this._exifStatus = "pending";

		if (!this._entry) await this.loadEntry();

		try {
			const exif = await ExifReader.load(this.url);
			this._exif = exif;
			this._dtData = getDrawThingsDataFromExif(exif) ?? null;
			console.log("exif", exif, this._dtData);
			console.log("exif loaded, updating image data", this.id);
		} catch (e) {
			console.warn(e);
		} finally {
			this._exifStatus = "done";
		}
	}

	get thumbUrl() {
		if (!this._entry?.thumbUrl && !this._entryStatus) this.loadEntry();
		return this._entry?.thumbUrl;
	}

	get url() {
		if (!this._entry?.url && !this._entryStatus) this.loadEntry();
		return this._entry?.url;
	}

	async loadEntry() {
		if (this._entryStatus) return;
		this._entryStatus = "pending";
		this._entry = await ImageStore.get(this.id);
		this._entryStatus = "done";
	}

	toJSON() {
		return {
			id: this.id,
			source: this.source,
			pin: this.pin,
			loadedAt: this.loadedAt,
			type: this.type,
		};
	}
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
			return MetadataStore.images[MetadataStore.currentIndex];
		},
	},
	{
		filterKeys: ["currentImage", "currentIndex", "zoomPreview"],
		filterKeysStrategy: "omit",
		hooks: {
			beforeFrontendSync(state) {
				console.log("fe sync");
				if (typeof state !== "object" || state === null) return state;

				if ("images" in state && Array.isArray(state.images)) {
					state.images = state.images.map((im) => {
						if (im instanceof ImageItem) return im;
						return bind(proxy(new ImageItem(im)));
					});
				}

				return state;
			},
		},
	},
);
await metadataStore.start();
export const MetadataStore = metadataStore.state;

type ImageItemParam = ReadonlyState<ImageItem> | ImageItem | number | null;

export function selectImage(image?: ImageItemParam) {
	if (image == null) {
		MetadataStore.currentIndex = null;
		// Store.currentImage = null
	} else if (typeof image === "number") {
		if (image < 0 || image >= MetadataStore.images.length) return;
		MetadataStore.currentIndex = image;
		// Store.currentImage = Store.images[Store.currentIndex]
	} else {
		const index = MetadataStore.images.findIndex((im) => im.id === image?.id);
		if (index === -1) return;
		MetadataStore.currentIndex = index;
		// Store.currentImage = Store.images[Store.currentIndex]
	}
}

export function pinImage(image: ImageItemParam, value: number | boolean);
export function pinImage(useCurrent: true, value: number | boolean);
export function pinImage(
	imageOrCurrent: ImageItemParam | true,
	value: number | boolean | null,
) {
	let index = -1;
	if (typeof imageOrCurrent === "number") index = imageOrCurrent;
	else if (imageOrCurrent === true) index = MetadataStore.currentIndex;
	else
		index = MetadataStore.images.findIndex(
			(im) => im.id === imageOrCurrent?.id,
		);

	if (index < 0 || index >= MetadataStore.images.length) return;
	const storeImage = MetadataStore.images[index];
	if (!storeImage) return;

	let pinValue = null;
	if (value === true) pinValue = Number.POSITIVE_INFINITY;
	if (typeof value === "number") pinValue = value;

	storeImage.pin = pinValue;
	reconcilePins();
}

function reconcilePins() {
	const pins = MetadataStore.images
		.filter((im) => im.pin != null)
		.sort((a, b) => a.pin! - b.pin!);
	pins.forEach((im, i) => {
		im.pin = i + 1;
	});
}

export function clearImages(keepTabs = false) {
	if (keepTabs)
		MetadataStore.images = MetadataStore.images.filter((im) => im.pin != null);
	else MetadataStore.images = [];

	MetadataStore.currentIndex = MetadataStore.images.length - 1;
}

export async function createImageItem(
	imageData: Uint8Array<ArrayBuffer>,
	type: string,
	source: ImageSource,
) {
	console.log("create image item");
	if (!imageData || !type || !source) return;
	if (imageData.length === 0) return;

	// save image to image store
	const entry = await ImageStore.save(imageData, type);
	if (!entry) return;

	const exif = await getExif(imageData.buffer);
	const dtData = getDrawThingsDataFromExif(exif);

	const item: ImageItemConstructorOpts = {
		id: entry.id,
    entry,
		source,
		loadedAt: Date.now(),
		pin: null,
		type,
		exif,
		dtData,
	};

	const imageItem = bind(proxy(new ImageItem(item)));

	// MetadataStore.imageData[id] = data
	const itemIndex = MetadataStore.images.push(imageItem) - 1;
	selectImage(itemIndex);
  return MetadataStore.images[itemIndex];
}

async function getExif(imageDataBuffer: ArrayBuffer) {
	try {
		return await ExifReader.load(imageDataBuffer, { async: true });
	} catch (e) {
		console.warn(e);
		return null;
	}
}
