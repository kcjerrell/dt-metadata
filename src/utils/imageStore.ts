import * as path from '@tauri-apps/api/path'
import * as fs from '@tauri-apps/plugin-fs'
import { customAlphabet } from 'nanoid'
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz-'
const nanoid = customAlphabet(alphabet, 12)
nanoid() //=> "hilmnzi4kr74"

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

export async function saveImage(image: Uint8Array, type: string): Promise<string | undefined> {
  try {
    const fname = await getFileName(type)
    console.log(fname)
    await fs.writeFile(fname, image, {
      createNew: true,
    })

    return fname
  } catch (e) {
    console.error(e)
    return
  }
}

async function getFileName(ext: string) {
  let fname: string

  do {
    fname = `${nanoid()}.${ext}`
  } while (await fs.exists(await path.join(imageFolder, fname)))

  return fname
}
