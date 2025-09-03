import { createContext, use, useContext, useEffect } from 'react'
import { useMutative } from 'use-mutative'

export const AppStateContext = createContext<ReturnType<typeof useCreateAppState> | null>(null)

export function useAppState() {
  const cv = useContext(AppStateContext)
  if (!cv) throw new Error('AppStateContext not found')
  return cv
}

export function useCreateAppState() {
  const [appState, setAppState] = useMutative({
    activeTool: 'none'
  })

  useEffect(() => {
    if (appState.activeTool === 'none') return
    // window.api.storage.save('activeTool', appState.activeTool)
    localStorage.setItem('activeTool', appState.activeTool)
  }, [appState.activeTool])

  useEffect(() => {
    setAppState(d => {
      d.activeTool = localStorage.getItem('activeTool') ?? 'none'
    })
  }, [setAppState])

  return [appState, setAppState] as const
}
