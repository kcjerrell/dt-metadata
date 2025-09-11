import { DrawThingsMetaData, ImageSource } from '@/types'
import { checkData, ImageAndData } from '@/utils/clipboard'
import ImageStore from '@/utils/imageStore'
import * as path from '@tauri-apps/api/path'
import { store } from '@tauri-store/valtio'
import ExifReader from 'exifreader'
import { ReadonlyState } from '..'
import { getDrawThingsDataFromExif } from './helpers'
import { proxy } from 'valtio'
const appDataDir = await path.appDataDir()
console.log(
  await path.localDataDir(),
  await path.appLocalDataDir(),
  await path.configDir(),
  await path.tempDir()
)

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
  const props = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))

  for (const prop of props) {
    const method = instance[prop]
    if (prop === 'constructor' || typeof method !== 'function') continue
    instance[prop] = (...args: unknown[]) => method.apply(instance, args)
  }

  return instance
}

export class ImageItem {
  id: string
  filepath?: string
  pin?: number | null
  loadedAt: number
  source: ImageSource
  type: string

  private _exif?: ExifReader.Tags | null
  private _dtData?: DrawThingsMetaData | null
  private _exifStatus?: 'pending' | 'done'
  private _entry?: Awaited<ReturnType<typeof ImageStore.get>>
  private _entryStatus?: 'pending' | 'done'

  constructor(opts: Partial<ImageItem>) {
    Object.assign(this, opts)

    if (!this.id) throw new Error('ImageItem must have an id')
    if (!this.source) throw new Error('ImageItem must have a source')
    if (!this.type) throw new Error('ImageItem must have a type')
  }

  get exif() {
    // return undefined
    console.log('exif getter accessed', this.id)

    if (!this._exif && !this._exifStatus) this.loadExif()

    return this._exif
  }

  get dtData() {
    // return undefined
    if (!this._dtData && !this._exifStatus &&this.exif) this.loadExif()

    return this._dtData
  }

  async loadExif() {
    if (this._exifStatus) return
    console.log('loading exif', this.id)
    this._exifStatus = 'pending'

    if (!this._entry) await this.loadEntry()

    try {
      const exif = await ExifReader.load(this.url)
      this._exif = exif
      this._dtData = getDrawThingsDataFromExif(exif) ?? null
      console.log('exif', exif, this._dtData)
      console.log('exif loaded, updating image data', this.id)
    } catch (e) {
      console.warn(e)
    } finally {
      this._exifStatus = 'done'
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
    this._entryStatus = 'pending'
    this._entry = await ImageStore.get(this.id)
    this._entryStatus = 'done'
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

type ImageItemState = {
  id: string
  source: ImageSource
  pin: number | null
  loadedAt: number
  type: string
}

type ImageItemData = {
  id: string
  url: string
  thumbUrl: string
  exif?: ExifReader.Tags
  dtData?: DrawThingsMetaData
}

const metadataStore = store(
  'metadata',
  {
    images: [] as ImageItem[],
    imageData: {},
    currentIndex: null as number | null,
    zoomPreview: false,
    maxHistory: 10,
    clearHistoryOnExit: true,
    clearPinsOnExit: false,
    get currentImage(): ImageItem | undefined {
      // if (MetadataStore.currentIndex == null) return
      // const image = MetadataStore.images[MetadataStore.currentIndex]
      // if (!image) return
      // const data = MetadataStore.imageData[image.id]
      // return { ...image, ...data }
      return MetadataStore.images[MetadataStore.currentIndex]
    },
  },
  {
    filterKeys: ['imageData', 'currentImage', 'currentIndex', 'zoomPreview'],
    filterKeysStrategy: 'omit',
    hooks: {
      beforeFrontendSync(state) {
        console.log('fe sync')
        if (typeof state !== 'object' || state === null) return state

        if ('images' in state && Array.isArray(state.images)) {
          state.images = state.images.map(im => {
            if (im instanceof ImageItem) return im
            return bind(proxy(new ImageItem(im)))
          })
        }

        return state
      },
    },
  }
)
await metadataStore.start()
export const MetadataStore = metadataStore.state

type ImageItemParam =
  | ReadonlyState<ImageItem | ImageItemState>
  | ImageItem
  | ImageItemState
  | number
  | null

export function selectImage(image?: ImageItemParam) {
  if (image == null) {
    MetadataStore.currentIndex = null
    // Store.currentImage = null
  } else if (typeof image === 'number') {
    if (image < 0 || image >= MetadataStore.images.length) return
    MetadataStore.currentIndex = image
    // Store.currentImage = Store.images[Store.currentIndex]
  } else {
    const index = MetadataStore.images.findIndex(im => im.id === image?.id)
    if (index === -1) return
    MetadataStore.currentIndex = index
    // Store.currentImage = Store.images[Store.currentIndex]
  }
}

export function pinImage(image: ImageItemParam, value: number | boolean)
export function pinImage(useCurrent: true, value: number | boolean)
export function pinImage(imageOrCurrent: ImageItemParam | true, value: number | boolean | null) {
  let index = -1
  if (typeof imageOrCurrent === 'number') index = imageOrCurrent
  else if (imageOrCurrent === true) index = MetadataStore.currentIndex
  else index = MetadataStore.images.findIndex(im => im.id === imageOrCurrent?.id)

  if (index < 0 || index >= MetadataStore.images.length) return
  const storeImage = MetadataStore.images[index]
  if (!storeImage) return

  let pinValue = null
  if (value === true) pinValue = Number.POSITIVE_INFINITY
  if (typeof value === 'number') pinValue = value

  storeImage.pin = pinValue
  reconcilePins()
}

function reconcilePins() {
  const pins = MetadataStore.images.filter(im => im.pin != null).sort((a, b) => a.pin! - b.pin!)
  pins.forEach((im, i) => (im.pin = i + 1))
}

export function clearImages(keepTabs = false) {
  if (keepTabs) MetadataStore.images = MetadataStore.images.filter(im => im.pin != null)
  else MetadataStore.images = []

  MetadataStore.currentIndex = MetadataStore.images.length - 1
  cleanImageData()
  // Store.currentImage = Store.images[Store.currentIndex]
}

function cleanImageData() {
  const ids = MetadataStore.images.map(im => im.id)

  for (const id of Object.keys(MetadataStore.imageData)) {
    if (!ids.includes(id)) delete MetadataStore.imageData[id]
  }
}

export async function createImageItem(image: ImageAndData) {
  console.log('create image item', image)
  if (checkData(image) === 'incomplete') return

  // save image to image store
  const entry = await ImageStore.save(image.data, image.type)
  if (!entry) return

  const { id, url, thumbUrl } = entry
  const dtData = getDrawThingsDataFromExif(image.exif)

  const item: ImageItemState = {
    id,
    // filepath: path,
    source: image.source,
    loadedAt: Date.now(),
    pin: null,
    type: image.type,
    // getData: () => Store.imageData[id],
  }

  // const data: ImageItemData = {
  //   id,
  //   exif: image.exif,
  //   dtData,
  //   url,
  //   thumbUrl,
  // }

  const imageItem = bind(proxy(new ImageItem(item)))

  // MetadataStore.imageData[id] = data
  MetadataStore.images.push(imageItem)
  selectImage(item)
}
