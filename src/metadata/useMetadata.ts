import { convertFileSrc } from '@tauri-apps/api/core'
import { DrawThingsMetaData, ImageMetadata } from '../types'
import ExifReader from 'exifreader'
import { createContext, useCallback, useContext } from 'react'
import { useMutative } from 'use-mutative'
import { current } from 'mutative'
import { FileInfo, stat } from '@tauri-apps/plugin-fs'
import { getDrawThingsDataFromExif } from './helpers'
import { ImageItem } from "@/types"

let imageId = 0



export type MetadataContextState = {
  images: ImageItem[]
  currentIndex: number
  maxHistory: number
  zoomPreview: boolean
  clearHistoryOnExist: boolean
  clearPinsOnExit: boolean
}

const defaultContextState: MetadataContextState = {
  images: [],
  currentIndex: 0,
  maxHistory: 10,
  zoomPreview: false,
  clearHistoryOnExist: true,
  clearPinsOnExit: true
}

export type MetadataContextType = ReturnType<typeof useCreateMetadataContext>

export const MetadataContext = createContext<MetadataContextType>(undefined!)

export function useCreateMetadataContext() {
  const [state, setState] = useMutative<MetadataContextState>(defaultContextState)

  const loadData = useCallback(
    async (data?: string | DataTransfer | Blob | Uint8Array) => {
      // const image = await loadImage(data)
      // if (!image) return

      // const dt = getDrawThingsDataFromExif(image.exif)

      // const item: ImageItem = {
      //   id: imageId++,
      //   ...image,
      //   loadedAt: Date.now(),
      //   dtData: dt,
      //   pin: null
      // }

      // setState((d) => {
      //   d.images.push(item)
      //   d.images.sort(compareItems)

      //   d.currentIndex = current(d.images).indexOf(item)
      // })
    },
    [setState]
  )

  const clearData = useCallback(() => {
    setState((d) => {
      d.images = []
    })
  }, [setState])

  const setZoomPreview = useCallback((zoomPreview: boolean) => {
    setState((d) => {
      d.zoomPreview = zoomPreview
    })
  }, [setState])

  const selectImage = useCallback((image: ImageItem) => {
    setState((d) => {
      d.currentIndex = current(d.images).indexOf(image)
    })
  }, [setState])

  const setImageTab = useCallback((image: ImageItem, tab: 'image' | 'config' | 'gen') => {
    // if (!image || !tab || image.infoTab === tab) return
    // setState((d) => {
    //   const index = current(d.images).indexOf(image)
    //   d.images[index].infoTab = tab
    // })
  }, [setState])

  const pinTab = useCallback((image: ImageItem, unpin = false) => {
    setState(d => {
      const index = current(d.images).indexOf(image)
      if (unpin) {
        d.images[index].pin = null
      }
      else {
        const pins = current(d.images).filter(i => i.pin != null).length
        d.images[index].pin = pins
      }
      d.images.sort(compareItems)
    })
  }, [setState])

  return {
    state,
    setState,
    loadData,
    clearData,
    currentImage: state.images.at(state.currentIndex),
    setZoomPreview,
    selectImage,
    setImageTab,
    pinTab
  }
}

export function useMetadata() {
  const cv = useContext(MetadataContext)
  if (!cv) throw new Error('useMetadata must be used within a MetadataContextProvider')
  return cv
}

function compareItems(a: ImageItem, b: ImageItem): number {
  const aPinned = a.pin != null
  const bPinned = b.pin != null

  if (aPinned && bPinned) {
    return (a.pin ?? 0) - (b.pin ?? 0) // both pinned: low → high
  }

  if (aPinned) return -1 // a pinned, b not
  if (bPinned) return 1  // b pinned, a not

  return b.loadedAt - a.loadedAt // both unpinned: newest first
}

export async function loadImage(item?: string | DataTransfer | Blob | Uint8Array<ArrayBufferLike>): Promise<ImageMetadata | undefined> {
  if (!item) return Promise.resolve(undefined)

  //
  if (typeof item === 'string') {
    const url = convertFileSrc(item)
    console.log('loadimage', item, url)
    const metadata = await getMetaDataFromPath(url)
    const info = await stat(item)
    return { ...metadata, url, info, source: { file: item } }
  }

  if (item instanceof Blob) {
    const data = await blobToDataURL(item)
    const metaData = await getMetaDataFromPath(data)
    const url = data
    return { ...metaData, url, source: { clipboard: 'png' } }
  }

  if (item instanceof DataTransfer) {
    // check for files first
    // const files = Array.from(item.files)
    // if (files.length > 0) {
    //   const path = window.webUtils.getPathForFile(files[0])
    //   const metaData = await getMetaDataFromPath(path)
    //   const url = URL.createObjectURL(files[0])
    //   return { ...metaData, url }
    // }
  }

  if (Array.isArray(item)) {
    const buffer = new Uint8Array(item)
    const blob = new Blob([buffer], { type: 'image/png' })
    console.log('Got PNG blob of size', blob.size)
    const metadata = await getMetaDataFromBuffer(buffer)
    const url = URL.createObjectURL(blob)

    return { ...metadata, url }
  }

  return undefined
}

async function getMetaDataFromPath(path: string): Promise<ImageMetadata | undefined> {
  try {
    const exif = await ExifReader.load(path)
    return { exif }
  } catch (e) {
    console.warn(e)
    return undefined
  }
}

export async function getMetaDataFromBuffer(buffer: Uint8Array<ArrayBufferLike>): Promise<ImageMetadata | undefined> {
  try {
    const exif = await ExifReader.load(buffer.buffer)
    return { exif }
  } catch (e) {
    console.warn(e)
    return undefined
  }
}

async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getDisplay(data?: DrawThingsMetaData) {
  if (!data) return []
  return [
    { label: 'Size', data: `${data.config.width}x${data.config.height}` },
    { label: 'Seed', data: data.config.seed.toString() },
    { label: 'Steps', data: data.config.steps.toString() },
    { label: 'ImageGuidance', data: data.config.imageGuidanceScale.toString() },
    { label: 'Shift', data: data.config.shift.toString() },
    { label: 'Model', data: data.config.model.toString() },
    { label: 'Prompt', data: data.prompt },
    { label: 'Negative Prompt', data: data.negativePrompt },
    { label: 'Config', data: JSON.stringify(data.config, null, 2) }
  ]
}
