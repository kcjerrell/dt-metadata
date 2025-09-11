import {
	getClipboardBinary,
	getClipboardText,
	getClipboardTypes,
	type ImageAndData,
} from "@/utils/clipboard";
import { getMetaDataFromBuffer } from "@/utils/metadata";
import { hasDrawThingsData } from "../helpers";
import { createImageItem } from "../store";

type PromiseOrNot<T> = Promise<T> | T;
type GetterOrNot<T> = T | (() => T);
type ImageBuffer = Uint8Array<ArrayBuffer>;
type ImageFile = { data: ImageBuffer; type: string };
type ImageGetter = GetterOrNot<PromiseOrNot<ImageFile | null>>;
type Text = Record<string, string>;
type TextGetter = GetterOrNot<PromiseOrNot<Text | null>>;

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
) {
	const fileImage = await resolveGetter(imageOrGetter);
	let bufferImage: ImageAndData = null;

	if (fileImage?.data && fileImage.type) {
		bufferImage = {} as ImageAndData;
		bufferImage.data = fileImage.data;
		bufferImage.source = { clipboard: "public.png" };
		bufferImage.exif = await getMetaDataFromBuffer(fileImage.data);
		bufferImage.hasDrawThingsData = hasDrawThingsData(bufferImage.exif);
		bufferImage.type = getImageType(fileImage.type);
	}

	if (bufferImage?.hasDrawThingsData) {
    console.log('bufferImage', bufferImage)
		createImageItem(bufferImage);
		return;
	}

	// try loading text

	// if no meta data and buffer image, load that

	if (bufferImage) {
    console.log('bufferImage', bufferImage)
		createImageItem(bufferImage);
		return;
	}
}

const clipboardTextTypes = [
	"NSFilenamesPboardType",
	"public.utf8-plain-text",
	"org.chromium.source-url",
	"public.file-url",
	"public.url",
];
const clipboardImageTypes = ["public.png", "public.tiff", "public.jpeg"];
export async function loadFromClipboard() {
	const types = await getClipboardTypes();

	const getBuffer = async () => {
    for (const type of clipboardImageTypes) {
      if (types.includes(type)) {
        const data = await getClipboardBinary(type);
        if (data) return { data, type }
      }
    }
	};

	const getText = async () => {
		return await getClipboardText(
			clipboardTextTypes.filter((t) => types.includes(t)),
		);
	};

	await loadImage(getBuffer, getText);
}

async function resolveGetter<T extends object>(
	thing: GetterOrNot<PromiseOrNot<T | null>>,
) {
	let value: T | null = thing as T;

	if (typeof thing === "function") value = thing() as T;

	if (value instanceof Promise) value = await value;

	return value;
}

function getImageType(imageType: string) {
  let type = imageType

  if (type.startsWith('image/')) {
    type = type.split('/')[1]
  }
  if (type.startsWith('public.')) {
    type = type.split('.')[1]
  }

  if (type === 'jpeg') type = 'jpg'

  return type
}
