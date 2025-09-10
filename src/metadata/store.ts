import { DrawThingsMetaData, ImageItem, ImageSource } from '@/types'
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
  const obj = instance as any
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(obj))

  for (const name of names) {
    const method = obj[name]
    if (name === 'constructor' || typeof method !== 'function') continue
    obj[name] = (...args: unknown[]) => method.apply(instance, args)
  }

  return instance
}

export class ImageItem {
  a: number
  b: string
  _lazyProp?: string

  constructor(a: number, b: string) {
    this.a = a
    this.b = b
  }

  get prop() {
    return `from getter: a: ${this.a}, b: ${this.b}`
  }

  getProp() {
    return `from method: a: ${this.a}, b: ${this.b}`
  }

  get lazyProp() {
    if (!this._lazyProp) {
      setTimeout(() => {
        this.setLazyProp('from lazy getter')
      }, 2000)
    }
    return this._lazyProp
  }

  setLazyProp(val: string) {
    this._lazyProp = val
  }

  toJSON() {
    return {
      a: this.a * 2,
      b: this.b + " there",
      // lazyProp: this.lazyProp,
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
    images: [] as ImageItemState[],
    imageData: {} as Record<string, ImageItemData>,
    currentIndex: null as number | null,
    zoomPreview: false,
    maxHistory: 10,
    clearHistoryOnExit: true,
    clearPinsOnExit: false,
    testThing: null as TestClass | null,
    get currentImage(): ImageItem | undefined {
      if (MetadataStore.currentIndex == null) return
      const image = MetadataStore.images[MetadataStore.currentIndex]
      if (!image) return
      const data = MetadataStore.imageData[image.id]
      return { ...image, ...data }
    },
  },
  {
    filterKeys: ['imageData', 'currentImage', 'currentIndex', 'zoomPreview'],
    filterKeysStrategy: 'omit',
    hooks: {
      beforeFrontendSync(state) {
        console.log('fe sync')
        if (typeof state !== 'object' || state === null) return state

        if ('testThing' in state && state.testThing && !(state.testThing instanceof TestClass)) {
          state.testThing = bind(proxy(new TestClass(state.testThing.a, state.testThing.b)))
        }
        return state
      },
    },
  }
)
await metadataStore.start()
export const MetadataStore = metadataStore.state
for (const image of MetadataStore.images) {
  console.log('get data for image', image.id)
  if (MetadataStore.imageData[image.id]) continue

  console.log('starting image entry getter', image.id)
  getImage(image.id).then(data => {
    console.log('updating image data entry', image.id)
    MetadataStore.imageData[image.id] = {
      ...data,
      get exif() {
        console.trace('exif getter accessed', image.id)
        ExifReader.load(data.url).then(exif => {
          console.log('exif loaded, updating image data', image.id)
          const newImageData = { ...data, exif, dtData: getDrawThingsDataFromExif(exif) }
          MetadataStore.imageData[image.id] = newImageData
        })
        return {} as ExifReader.Tags
      },
    }
  })
}

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
  const { id, thumbUrl, url } = await ImageStore.save(image.image, image.type)
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

  const data: ImageItemData = {
    id,
    exif: image.exif,
    dtData,
    url,
    thumbUrl,
  }

  MetadataStore.imageData[id] = data
  MetadataStore.images.push(item)
  selectImage(item)
}

export function getImageData(image: Pick<ImageItemState, 'id'>) {
  if (MetadataStore.imageData[image.id]) return MetadataStore.imageData[image.id]

  getImage(image.id)
}
