import type { ComponentProps } from "react"
import Metadata from "./Metadata"

function MetadataContainer(props: ComponentProps<typeof Metadata>) {
	const { ...restProps } = props

	return <Metadata {...restProps} />
}

export default MetadataContainer
