import { Toaster } from "@/components/ui/toaster"
import Metadata from "./Metadata"

function MetadataContainer(props) {
	const { ...restProps } = props

	return (
		<>
			<Metadata {...restProps} />
			<Toaster />
		</>
	)
}

export default MetadataContainer
