import { getCurrentWebview } from '@tauri-apps/api/webview'
import { useMetadata } from './useMetadata'
import { useEffect, useMemo, useState } from 'react'

export function useMetadataDrop(dropzone: HTMLDivElement | null) {
  const { loadData } = useMetadata()

  const [isDragging, setIsDragging] = useState(false)

  const handlers = useMemo(() => ({}), [])

  useEffect(() => {
    try {

      const webView = getCurrentWebview()
      const unlisten = webView.onDragDropEvent(event => {
        if (event.payload.type !== 'drop' && event.payload.type !== 'over') return
        const { x, y } = event.payload.position
        const overElem = document.elementFromPoint(x, y)

        if (event.payload.type === 'over') {
          if (dropzone === overElem || dropzone?.contains(overElem)) {
            console.log('over dropzone')
            if (!isDragging) setIsDragging(true)
          } else {
            if (isDragging) setIsDragging(false)
          }
        }

        if (event.payload.type === 'drop') {
          console.log(event)
          const path = event.payload.paths[0]
          loadData(path)
        }
      })

      return () => {
        Promise.resolve(unlisten).then(r => r())
      }
    } catch (e) {
      console.warn(e)
    }
  }, [isDragging, setIsDragging, dropzone, loadData])

  return {
    isDragging,
    handlers
  }
}