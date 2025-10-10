import { type ComponentProps, useEffect } from "react"
import { CheckRoot, ContentPane, LayoutRoot } from "./Containers"
import CurrentImage from "./components/CurrentImage"
import History from "./history/History"
import InfoPanel from "./infoPanel/InfoPanel"
import { loadImage2 } from "./state/imageLoaders"
import Toolbar from "./Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"

function Metadata(props: ComponentProps<typeof CheckRoot>) {
	const { ...restProps } = props

	const { handlers } = useMetadataDrop()

	useEffect(() => {
		const handler = () => loadImage2("general")
		window.addEventListener("paste", handler)
		return () => window.removeEventListener("paste", handler)
	}, [])

	return (
		<CheckRoot id={"metadata"} {...handlers} {...restProps}>
			<LayoutRoot>
				<ContentPane>
					<Toolbar zIndex={3} />
					<CurrentImage />
					<History />
				</ContentPane>
				<InfoPanel />
			</LayoutRoot>

			{/* <Preview
					src={currentImage?.url}
					onClick={() => {
						MetadataStore.zoomPreview = false
					}}
					show={zoomPreview}
					imgRef={imgRef}
				/> */}
		</CheckRoot>
	)
}

export default Metadata
