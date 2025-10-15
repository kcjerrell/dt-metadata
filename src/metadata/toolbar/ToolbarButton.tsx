
import Tooltip from "@/components/Tooltip"
import { ButtonProps, chakra, IconButton } from "@chakra-ui/react"
import { PropsWithChildren } from "react"
import { IconType } from "react-icons/lib"

interface ToolbarButtonProps extends ChakraProps {}

function ToolbarButton(props: PropsWithChildren<ButtonProps & { icon?: IconType; tip?: string }>) {
	const { icon: Icon, children, onClick, tip, ...restProps } = props

	const content = Icon ? <Icon /> : children

	return (
		<Tooltip tip={tip}>
			<IconButton
				color={"fg.3"}
				_hover={{
					bg: "unset",
					scale: 1.35,
					color: "fg.1",
				}}
				scale={1.2}
				size={"sm"}
				variant={"ghost"}
				onClick={onClick}
				{...restProps}
			>
				{content}
			</IconButton>
		</Tooltip>
	)
}

const ToolbarButtonSomething = chakra("div", {
	base: {},
})

export default ToolbarButton
