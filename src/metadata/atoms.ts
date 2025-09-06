import { atom } from "jotai"
import { splitAtom } from "jotai/utils"
import { ImageItem } from './useMetadata'

const currentIndexAtom = atom(0)
const maxHistory = atom(10)
const zoomPreview = atom(false)
const clearHistoryOnExist = atom(true)
const clearPinsOnExit = atom(true)

const imagesAtom = atom([] as ImageItem[])
const imageAtomsAtom = splitAtom(imagesAtom)

const selectImageAtom = atom(null, (get, set, index: number) => {
  set(currentIndexAtom, () => index)
})

const addImageAtom = atom(null, (get, set, image: ImageItem) => {
  
})

const Atoms = {
  currentIndexAtom,
  maxHistory,
  zoomPreview,
  clearHistoryOnExist,
  clearPinsOnExit,
  imagesAtom,
  imageAtomsAtom
}

export default Atoms