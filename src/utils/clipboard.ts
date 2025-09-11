import { ImageSource } from '@/types'
import { invoke } from '@tauri-apps/api/core'
import { getMetaDataFromBuffer } from './metadata'
import { hasDrawThingsData } from '@/metadata/helpers'
import { createImageItem } from '@/metadata/store'
import { readFile, exists } from '@tauri-apps/plugin-fs'
import * as pathlib from '@tauri-apps/api/path'
import * as plist from 'plist'
import { since } from '@/devStore'

export async function getClipboardTypes(): Promise<string[]> {
  return await invoke('read_clipboard_types')
}

export async function getClipboardText(type: string): Promise<Record<string, string>>
export async function getClipboardText(types: string[]): Promise<Record<string, string>>
export async function getClipboardText(...types: string[]): Promise<Record<string, string>>
export async function getClipboardText(
  ...args: (string | string[])[]
): Promise<Record<string, string>> {
  const types = args.flat()
  return await invoke('read_clipboard_strings', { types: types })
}

export async function getClipboardBinary(type: string): Promise<Uint8Array<ArrayBuffer>> {
  const data = await invoke('read_clipboard_binary', { ty: type })

  if (data && Array.isArray(data)) {
    return new Uint8Array(data)
  }
}

export type ImageAndData = {
  data: Uint8Array
  source: ImageSource
  exif: ExifReader.Tags
  hasDrawThingsData: boolean
  type: string
}

export async function getLocalImage(path: string): Promise<ImageAndData | undefined> {
  console.log(path)
  console.log(await exists(path))
  try {
    if (!(await exists(path))) return
    const data = await readFile(path)
    return {
      data: data,
      source: { file: path },
      exif: await getMetaDataFromBuffer(data),
      hasDrawThingsData: false,
      type: await pathlib.extname(path),
    }
  } catch {
    return undefined
  }
}

export async function getBufferImage(buffer: Uint8Array): Promise<ImageAndData | undefined> {
  try {
    return {
      data: buffer,
      source: { clipboard: 'png' },
      exif: await getMetaDataFromBuffer(buffer),
      hasDrawThingsData: false,
      type: 'png',
    }
  } catch (e) {
    console.warn(e)
    return undefined
  }
}

export async function loadFromClipboard(): Promise<void> {
  const images = await getClipboardImages()
  if (!images) return

  for (const item of images) {
    if (!item) continue
    since('createImageItem')
    await createImageItem(item)
  }
}

const textTypes = [
  'NSFilenamesPboardType',
  'public.utf8-plain-text',
  'org.chromium.source-url',
  'public.file-url',
  'public.url',
]

export async function getClipboardImages(): Promise<(ImageAndData | undefined)[]> {
  since('getClipboardTypes')
  const types = await getClipboardTypes()
  console.log(types)

  const result: Partial<ImageAndData> = {}
  // if there a mutliple files int the clipboard, we should maybe handle all of them
  const results = [result]

  // try public.png
  if (types.includes('public.png')) {
    since('getClipboardBinary')
    const data = await getClipboardBinary('public.png')
    since('getMetaDataFromBuffer')
    if (data) {
      // const b64 = await uint8ArrayToBase64(data)
      result.data = data
      result.source = { clipboard: 'public.png' }
      result.exif = await getMetaDataFromBuffer(data)
      result.hasDrawThingsData = hasDrawThingsData(result.exif)
      result.type = 'png'
    }
  }

  // if using public.png, we will assume a single result
  since('checkData')
  if (checkData(result) === 'ideal') return [result as ImageAndData]

  // look for file paths or urls
  // might contain multiple results
  const text = await getClipboardText(textTypes.filter(t => types.includes(t)))
  const paths: string[] = []

  for (const [type, value] of Object.entries(text)) {
    paths.push(...parseText(value, type))
  }

  const uniquePaths = Array.from(new Set(paths))
  console.log(uniquePaths)

  const { urls, files } = groupPaths(uniquePaths)
  console.log({ urls, files })

  for (const url of urls) {
    try {
      const data = await fetchImage(url)
      const metaData = await getMetaDataFromBuffer(data)
      if (metaData) {
        return [
          {
            data: data,
            source: { url: url.toString() },
            exif: metaData,
            hasDrawThingsData: hasDrawThingsData(metaData),
            type: await pathlib.extname(url.pathname),
          },
        ]
      }
    } catch (e) {
      console.error(e)
    }
  }

  return undefined
}

async function fetchImage(url: URL) {
  const data = (await invoke('fetch_image_file', { url: url.toString() })) as Uint8Array

  if (data && Array.isArray(data)) {
    return new Uint8Array(data)
  }
}

function groupPaths(paths: string[]) {
  const urls: URL[] = []
  const files: string[] = []

  for (const path of paths) {
    try {
      const url = new URL(path)
      if (url.protocol === 'file:') files.push(url.pathname)
      else urls.push(url)
    } catch (e) {
      if (path.startsWith('file://')) files.push(path)
      if (path.startsWith('/')) files.push(path)
    }
  }

  return { urls, files }
}

export function checkData(data?: Partial<ImageAndData>) {
  if (!data) return 'incomplete'
  if (!data.data || data.data.length === 0) return 'incomplete'
  if (!data.exif) return 'incomplete'
  if (!data.source) return 'incomplete'

  if (data.hasDrawThingsData) return 'ideal'

  return 'partial'
}

function parseText(value: string, type: string): string[] {
  let paths: string[] = []

  if (typeof value !== 'string') return paths

  switch (type) {
    case 'NSFilenamesPboardType':
      // macOS: newline-separated file paths
      paths = plist.parse(value) as string[]
      break
    case 'public.file-url':
    case 'public.url':
    case 'org.chromium.source-url':
    case 'public.utf8-plain-text':
    default:
      // URLs, possibly file URLs
      paths = value
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)
      break
    // Try to detect file paths or URLs in plain text
    // paths = value
    //   .split('\n')
    //   .map(f => f.trim())
    //   .filter(f => f.length > 0)
  }

  return paths
}
