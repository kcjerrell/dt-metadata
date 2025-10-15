import { useSnapshot } from 'valtio'
import type { ImageItem } from './ImageItem'
import { MetadataStore } from './store'

const store = MetadataStore

export function useCurrentImage(): ReadonlyState<ImageItem> | undefined {
  const snap = useSnapshot(store)
  return snap.currentImage
}