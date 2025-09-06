import { createContext, useContext } from "react"

type CV = {
  previousIndex: number | undefined
  selectedIndex: number | undefined
  selectedValue: string | number | undefined
  stepDuration: number
  highlightColor: string
  onSelect: (value: number | string) => void
  getIndex: (value: number | string) => number
}

const SlidingButtonGroupContext = createContext<CV | null>(null)
export const SlidingButtonGroupContextProvider = SlidingButtonGroupContext.Provider

export function useSlidingButtonGroup(): CV {
  const context = useContext(SlidingButtonGroupContext)

  if (!context) {
    throw new Error("use inside a sliding toggle group!")
  }

  return context
}
