import { useEffect, useRef, useState } from 'react';
import { proxy } from 'valtio';
import { areEquivalent } from './utils/helpers';

export const DevStore = proxy({
  blink: false
})

setInterval(() => {
  DevStore.blink = !DevStore.blink
}, 1000)

export function useSeries(items: unknown[], interval?: number)
export function useSeries(arg0: unknown[], interval = 500) {
  const items = useRef(null as unknown[])
  const index = useRef(0)
  const timeout = useRef(null as ReturnType<typeof setInterval>)

  const [item, setItem] = useState<typeof arg0[number]>(arg0[0])

  if (items.current === null) {
    items.current = arg0


  }

  useEffect(() => {
    console.log('use effect')
    timeout.current = setInterval(() => {
      index.current = (index.current + 1) % items.current.length
      setItem(items.current[index.current])
    }, interval)
    return () => {
      clearInterval(timeout.current)
    }
  }, [timeout])

  return item
}

let last = 0
export function since(comment: string) {
  const now = performance.now()
  console.log(comment, now - last)
  last = now
}