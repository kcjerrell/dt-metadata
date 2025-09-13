import type { PropsWithChildren } from 'react'
import { AppStateContext, useCreateAppState } from './useAppState'

function AppStateProvider(props: PropsWithChildren) {
  const { children } = props
  const cv = useCreateAppState()

  return <AppStateContext value={cv}>{children} </AppStateContext>
}

export default AppStateProvider
