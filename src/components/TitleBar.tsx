import { useAppState } from "@/hooks/useAppState"
import { Box, Button, type ButtonProps, HStack, type StackProps } from "@chakra-ui/react"
import { MdOutlineDarkMode } from "react-icons/md"
import IconButton from "./iconButton"
import { useColorMode } from "./ui/color-mode"
import { Tools } from "@/Tools"

interface TitleBarProps extends StackProps {}

function TitleBar(props: TitleBarProps) {
	const { ...rest } = props

	const [, setAppState] = useAppState()
	const { toggleColorMode } = useColorMode()

	return (
		<HStack paddingLeft={20} bgColor={"bg.1"} color={"fg.1"} width={"100%"} {...rest}>
			<Box flex={"0 0 auto"}>DT-Tools</Box>
			<HStack flex={"1 1 auto"} justifyContent={"center"}>
				{Object.entries(Tools).map(([key, tool]) => (
					<TBButton
						label={tool.label}
						key={key}
						onClick={() =>
							setAppState((d) => {
								d.activeTool = key
							})
						}
					/>
				))}
				<IconButton icon={MdOutlineDarkMode} size={"xs"} onClick={toggleColorMode} />
			</HStack>
		</HStack>
	)
}

interface TBButtonProps extends ButtonProps {
	label: string
}

function TBButton(props: TBButtonProps) {
	const { label, ...rest } = props

	// const [isHovering, setIsHovering] = useState(false)

	return (
		<Button
			variant={"ghost"}
			size={"xs"}
			paddingBlock={0}
			// onPointerEnter={() => setIsHovering(true)}
			// onPointerLeave={() => setIsHovering(false)}
			{...rest}
		>
			{label}
		</Button>
	)
}

export default TitleBar
