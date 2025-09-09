import ExifReader from 'exifreader'

export async function getMetaDataFromBuffer(buffer: Uint8Array<ArrayBufferLike>): Promise<ExifReader.Tags | undefined> {
  try {
    const exif = await ExifReader.load(buffer.buffer)
    return exif
  } catch (e) {
    console.warn(e)
    return undefined
  }
}