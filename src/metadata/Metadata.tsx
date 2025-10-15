import { type ComponentProps, useEffect, useRef } from "react"
import { CheckRoot, ContentPane, LayoutRoot } from "./Containers"
import CurrentImage from "./components/CurrentImage"
import History from "./history/History"
import InfoPanel from "./infoPanel/InfoPanel"
import { loadImage2 } from "./state/imageLoaders"
import Toolbar from "./toolbar/Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"
import { selectImage } from "./state/store"

function Metadata(props: ComponentProps<typeof CheckRoot>) {
	const { ...restProps } = props
	const rootRef = useRef<HTMLDivElement>(null)
	const { handlers } = useMetadataDrop()

	useEffect(() => {
		const handler = () => loadImage2("general")
		const escHandler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				selectImage(null)
			}
		}
		window.addEventListener("paste", handler)
		window.addEventListener("keydown", escHandler, { capture: false })

		return () => {
			window.removeEventListener("paste", handler)
			window.removeEventListener("keydown", escHandler)
		}
	}, [])

	return (
		<CheckRoot ref={rootRef} id={"metadata"} {...handlers} {...restProps}>
			<LayoutRoot>
				<ContentPane>
					<Toolbar zIndex={3} />
					<CurrentImage />
					<History zIndex={2}/>
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
