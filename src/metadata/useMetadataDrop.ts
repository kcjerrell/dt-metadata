import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect, useMemo, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { getLocalImage } from "@/utils/clipboard";
import { loadFromPasteboard, loadImage } from "./state/imageLoaders";
import { createImageItem } from "./store";

export function useMetadataDrop() {
	const state = useRef(null);

	if (state.current === null) {
		state.current = proxy({ isDragging: false });
	}

	const snap = useSnapshot(state.current);

	const handlers = useMemo(
		() => ({
			onDragOver: (e: DragEvent) => {
				e.preventDefault();
			},
			onDrop: (e: DragEvent) => {
				e.preventDefault();
				console.log("hey a drop");
				loadFromPasteboard("drag");
			},
		}),
		[],
	);

	// useEffect(() => {
	// 	const handleEnter = (e: DragEvent) => {
	// 		e.preventDefault();
	// 		state.current.isDragging = true;
	// 	};

	// 	const handleDragOver = (e: DragEvent) => {
	// 		e.preventDefault();
	// 	};

	// 	const handleLeave = (e: DragEvent) => {
	// 		e.preventDefault();
	// 		state.current.isDragging = false;
	// 	};

	// 	const handleDrop = async (e: DragEvent) => {
	// 		console.log('hey a drop')
	// 		e.preventDefault();
	// 		state.current.isDragging = false;

	// 		console.log(e.dataTransfer?.types)
	// 		// await setTimeout(() => loadFromPasteboard("drag"), 100) // await loadFromPasteboard("drag")

	// 		// const items = await getItems(e.dataTransfer.items);
	// 		// console.log(items);

	// 		// const getImage = async () => {
	// 		// 	const files = Object.entries(items.files);

	// 		// 	for (const [type, file] of files) {
	// 		// 		const data = await file.arrayBuffer();
	// 		// 		if (data && data.byteLength > 0)
	// 		// 			return {
	// 		// 				data: new Uint8Array(data),
	// 		// 				type,
	// 		// 			};
	// 		// 	}
	// 		// };

	// 		// loadImage(getImage, items.text);
	// 	};

	// 	console.log('adding drop handlers')
	// 	document.addEventListener("dragenter", handleEnter);
	// 	document.addEventListener("dragover", handleDragOver);
	// 	document.addEventListener("dragleave", handleLeave);
	// 	document.addEventListener("drop", handleDrop);

	// 	return () => {
	// 		console.log('removing drop handlers')
	// 		document.removeEventListener("dragenter", handleEnter);
	// 		document.removeEventListener("dragover", handleDragOver);
	// 		document.removeEventListener("dragleave", handleLeave);
	// 		document.removeEventListener("drop", handleDrop);
	// 	};
	// }, []);

	useEffect(() => {
		return;
		console.log("useMetadataDrop effect");
		const webView = getCurrentWebview();
		const unlisten = webView.onDragDropEvent(async (event) => {
			if (event.payload.type === "over") return;

			if (event.payload.type === "enter") state.current.isDragging = true;

			if (event.payload.type === "leave") state.current.isDragging = false;

			if (event.payload.type === "drop") {
				console.log("drop from tauri");
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
	const files = {} as Record<string, File>;
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
			files[file.type] = file;
			total--;
		} else {
			total--;
			if (total === 0) resolve(value);
		}
	}

	return promise;
}
