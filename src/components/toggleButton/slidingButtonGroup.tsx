import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react"
import { BoxProps, Flex } from "@chakra-ui/react"
import { AnimationSequence, DOMKeyframesDefinition, useAnimate } from "motion/react"
import { SlidingButtonGroupContextProvider } from "./slidingButtonContext"

// export const _ToggleButtonGroupEaseType = "linear"
const _ease = (v: number) => v
const _upShadow = "0px 1px 4px 0px #00000099, 0px 2px 6px 0px #00000066"
const _regShadow = "0px 1px 4px 0px #00000077"
// const _noShadow = "0 0 0 #00000000, 0 0 0 #00000000"

type SlidingButtonGroupComponentProps = {
  onChange?: (value: string | number | undefined) => void
  value?: string | number
  slideDuration?: number
  stepDuration?: number
  highlightColor?: string
} & Omit<BoxProps, "onChange">

// let nextMarkerId = 0

/**
 * ToggleButtonGroup wraps a set of ToggleButtons
 * Does not provide any layout for them. Create the layout as the
 * first child of this component (or vice versa)
 *
 * props:
 * - allowMultiple: boolean, whether multiple ToggleButton children can be
 *   selected at the same time. Defaults to false.
 * - onChanged: (value: ToggleButtonValue) => void, callback function that is
 *   called when the selected ToggleButton value changes.
 */
const SlidingButtonGroup = (
  props: PropsWithChildren<SlidingButtonGroupComponentProps>,
) => {
  const {
    children,
    onChange,
    value: valueProp,
    slideDuration: slideDurationProp,
    stepDuration: stepDurationProp,
    ...boxProps
  } = props

  const selectedIndex = useRef<number | undefined>(undefined)
  const previousIndex = useRef<number | undefined>(undefined)
  const values = useRef<(string | number)[]>([])

  const highlightColor = props.highlightColor ?? "#0000FF"
  const stepDuration = calcDurations(slideDurationProp, stepDurationProp, values.current.length)

  const [scope, animate] = useAnimate()

  const onSelect = useCallback(
    (value: number | string) => {
      console.log('select', value)
      if (onChange) {
        onChange(value)
      }
    },
    [onChange],
  )

  const getIndex = useCallback(
    (value: number | string) => {
      if (!values.current.includes(value)) {
        values.current.push(value)
      }
      return values.current.indexOf(value)
    },
    [values],
  )

  useEffect(() => {
    if (valueProp === undefined) return

    const index = values.current.indexOf(valueProp)
    if (index !== -1) {
      previousIndex.current = selectedIndex.current
      selectedIndex.current = index

      const animations = createAnimations(
        selectedIndex.current,
        previousIndex.current,
        stepDuration,
      )
      if (animations.length) animate(animations)
    }
  }, [animate, stepDuration, valueProp])

  const contextValue = useMemo(
    () => ({
      previousIndex: previousIndex.current,
      selectedIndex: selectedIndex.current,
      selectedValue: valueProp,
      stepDuration,
      highlightColor,
      onSelect,
      getIndex,
    }),
    [getIndex, highlightColor, onSelect, stepDuration, valueProp],
  )

  return (
    <SlidingButtonGroupContextProvider value={contextValue}>
      <Flex flexDir={"row"} ref={scope} {...boxProps}>
        {children}
      </Flex>
    </SlidingButtonGroupContextProvider>
  )
}

const variants = [
  {
    up: {
      transform: "translateX(0px) rotateX(0deg)",
      backgroundColor: "#FFF",
      boxShadow: _upShadow,
      zIndex: 10,
    },
    down: {
      transform: "translateY(4px) rotateX(0deg)",
      backgroundColor: "#FFF",
      boxShadow: _regShadow,
      zIndex: 5,
    },
  },
]

function createAnimations(current?: number, prev?: number, duration?: number) {
  const t = duration ?? 0.2 // contextValue.transitionDuration
  const frames: AnimationSequence = []
  const { up, down } = variants[0]
  // const interval = 0.05
  // const end = "+0.05"

  if (current !== undefined) {
    if (prev === undefined) prev = current

    const steps = Math.abs(prev - current) + 1
    const totalDur = steps * t

    // const nextOffset = prev > current ? -1 : 1

    function push(index: number, at: number, duration: number, change: DOMKeyframesDefinition) {
      frames.push([
        `.tbg_button_${index}`,
        change,
        { duration: duration, at: at, ease: "easeInOut" },
        // {  at: at, type: "spring", damping: 0 },
      ])
    }

    // function pushc(index: number, at: number, duration: number, change: DOMKeyframesDefinition) {
    //   frames.push([
    //     `.tbg_container_${index}`,
    //     change,
    //     { duration: duration, at: at, bounce: 1, ease: "easeInOut" },
    //     // { duration: duration, at: at, ease: "easeInOut", type: "inertia", stiffness: 500 },
    //   ])
    // }

    // iterates across buttons from previous selection to the new selection
    prange(prev, current).forEach((index, i) => {
      const at = _ease(i / steps) * totalDur

      if (index !== prev || index === current) {
        push(index, at, t, up)
      }

      if (index !== current) push(index, at + t, t, down)

      // final state for unselected buttons
      // if (i > 0) {
      //   push(prevIndex, at, t * 2, down)
      // }

      // // final state for selected buttons
      // if (index === current) {
      //   push(index, at, { transform: "translateY(0px)", backgroundColor: "#AAF" })
      // }

      // // transit state or the "popped" state
      // if (index !== current) {
      //   push(nextIndex, at, { transform: `rotate(${nextOffset * -10}deg)` })
      //   push(index, at + t / 2, { transform: `rotate(${nextOffset * +10}deg)` })
      // }
    })
  }

  // if (current !== undefined) {
  //   frames.push([`.tbg_button_${current}`, up, { duration: 0, at: "+0" }])
  // }

  return frames
}

function prange(...args: number[]) {
  let [start, end, step] = [0, 0, 0]

  if (args.length === 1) {
    ;[end] = args
    step = 1
  } else if (args.length === 2) {
    ;[start, end] = args
    step = start < end ? 1 : -1
  } else if (args.length === 3) {
    ;[start, end, step] = args
  }
  const result: number[] = []
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    result.push(i)
  }
  return result
}


export default SlidingButtonGroup

function calcDurations(slideDurationProp?: number, stepDurationProp?: number, items?: number) {
  if (slideDurationProp && items) {
    return slideDurationProp / items
  } else if (stepDurationProp) {
    return stepDurationProp
  } else {
    return 0.1
  }
}
