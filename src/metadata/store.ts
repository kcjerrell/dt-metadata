import { proxy } from 'valtio'
import { ImageItem, loadImage } from './useMetadata'
import { ReadonlyState } from '..'
import { ImageMetadata } from '@/types'
import { getDrawThingsDataFromExif } from './helpers'

export const Store = proxy({
  images: [] as ImageItem[],
  currentIndex: null as number | null,
  maxHistory: 10,
  zoomPreview: false,
  clearHistoryOnExist: true,
  clearPinsOnExit: true,
  currentImage: null as ImageItem | null
})

export function selectImage(image?: ReadonlyState<ImageItem> | ImageItem | number | null) {
  if (image == null) {
    Store.currentIndex = null
    Store.currentImage = null
  }
  else if (typeof image === 'number') {
    if (image < 0 || image >= Store.images.length) return
    Store.currentIndex = image
    Store.currentImage = Store.images[Store.currentIndex]
  }
  else {
    const index = Store.images.findIndex(im => im.id === image?.id)
    if (index === -1) return
    Store.currentIndex = index
    Store.currentImage = Store.images[Store.currentIndex]
  }
}

// export function selectImageTab(image: ReadonlyState<ImageItem> | ImageItem, tab: string) {
//   if (!['image', 'config', 'gen'].includes(tab)) return
//   const storeImage = Store.images.find(im => im.id === image.id)
//   if (!storeImage) return

//   storeImage.infoTab = tab as ImageItem['infoTab']
// }


export function pinImage(image: ReadonlyState<ImageItem> | ImageItem, value: number | boolean)
export function pinImage(useCurrent: true, value: number | boolean)
export function pinImage(imageOrCurrent: ReadonlyState<ImageItem> | ImageItem | true, value: number | boolean | null) {
  const image = imageOrCurrent === true ? Store.currentImage : imageOrCurrent
  const index = Store.images.findIndex(im => im.id === image?.id)
  const storeImage = Store.images[index]
  if (!storeImage) return

  let pinValue = null
  if (value === true)
    pinValue = Number.POSITIVE_INFINITY
  if (typeof value === 'number')
    pinValue = value

  storeImage.pin = pinValue
  reconcilePins()
}

function reconcilePins() {
  const pins = Store.images.filter(im => im.pin != null).sort((a, b) => a.pin! - b.pin!)
  pins.forEach((im, i) => im.pin = i + 1)
}

export function clearImages(keepTabs = false) {
  if (keepTabs) 
    Store.images = Store.images.filter(im => im.pin != null)
  else
    Store.images = []
  
  Store.currentIndex = Store.images.length - 1
  Store.currentImage = Store.images[Store.currentIndex]
}

let imageId = 0
export async function addImage(data: string | DataTransfer | Blob | Uint8Array, select = true) {
  const image = await loadImage(data)
  if (!image) return

  const dt = getDrawThingsDataFromExif(image.exif)

  const item: ImageItem = {
    id: imageId++,
    ...image,
    loadedAt: Date.now(),
    dtData: dt,
    pin: null
  }

  Store.images.push(item)
  if (select)
    selectImage(item)
}