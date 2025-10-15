import type { TooltipContentProps } from "@chakra-ui/react"
import type { PropsWithChildren } from "react"
import { Tooltip } from "./ui/tooltip"

interface TooltipProps extends TooltipContentProps {
	tip?: string
}

function TooltipComponent(props: PropsWithChildren<TooltipProps>) {
	const { tip, children, ...rest } = props

	return (
		<Tooltip
			openDelay={1000}
			closeDelay={undefined}
			content={tip}
			contentProps={{ fontSize: "sm", bgColor: "bg.3", color: "fg.1", ...rest }}
			positioning={{ placement: "top" }}
		>
			{children}
		</Tooltip>
	)
}

export default TooltipComponent
