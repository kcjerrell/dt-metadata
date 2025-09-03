import { DrawThingsMetaData, ImageMetadata } from '@/types'
import { type ExifTags } from 'exifreader'
import { type Stats } from 'fs-extra'
import { createContext, useCallback, useContext } from 'react'
import { useMutative } from 'use-mutative'

export type MetadataContextState = {
  filepath?: string
  stat?: Stats
  exif?: ExifTags
  drawThingsData?: DrawThingsMetaData
  url?: string
  display?: { label: string; data: string }[]
}

export const MetadataContext = createContext<ReturnType<typeof useCreateMetadataContext>>(undefined!)

export function useCreateMetadataContext() {
  const [state, setState] = useMutative<MetadataContextState>({})

  const loadData = useCallback(
    async (data?: string | DataTransfer | Blob) => {
      const image = await loadImage(data)
      if (!image) return

      setState((d) => {
        d.filepath = image.path
        d.exif = image.exif
        d.stat = image.stat
        d.url = image.url
        d.drawThingsData = getDrawThingsDataFromExif(image.exif)
        d.display = getDisplay(d.drawThingsData)
      })
    },
    [setState]
  )

  const clearData = useCallback(() => {
    setState((d) => {
      d.filepath = undefined
      d.exif = undefined
      d.stat = undefined
      d.url = undefined
      d.drawThingsData = undefined
      d.display = undefined
    })
  }, [setState])

  return {
    state,
    setState,
    loadData,
    clearData
  }
}

export function useMetadata() {
  const cv = useContext(MetadataContext)
  if (!cv) throw new Error('useMetadata must be used within a MetadataContextProvider')
  return cv
}

async function loadImage(item?: string | DataTransfer | Blob): Promise<ImageMetadata | undefined> {
  if (!item) return Promise.resolve(undefined)

  if (typeof item === 'string') {
    const metadata = await getMetaDataFromPath(item)
    const image = await window.api.loadImage(item)
    const url = image.toDataURL()
    return { ...metadata, url }
  }

  if (item instanceof Blob) {
    const data = await blobToDataURL(item)
    const metaData = await getMetaDataFromPath(data)
    const url = data
    return { ...metaData, url }
  }

  if (item instanceof DataTransfer) {
    // check for files first
    const files = Array.from(item.files)
    if (files.length > 0) {
      const path = window.webUtils.getPathForFile(files[0])
      const metaData = await getMetaDataFromPath(path)
      const url = URL.createObjectURL(files[0])
      return { ...metaData, url }
    }
  }

  return undefined
}

async function getMetaDataFromPath(path: string): Promise<ImageMetadata | undefined> {
  try {
    const metadata = await window.api.getMetadata(path)
    console.dir(metadata)
    return { ...metadata, path }
  } catch (e) {
    console.warn(e)
    return undefined
  }
}

function getDrawThingsDataFromExif(exif?: ExifTags): DrawThingsMetaData | undefined {
  if (
    exif &&
    typeof exif.UserComment === 'object' &&
    exif.UserComment !== null &&
    'description' in exif.UserComment &&
    typeof exif.UserComment.description === 'string'
  ) {
    const data = JSON.parse(exif.UserComment.description)

    data.prompt = data.c
    delete data.c
    data.negativePrompt = data.uc
    delete data.uc
    data.config = data.v2
    delete data.v2

    return data
  }

  return undefined
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
