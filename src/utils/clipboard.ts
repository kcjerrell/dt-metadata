import { ImageMetadata, ImageSource } from '@/types'
import { invoke } from '@tauri-apps/api/core'
import { getMetaDataFromBuffer } from './metadata'
import { hasDrawThingsData } from '@/metadata/helpers'
import { createImageItem } from '@/metadata/store'
import { readFile, exists } from '@tauri-apps/plugin-fs'
import * as pathlib from '@tauri-apps/api/path'
import * as plist from 'plist'
import { since } from '@/devStore'
import { uint8ArrayToBase64 } from './helpers'

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
  image: Uint8Array
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
      image: data,
      source: { file: path },
      exif: await getMetaDataFromBuffer(data),
      hasDrawThingsData: false,
      type: await pathlib.extname(path),
    }
  } catch (_) {
    return undefined
  }
}

export async function loadFromClipboard(): Promise<void> {
  const image = await getClipboardImages()

  for (const item of image) {
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
      result.image = data
      result.source = { clipboard: 'public.png' }
      result.exif = await getMetaDataFromBuffer(data)
      result.hasDrawThingsData = hasDrawThingsData(result.exif)
      result.type = 'png'
    }
  }
  console.log('result', result)
  // if using public.png, we will assume a single result
  since('checkData')
  if (checkData(result) === 'ideal') return [result as ImageAndData]

  // look for file paths or urls
  // might contain multiple results
  const text = await getClipboardText(textTypes.filter(t => types.includes(t)))
  console.log('text', text)
  for (const [type, value] of Object.entries(text)) {
    const { files, urls } = parseText(value, type)
  }

  return undefined
}

export function checkData(data?: Partial<ImageAndData>) {
  if (!data) return 'incomplete'
  if (!data.image || data.image.length === 0) return 'incomplete'
  if (!data.exif) return 'incomplete'
  if (!data.source) return 'incomplete'

  if (data.hasDrawThingsData) return 'ideal'

  return 'partial'
}
function parseText(value: string, type: string): { files: string[]; urls: string[] } {
  let files: string[] = []
  let urls: string[] = []

  if (typeof value !== 'string') return { files, urls }

  switch (type) {
    case 'NSFilenamesPboardType':
      // macOS: newline-separated file paths
      const parsed = plist.parse(value)
      console.log(parsed)
      files = value.split('\n').map(f => f.trim()).filter(f => f.length > 0)
      break
    case 'public.file-url':
    case 'public.url':
    case 'org.chromium.source-url':
      // URLs, possibly file URLs
      urls = value.split('\n').map(u => u.trim()).filter(u => u.length > 0)
      // Extract file paths from file URLs
      files = urls.filter(u => u.startsWith('file://')).map(u => decodeURIComponent(u.replace('file://', '')))
      break
    case 'public.utf8-plain-text':
      // Try to detect file paths or URLs in plain text
      const lines = value.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      for (const line of lines) {
        if (line.startsWith('file://')) {
          files.push(decodeURIComponent(line.replace('file://', '')))
          urls.push(line)
        } else if (/^https?:\/\//.test(line)) {
          urls.push(line)
        } else if (/^\/|^[A-Za-z]:\\/.test(line)) {
          files.push(line)
        }
      }
      break
    default:
      break
  }

  return { files, urls }
}

