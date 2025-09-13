import type { PropsWithChildren } from "react"
import { Toaster } from "@/components/ui/toaster"
import Metadata from "./Metadata"
import { MetadataContext, useCreateMetadataContext } from "./useMetadata"

type MetadataContainerProps = {}

function MetadataContainer(props: PropsWithChildren<MetadataContainerProps>) {
	const { ...restProps } = props
	const cv = useCreateMetadataContext()

	return (
		<MetadataContext value={cv}>
			<Metadata {...restProps} />
			<Toaster />
		</MetadataContext>
	)
}

export default MetadataContainer
