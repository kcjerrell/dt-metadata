import { proxy, snapshot, subscribe } from 'valtio'
import { loadImage } from './useMetadata'
import { ReadonlyState } from '..'
import { getDrawThingsDataFromExif } from './helpers'
import { ImageItem } from '@/types'
import { load } from '@tauri-apps/plugin-store'

import * as path from '@tauri-apps/api/path'
import { checkData, ImageAndData } from '@/utils/clipboard'
import { saveImage } from '@/utils/imageStore'
import { convertFileSrc } from '@tauri-apps/api/core'
import { since } from '@/devStore'
const appDataDir = await path.appDataDir()
console.log(
  await path.localDataDir(),
  await path.appLocalDataDir(),
  await path.configDir(),
  await path.tempDir()
)

async function loadStore() {
  const storage = await load(await path.join(appDataDir, 'store.json'), {
    defaults: {
      store: {
        images: [] as ImageItem[],
        currentIndex: null as number | null,
        maxHistory: 10,
        clearHistoryOnExit: true,
        clearPinsOnExit: false,
      },
    },
    autoSave: true,
  })

  const store = proxy({
    images: [] as ImageItem[],
    currentIndex: null as number | null,
    zoomPreview: false,
    maxHistory: 10,
    clearHistoryOnExit: true,
    clearPinsOnExit: false,
    get currentImage() {
      return store.images[store.currentIndex]
    },
  })

  // let initialLoad = true
  let lastser = undefined
  // subscribe(store, async () => {
  //   console.log('store changed maybe')
  //   const ser = serializeStore(store)
  //   if (hasDataChanged(ser, lastser)) {
  //     console.log('yeah it changed')
  //     await storage.set('store', ser)
  //   }
  //   lastser = ser
  //   // initialLoad = false
  // })

  return { storage, store }
}

const { storage, store } = await loadStore()
export const Store = store

export function selectImage(image?: ReadonlyState<ImageItem> | ImageItem | number | null) {
  if (image == null) {
    Store.currentIndex = null
    // Store.currentImage = null
  } else if (typeof image === 'number') {
    if (image < 0 || image >= Store.images.length) return
    Store.currentIndex = image
    // Store.currentImage = Store.images[Store.currentIndex]
  } else {
    const index = Store.images.findIndex(im => im.id === image?.id)
    if (index === -1) return
    Store.currentIndex = index
    // Store.currentImage = Store.images[Store.currentIndex]
  }
}

export function pinImage(image: ReadonlyState<ImageItem> | ImageItem, value: number | boolean)
export function pinImage(useCurrent: true, value: number | boolean)
export function pinImage(
  imageOrCurrent: ReadonlyState<ImageItem> | ImageItem | true,
  value: number | boolean | null
) {
  const image = imageOrCurrent === true ? Store.currentImage : imageOrCurrent
  const index = Store.images.findIndex(im => im.id === image?.id)
  const storeImage = Store.images[index]
  if (!storeImage) return

  let pinValue = null
  if (value === true) pinValue = Number.POSITIVE_INFINITY
  if (typeof value === 'number') pinValue = value

  storeImage.pin = pinValue
  reconcilePins()
}

function reconcilePins() {
  const pins = Store.images.filter(im => im.pin != null).sort((a, b) => a.pin! - b.pin!)
  pins.forEach((im, i) => (im.pin = i + 1))
}

export function clearImages(keepTabs = false) {
  if (keepTabs) Store.images = Store.images.filter(im => im.pin != null)
  else Store.images = []

  Store.currentIndex = Store.images.length - 1
  // Store.currentImage = Store.images[Store.currentIndex]
}

let imageId = 0
export async function addImage(data: string | DataTransfer | Blob | Uint8Array, select = true) {
  console.log('loading image from ', data)
  const image = await loadImage(data)
  if (!image) return

  const dt = getDrawThingsDataFromExif(image.exif)

  const source = image.source ?? image.path ? { file: image.path } : { clipboard: 'png' }

  const item: ImageItem = {
    id: imageId++,
    ...image,
    loadedAt: Date.now(),
    dtData: dt,
    pin: null,
    source,
    type: 'png'
  }

  Store.images.push(item)
  if (select) selectImage(item)
}

export async function createImageItem(image: ImageAndData) {
  console.log('create image item', image)
  if (checkData(image) === 'incomplete') return

  // save image to image store
  since('saveImage')
  const path = await saveImage(image.image, image.type)
  since('get dt data')
  const dtData = getDrawThingsDataFromExif(image.exif)
  since('convert file src')
  const url = convertFileSrc(path)
  // const url = 'data:image/png;base64,' + image.image

  since('createImageItem')
  const item: ImageItem = {
    id: imageId++,
    ...image,
    filepath: path,
    source: { file: path },
    loadedAt: Date.now(),
    dtData,
    pin: null,
    url,
  }

  since('push')
  Store.images.push(item)
  since('select')
  selectImage(item)
  since('done')
}

/**
 * serializes the store.
 * note: does not serialize everything, only data that should be preserved on exit
 */
function serializeStore(store: Awaited<ReturnType<typeof loadStore>>['store']) {
  const images = store.images.map(im => ({
    path: im.filepath,
    pin: im.pin,
    source: im.source,
  }))

  const ser = JSON.stringify(
    {
      images,
      currentIndex: store.currentIndex,
      maxHistory: store.maxHistory,
      clearHistoryOnExit: store.clearHistoryOnExit,
      clearPinsOnExit: store.clearPinsOnExit,
    },
    null,
    2
  )

  return ser
}

function hasDataChanged(
  data: ReturnType<typeof serializeStore>,
  previous: ReturnType<typeof serializeStore>
) {
  return JSON.stringify(data) !== JSON.stringify(previous)
}
