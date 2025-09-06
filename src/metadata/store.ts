import { proxy } from 'valtio'
import { ImageItem } from './useMetadata'

export const Store = proxy({
  images: [] as ImageItem[],
  currentIndex: null as number | null,
  maxHistory: 10,
  zoomPreview: false,
  clearHistoryOnExist: true,
  clearPinsOnExit: true,
  get currentImage() {
    return this.images[this.currentIndex]
  }
})

export function selectImage(image?: ImageItem | number | null) {
  if (typeof image === 'number') {
    Store.currentIndex = image
  } else {
    Store.currentIndex = Store.images.indexOf(image)
  }
}

export function addImage(image: ImageItem, select = true) {
  Store.images.push(image)
  if (select)
    selectImage(image)
}