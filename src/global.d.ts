import type { BoxProps } from "@chakra-ui/react"

declare global {
	type ReadonlyState<T> = {
		readonly [P in keyof T]: ReadonlyState<T[P]>
	}

	type ChakraProps = Omit<BoxProps, "direction">

	function toJSON<T>(object: T): T
}
