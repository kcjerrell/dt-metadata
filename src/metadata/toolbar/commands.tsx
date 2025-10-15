import { save } from "@tauri-apps/plugin-dialog"
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener"
import { FiClipboard, FiCopy, FiFolder, FiSave, FiXCircle } from "react-icons/fi"
import type { IconType } from "react-icons/lib"
import { TbBrowser } from "react-icons/tb"
import { postMessage } from "@/context/Messages"
import ImageStore from "@/utils/imageStore"
import { loadImage2 } from "../state/imageLoaders"
import { clearAll, MetadataStore, pinImage } from "../state/store"
import PinnedIcon from "./PinnedIcon"

let separatorId = 0
const separator = () => ({ id: `separator-${separatorId++}`, separator: true }) as ToolbarCommand

export const toolbarCommands: ToolbarCommand[] = [
	{
		id: "loadFromClipboard",
		tip: "Load image from clipboard",
		icon: FiClipboard,
		action: async () => {
			try {
				await loadImage2("general")
			} catch (e) {
				console.error(e)
			}
		},
	},
	{
		id: "copyImage",
		tip: "Copy image to clipboard",
		action: async (store) => {
			if (!store.currentImage) return
			await ImageStore.copy(store.currentImage?.id)
		},
		checkVisible: (snap) => snap.currentImage != null,
		icon: FiCopy,
	},
	separator(),
	{
		id: "pinImage",
		getTip: (snap) => (snap.currentImage?.pin ? "Unpin image" : "Pin image"),
		getIcon: (snap: ReadonlyState<typeof MetadataStore>) => (
			<PinnedIcon pin={snap.currentImage?.pin} />
		),
		checkVisible: (snap) => snap.currentImage != null,
		action: async () => {
			const pin = MetadataStore.currentImage?.pin !== null ? null : true
			pinImage(true, pin)
			postMessage({
				message: pin ? "Image pinned" : "Pin removed",
				uType: "pinimage",
				duration: 2000,
				channel: "toolbar",
			})
		},
	},
	{
		id: "clearUnpinned",
		tip: "Clear unpinned images",
		action: () => clearAll(true),
		checkVisible: (snap) => snap.images.some((im) => im.pin == null),
		icon: FiXCircle,
	},
	separator(),
	{
		id: "saveImage",
		tip: "Save a copy",
		action: async (store) => {
			if (!store.currentImage) return
			const savePath = await save({
				canCreateDirectories: true,
				title: "Save image",
				filters: [{ name: "Image", extensions: [store.currentImage.type] }],
			})
			if (savePath) {
				await ImageStore.saveCopy(store.currentImage.id, savePath)
			}
		},
		checkVisible: (snap) => snap.currentImage != null,
		icon: FiSave,
	},
	{
		id: "openFolder",
		tip: "Open folder",
		slotId: "sourceOpen",
		action: async (store) => {
			if (!store.currentImage?.source?.file) return
			await revealItemInDir(store.currentImage?.source?.file)
		},
		checkVisible: (snap) => snap.currentImage?.source?.file != null,
		icon: FiFolder,
	},
	{
		id: "openUrl",
		slotId: "sourceOpen",
		tip: "Open URL",
		action: async (store) => {
			if (!store.currentImage?.source?.url) return
			await openUrl(store.currentImage.source.url)
		},
		checkVisible: (snap) => snap.currentImage?.source?.url != null,
		icon: TbBrowser,
	},
]

type SnapCallback<T = void> = (snap: ReadonlyState<typeof MetadataStore>) => T

export type ToolbarCommand = {
	id: string
	action: (state: typeof MetadataStore) => void
	checkVisible?: SnapCallback<boolean>
	tip?: string
	getTip?: SnapCallback<string>
	icon?: IconType
	getIcon?: SnapCallback<React.ReactElement>
	separator?: true
	slotId?: string
}
