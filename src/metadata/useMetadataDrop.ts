import { getCurrentWebview } from '@tauri-apps/api/webview'
// import { useMetadata } from './useMetadata'
import { useEffect, useMemo, useState } from 'react'
import { Store, addImage } from './store'
import { loadImage } from './useMetadata'
import { on } from 'events'

export function useMetadataDrop(dropzone: HTMLDivElement | null) {
  const [isDragging, setIsDragging] = useState(false)

  const handlers = useMemo(() => ({
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
  }), [])

  useEffect(() => {
    try {

      const webView = getCurrentWebview()
      const unlisten = webView.onDragDropEvent(event => {
        if (event.payload.type !== 'drop' && event.payload.type !== 'over') return
        const { x, y } = event.payload.position
        const overElem = document.elementFromPoint(x, y)

        if (event.payload.type === 'over') {
          if (dropzone === overElem || dropzone?.contains(overElem)) {
            if (!isDragging) setIsDragging(true)
          } else {
            if (isDragging) setIsDragging(false)
          }
        }

        if (event.payload.type === 'drop') {
          for (const path of event.payload.paths) {
            addImage(path)
          }
          setIsDragging(false)
        }
      })

      return () => {
        Promise.resolve(unlisten).then(r => r())
        setIsDragging(false)
      }
    } catch (e) {
      console.warn(e)
    }
  }, [isDragging, setIsDragging, dropzone, addImage])

  return {
    isDragging,
    handlers
  }
}