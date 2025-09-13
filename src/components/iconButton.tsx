import { Button, type ButtonProps, chakra, Text } from "@chakra-ui/react"
import Icon, { type IconName } from "./icons"
import type { IconType } from "react-icons/lib"

export interface IconButtonProps extends ButtonProps {
	iconName?: IconName
	icon?: IconType
	iconFill?: string
}

function IconButton(props: IconButtonProps) {
	const {
		iconName,
		icon,
		iconFill,
		_hover = {},
		_dark: _darkProp = {},
		size = "sm",
		...rest
	} = props
	const { _hover: _darkHover = {}, ..._dark } = _darkProp ?? {}
	const IconElem = icon ? chakra(icon) : null
	return (
		<Button
			size={size}
			fontSize={size}
			padding={"2px"}
			borderRadius={"lg"}
			// boxShadow={'0px 1px 4px -1px #00000022, 0px 2px 6px -1px #00000011'}
			background={"transparent"}
			// background={'gray.200'}
			border={"1px solid transparent"}
			color={"gray.800"}
			opacity={0.8}
			display={"flex"}
			flexDir={"row"}
			_hover={{
				opacity: 1,
				// boxShadow: 'unset',
				// border: '1px solid gray',
				backgroundColor: "gray.200",
				color: "gray.900",
				// '&>svg': {
				//   opacity: 1
				// }
				..._hover,
			}}
			_dark={{
				// background: 'gray.700',
				color: "gray.200",
				_hover: {
					backgroundColor: "gray.900",
					color: "gray.50",
					..._darkHover,
				},
				..._dark,
			}}
			{...rest}
		>
			{iconName && (
				<Icon icon={iconName} fill={iconFill} flex={"0 0 auto"} width={"100%"} height={"100%"} />
			)}
			{IconElem && <IconElem height={"100%"} width={"100%"} padding={"3px"} flex={"0 0 auto"} />}
		</Button>
	)
}

export default IconButton
