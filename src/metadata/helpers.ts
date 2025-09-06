import { DrawThingsMetaData } from '@/types'

export function getDrawThingsDataFromExif(exif?: ExifReader.Tags): DrawThingsMetaData | undefined {
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