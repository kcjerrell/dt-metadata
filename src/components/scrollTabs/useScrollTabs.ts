import { Draft } from 'mutative';
import { createContext, RefObject, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useMutative } from 'use-mutative';

type ScrollTabContextState = {
  tabs: {
    label: string
    ref: RefObject<HTMLDivElement>
  }[]
  selectedTabIndex: number
}

export const ScrollTabsContext = createContext<ReturnType<typeof useCreateScrollTabs>>(undefined)

export function useCreateScrollTabs(defaultTab?: string, onChanged?: (tab: string) => void) {
  console.log('useceateScrollTabs')
  const [state, setState] = useMutative<ScrollTabContextState>({ tabs: [], selectedTabIndex: 0 })

  const selectTab = useCallback((tab: string) => {
    console.log('selected', tab)
    setState((d) => {
      const index = d.tabs.findIndex(t => t.label === tab)
      console.log(index, d.tabs)
      d.selectedTabIndex = index

      d.tabs[index].ref?.current?.scrollIntoView({ behavior: 'smooth', container: 'nearest' } as unknown)
    })
  }, [setState])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const pos = e.currentTarget.scrollLeft / e.currentTarget.clientWidth
    const index = Math.round(pos)
    if (state.selectedTabIndex === index) return
    setState(d => {
      d.selectedTabIndex = index
    })
  }, [state, setState])

  useEffect(() => {
    if (onChanged) {
      const label = state.tabs[state.selectedTabIndex]?.label
      if (label) onChanged(label)
    }
  }, [onChanged, state])

  const registerPages = useCallback((tabs: ScrollTabContextState['tabs']) => {
    console.log('registerPages', tabs)
    setState(d => {
      d.tabs = [...tabs]
      const defaultIndex = tabs.findIndex(t => t.label === defaultTab)
      if (defaultIndex !== -1) d.selectedTabIndex = defaultIndex
      else
        d.selectedTabIndex = 0
    })
  }, [setState])

  const cv = useMemo(() => ({ state, registerPages, selectTab, onScroll, selectedTab: state.tabs[state.selectedTabIndex] }), [state, registerPages, selectTab, onScroll])

  return cv
}

export function useScrollTabs() {
  return useContext(ScrollTabsContext)
}