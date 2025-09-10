import { convertFileSrc } from '@tauri-apps/api/core'
import * as path from '@tauri-apps/api/path'
import * as fs from '@tauri-apps/plugin-fs'
import { store as createStore } from '@tauri-store/valtio'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

const appDataDir = await path.appDataDir()
if (!(await fs.exists(appDataDir))) {
  console.log('creating app data dir')
  await fs.mkdir(appDataDir)
}
const imageFolder = await path.join(appDataDir, 'images')
if (!(await fs.exists(imageFolder))) {
  console.log('creating image folder')
  await fs.mkdir(imageFolder)
}

type ImageStoreEntry = {
  id: string
  type: string
}

type ImageStoreImage = {
  id: string
  type: string
  url: string
  thumbUrl: string
}

const imagesStore = createStore(
  'images',
  { images: {} as Record<string, ImageStoreEntry> },
  {
    autoStart: true,
    syncStrategy: 'debounce',
    syncInterval: 1000,
    hooks: {
      beforeFrontendSync: state => {
        console.log('fe sync')
        return state
      },
    },
  }
)
const store = imagesStore.state
const _validTypes = ['png']

async function saveImage(
  image: Uint8Array,
  type: string
): Promise<ImageStoreImage | undefined> {
  if (!type || !_validTypes.includes(type)) return
  if (!image || image.length === 0) return

  try {
    const id = await getNewId()
    const fname = await getFullPath(id, type)

    await fs.writeFile(fname, image, {
      createNew: true,
    })

    const entry = { id, type }
    store.images[id] = entry

    const url = convertFileSrc(fname)
    return { ...entry, url, thumbUrl: url }
  } catch (e) {
    console.error(e)
    return
  }
}

async function getImage(id: string): Promise<ImageStoreImage | undefined> {
  const entry = store.images[id]

  if (!entry) return

  const url = convertFileSrc(await getFullPath(id, entry.type))
  // const thumbUrl = convertFileSrc(await getThumbPath(id))
  return { ...entry, url, thumbUrl: url }
}

async function getFullPath(id: string, ext: string) {
  return await path.join(imageFolder, `${id}.${ext}`)
}

async function getThumbPath(id: string) {
  return await path.join(imageFolder, `${id}_thumb.png`)
}

async function getNewId() {
  let id: string

  do {
    id = nanoid()
  } while (id in imagesStore)

  return id
}

const ImageStore = {
  save: saveImage,
  get: getImage,
  sync: async () => { }
}

export default ImageStore