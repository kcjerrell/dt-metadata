import { useEffect } from "react"
import { useSnapshot } from "valtio"
import { CheckRoot, ContentPane, LayoutRoot } from "./Containers"
import History from "./History"
import InfoPanel from "./infoPanel/InfoPanel"
import { loadFromPasteboard } from "./state/imageLoaders"
import { MetadataStore } from "./state/store"
import Toolbar from "./Toolbar"
import { useMetadataDrop } from "./useMetadataDrop"
import CurrentImage from './components/CurrentImage'

type MetadataComponentProps = Parameters<typeof CheckRoot>[0]

function Metadata(props: MetadataComponentProps) {
	const { ...restProps } = props

	const snap = useSnapshot(MetadataStore)

	const { isDragging, handlers } = useMetadataDrop()

	useEffect(() => {
		const handler = () => loadFromPasteboard("general")
		window.addEventListener("paste", handler)
		return () => window.removeEventListener("paste", handler)
	}, [])

	return (
		<CheckRoot
			id={"metadata"}
			// initial={{
			// 	opacity: 1,
			// 	maskImage: "radial-gradient(circle at 50px 50px, #ffffff00 0%, #ffffff00 0%, #ffffff00 100%)",
			// }}
			// animate={{
			// 	opacity: 1,
			// 	maskImage: "radial-gradient(circle at 50px 50px, #ffffffff 0%, #ffffffff 100%, #fffffff 150%)",
			// }}
			// transition={
			// 	{
			// 		duration: 0.2,
			// 		ease: "easeInOut",
			// 	} as MotionProps["transition"]
			// }

			{...handlers}
			{...restProps}
		>
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
