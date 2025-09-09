import { getCurrentWebview } from '@tauri-apps/api/webview'
// import { useMetadata } from './useMetadata'
import { useEffect, useMemo, useRef, useState } from 'react'
import { addImage, createImageItem } from './store'
import { proxy, useSnapshot } from 'valtio'
import { getLocalImage } from '@/utils/clipboard'
import { loadImage } from './useMetadata'

export function useMetadataDrop() {
  const state = useRef(null)

  if (state.current === null) {
    state.current = proxy({ isDragging: false })
  }

  const snap = useSnapshot(state.current)

  const handlers = useMemo(
    () => ({
      // onDragOver: (e: DragEvent) => {
      //   e.preventDefault()
      //   e.dataTransfer?.dropEffect = 'copy'
      // },
      // onDrop: (e: DragEvent) => {
      //   e.preventDefault()
      //   const path = e.dataTransfer?.files[0].path
      //   if (!path) return
      //   addImage(path)
      // }
    }),
    []
  )

  useEffect(() => {
    console.log('useMetadataDrop effect')
    const webView = getCurrentWebview()
    const unlisten = webView.onDragDropEvent(async event => {
      if (event.payload.type === 'over') return

      if (event.payload.type === 'enter') state.current.isDragging = true

      if (event.payload.type === 'leave') state.current.isDragging = false

      if (event.payload.type === 'drop') {
        for (const path of event.payload.paths) {
          // const image = await getLocalImage(path)
          // if (image) await createImageItem(image)
          await addImage(path)
        }
        state.current.isDragging = false
      }
    })

    return () => {
      console.log('unlisten')
      Promise.resolve(unlisten).then(r => r())
      state.current.isDragging = false
    }
  }, [])

  return {
    isDragging: snap.isDragging,
    handlers,
  }
}
