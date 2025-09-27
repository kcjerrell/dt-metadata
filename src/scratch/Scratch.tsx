import { clipboardTextTypes, parseText } from "@/metadata/state/imageLoaders"
import { getClipboardTypes, getClipboardText } from "@/utils/clipboard"
import { Box, VStack } from "@chakra-ui/react"
import { invoke } from "@tauri-apps/api/core"
import { useMemo } from "react"
import { proxy, useSnapshot } from "valtio"

const store = proxy({
	file: "",
})

function Scratch(props: ChakraProps) {
	const snap = useSnapshot(store)
	const handlers = useMemo(
		() => ({
			onDrop: async (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
				const types = await getClipboardTypes("drag")
				const cliptext = await getClipboardText(
					clipboardTextTypes.filter((t) => types.includes(t)),
					"drag",
				)
				for (const [type, text] of Object.entries(cliptext)) {
					const { files } = parseText(text, type)
					if (files.length > 0) {
						store.file = files[0]
						invoke("load_metadata", { filepath: files[0] })
						return
					}
				}
			},
			onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault()
			},
		}),
		[],
	)

	return (
		<VStack {...handlers} {...props}>
			<Box>Hello</Box>
			<Box>{snap.file}</Box>
		</VStack>
	)
}

export default Scratch
