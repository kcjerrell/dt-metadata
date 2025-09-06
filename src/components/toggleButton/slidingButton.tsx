import { Button, ButtonProps } from "@chakra-ui/react"
import { motion } from "motion/react"
import { useSlidingButtonGroup } from "./slidingButtonContext"

const _noShadow = "0 0 0 #00000000, 0 0 0 #00000000"

type SlidingButtonComponentProps = {
  value: string | number
} & ButtonProps

const buttonProps: ButtonProps = {
  // boxShadow: _regShadow,
  color: "gray.600",
  // zIndex: 5,
  backgroundColor: "transparent",
  _hover: {
    backgroundColor: "transparent",
    // borderBottom: "1px solid blue",
  },
}

const selectedButtonProps: ButtonProps = {
  // zIndex: 10,
}

function SlidingButton(props: SlidingButtonComponentProps) {
  const { children, value, ...boxProps } = props

  // const {
  //   onSelect,
  //   selectedValue: selected,
  //   selectedIndex,
  //   getIndex,
  //   highlightColor,
  // } = useToggleButtonGroup()
  const contextValue = useSlidingButtonGroup()

  const { getIndex, highlightColor, selectedIndex } = contextValue

  const index = getIndex(value)

  const isSelected = selectedIndex === value && selectedIndex === index

  const styleProps = { ...buttonProps, ...(isSelected ? selectedButtonProps : {}) }

  return (
    <motion.div
      style={{
        alignItems: "stretch",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 0,
        // zIndex: isSelected ? 10 : 5,
        // margin: "2px",
        // padding: "2px",
        // backgroundColor: "#FF00FF22"
      }}
      className={`tbg_container_${index}`}
    >
      {/* wrap button */}
      <motion.div
        className={`tbg_button_${index}`}
        style={{
          zIndex: 5,
          transform: "translateY(3px) rotate(0)",
          backgroundColor: "#FFFFFF",
          boxShadow: _noShadow,
          border: "1px solid gray",
        }}
      >
        <Button
          onClick={() => contextValue.onSelect(value)}
          borderRadius={0}
          {...boxProps}
          {...styleProps}
          height={"30px"}
          // width={"30px"}
        >
          {children}
        </Button>
      </motion.div>

      {/* {isSelected ?
        <>
          <motion.div
            layout
            layoutId={markerId}
            className={`tbg_marker_${markerId}`}
            transition={{
              layout: {
                duration: Math.abs((previousSelectedIndex ?? selectedIndex) - selectedIndex) * transitionDuration,
                ease: _ToggleButtonGroupEaseType,
                // delay: transitionDuration
              }
            }}
            style={{ height: "3px", background: "blue", zIndex: 100 }}
          />
        </>
        : <div style={{ height: "3px", zIndex: 0, backgroundColor: "blue" }} />}
       */}
      <div style={{ height: "3px", zIndex: 0, backgroundColor: highlightColor }} />
    </motion.div>
  )
}

export default SlidingButton
