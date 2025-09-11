import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect, useMemo, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { getLocalImage } from "@/utils/clipboard";
import { loadImage } from "./state/imageLoaders";
import { createImageItem } from "./store";

export function useMetadataDrop() {
	const state = useRef(null);

	if (state.current === null) {
		state.current = proxy({ isDragging: false });
	}

	const snap = useSnapshot(state.current);

	const handlers = useMemo(
		() => ({
			// onDragOver: (e: DragEvent) => {
			//   e.preventDefault()
			//   e.dataTransfer?.dropEffect = 'copy'
			// },
			// onDrop: (e: DragEvent) => {
			//   e.preventDefault()
			//   const path = e.dataTransfer?.files[0].path
			//   if (!path) return
			//   addImage(path)
			// }
		}),
		[],
	);

	useEffect(() => {
		const handleEnter = (e: DragEvent) => {
			e.preventDefault();
			state.current.isDragging = true;
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleLeave = (e: DragEvent) => {
			e.preventDefault();
			state.current.isDragging = false;
		};

		const handleDrop = async (e: DragEvent) => {
			e.preventDefault();
			state.current.isDragging = false;

			console.log(e.dataTransfer.types);
			console.log(e.dataTransfer.items);

			// const image = await getBufferImage(buffer)
			// if (image) await createImageItem(image)

			const { files, text } = await getItems(e.dataTransfer.items);
			console.log(files, text);
			const [type, data] = Object.entries(files)[0];
			loadImage({ data, type }, text);
		};

		document.addEventListener("dragenter", handleEnter);
		document.addEventListener("dragover", handleDragOver);
		document.addEventListener("dragleave", handleLeave);
		document.addEventListener("drop", handleDrop);

		return () => {
			document.removeEventListener("dragenter", handleEnter);
			document.removeEventListener("dragover", handleDragOver);
			document.removeEventListener("dragleave", handleLeave);
			document.removeEventListener("drop", handleDrop);
		};
	}, []);

	useEffect(() => {
		// return
		console.log("useMetadataDrop effect");
		const webView = getCurrentWebview();
		const unlisten = webView.onDragDropEvent(async (event) => {
			if (event.payload.type === "over") return;

			if (event.payload.type === "enter") state.current.isDragging = true;

			if (event.payload.type === "leave") state.current.isDragging = false;

			if (event.payload.type === "drop") {
				for (const path of event.payload.paths) {
					const image = await getLocalImage(path);
					if (image) await createImageItem(image);
					// await addImage(path)
				}
				state.current.isDragging = false;
			}
		});

		return () => {
			console.log("unlisten");
			Promise.resolve(unlisten).then((r) => r());
			state.current.isDragging = false;
		};
	}, []);

	return {
		isDragging: snap.isDragging,
		handlers,
	};
}

async function getItems(list: DataTransferItemList) {
	const items = Array.from(list);
	let total = items.length;

	const text = {} as Record<string, string>;
	const files = {} as Record<string, Uint8Array<ArrayBuffer>>;
	const value = { text, files };
	const { promise, resolve } = Promise.withResolvers<typeof value>();

	for (const item of items) {
		if (item.kind === "string")
			item.getAsString((data) => {
				text[item.type] = data;
				total--;
				if (total === 0) resolve(value);
			});
		else if (item.kind === "file") {
			const file = item.getAsFile();
			file.arrayBuffer().then((buffer) => {
				files[item.type] = new Uint8Array(buffer);
				total--;
				if (total === 0) resolve(value);
			});
		} else {
			total--;
			if (total === 0) resolve(value);
		}
	}

	return promise;
}
